<?php
declare(strict_types=1);

// Shared helpers for the billing endpoints (guardian AND resident portals).
// !! ADJUST: the path to dbconnection.php below, and the session key your login script sets ($_SESSION['user_id']).

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Uses your existing connection file (defines $conn). Same folder as this file; change the path if yours is elsewhere.
require_once __DIR__ . '/dbconnection.php';

// value sent by the page => label stored in the database
const PAYMENT_METHODS = [
    'bkash'      => 'bKash',
    'nagad'      => 'Nagad',
    'visa'       => 'Visa',
    'mastercard' => 'Mastercard',
    'bank'       => 'Bank Transfer',
];

header('Content-Type: application/json; charset=utf-8');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

function json_out(array $data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(string $message, int $status = 400): never
{
    // 'message' is read by the guardian page, 'error' by the resident portal (resident-api.js).
    json_out(['success' => false, 'message' => $message, 'error' => $message], $status);
}

function db(): mysqli
{
    global $conn;   // created by dbconnection.php
    if (!($conn instanceof mysqli)) {
        error_log('dbconnection.php did not provide a $conn mysqli connection');
        fail('Server error. Please try again later.', 500);
    }
    $conn->set_charset('utf8mb4');
    return $conn;
}

/** Logged-in user (guardian or resident), or stops with 401/403. */
function require_user(mysqli $db): array
{
    $userId = (int)($_SESSION['user_id'] ?? 0);
    if ($userId <= 0) {
        fail('Please log in to continue.', 401);
    }
    $stmt = $db->prepare("SELECT user_id, full_name, role FROM users WHERE user_id = ? AND role IN ('guardian','resident')");
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    if (!$user) {
        fail('Your account cannot access billing.', 403);
    }
    return $user;
}

/**
 * The resident this user may act for.
 *  - resident: always their own residents row
 *  - guardian: a resident linked to them (first one, or $residentId if it is theirs)
 */
function find_accessible_resident(mysqli $db, array $user, ?int $residentId = null): ?array
{
    $uid = (int)$user['user_id'];

    if ($user['role'] === 'resident') {
        $stmt = $db->prepare(
            "SELECT r.resident_id, r.service_code, r.room_number, u.full_name
             FROM residents r JOIN users u ON u.user_id = r.user_id
             WHERE r.user_id = ? LIMIT 1"
        );
        $stmt->bind_param('i', $uid);
    } else {
        $sql = "SELECT r.resident_id, r.service_code, r.room_number, u.full_name
                FROM residents r
                JOIN guardians g ON g.guardian_id = r.guardian_id
                JOIN users u ON u.user_id = r.user_id
                WHERE g.user_id = ?";
        if ($residentId) {
            $sql .= ' AND r.resident_id = ?';
        }
        $sql .= ' ORDER BY r.resident_id LIMIT 1';
        $stmt = $db->prepare($sql);
        if ($residentId) {
            $stmt->bind_param('ii', $uid, $residentId);
        } else {
            $stmt->bind_param('i', $uid);
        }
    }
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc() ?: null;
}

/** Same lookup, but stops with a 404 when there is none. */
function accessible_resident(mysqli $db, array $user, ?int $residentId = null): array
{
    $resident = find_accessible_resident($db, $user, $residentId);
    if (!$resident) {
        fail($user['role'] === 'resident'
            ? 'No resident profile found for your account.'
            : 'No resident is linked to your guardian account.', 404);
    }
    return $resident;
}

/** Name stored in activity_logs.recorded_by (residents already use 'Resident Portal'). */
function actor_label(array $user): string
{
    return $user['role'] === 'resident' ? 'Resident Portal' : $user['full_name'];
}

function money(float|string $v): string
{
    return number_format((float)$v, 2, '.', '');
}

function new_reference(string $prefix): string
{
    return $prefix . '-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(4)));
}

function log_activity(mysqli $db, int $residentId, string $title, string $description, string $by): void
{
    $stmt = $db->prepare(
        "INSERT INTO activity_logs (resident_id, activity_type, title, description, recorded_by)
         VALUES (?, 'other', ?, ?, ?)"
    );
    $stmt->bind_param('isss', $residentId, $title, $description, $by);
    $stmt->execute();
}