<?php
/**
 * Shared authentication/helper file for the Resident Portal.
 * Keep this file inside the same PHP folder as dbconnection.php.
 */
session_start();
require_once "dbconnection.php";

header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

function json_response(array $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

function require_resident(): int
{
    if (empty($_SESSION['user_id'])) {
        json_response(['success' => false, 'error' => 'Not logged in'], 401);
    }

    $userId = (int) $_SESSION['user_id'];
    $role = $_SESSION['role'] ?? '';

    if ($role !== 'resident') {
        json_response(['success' => false, 'error' => 'Resident access required'], 403);
    }

    return $userId;
}

function get_resident_id(mysqli $conn, int $userId): int
{
    $stmt = mysqli_prepare($conn, "SELECT resident_id FROM residents WHERE user_id = ? LIMIT 1");
    mysqli_stmt_bind_param($stmt, "i", $userId);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);

    if (!$row) {
        json_response(['success' => false, 'error' => 'Resident profile not found'], 404);
    }

    return (int) $row['resident_id'];
}

function post_only(): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_response(['success' => false, 'error' => 'POST request required'], 405);
    }
}
?>
