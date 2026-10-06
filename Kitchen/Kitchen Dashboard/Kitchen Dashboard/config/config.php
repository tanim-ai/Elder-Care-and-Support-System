<?php
declare(strict_types=1);

// This project is designed to run from the same localhost origin as the API.
// Example: http://localhost/CareDirect_Kitchen/
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => false,       // localhost/XAMPP uses HTTP
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');

const DB_HOST = '127.0.0.1';
const DB_NAME = 'caredirect';
const DB_USER = 'root';
const DB_PASS = ''; // Change if your MySQL/MariaDB root account has a password.

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        error_log('CareDirect Kitchen DB error: ' . $e->getMessage());
        jsonResponse(['success' => false, 'message' => 'Database connection failed. Check config.php and MySQL.'], 500);
    }

    return $pdo;
}

function jsonResponse(array $data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function requestMethod(string $method): void
{
    if ($_SERVER['REQUEST_METHOD'] !== strtoupper($method)) {
        header('Allow: ' . strtoupper($method));
        jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
    }
}

function requestBody(): array
{
    $raw = file_get_contents('php://input');

    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);

    if (!is_array($data)) {
        jsonResponse(['success' => false, 'message' => 'Invalid JSON request body.'], 400);
    }

    return $data;
}

function requireKitchenStaff(): int
{
    if (($_SESSION['role'] ?? '') !== 'kitchen' || empty($_SESSION['staff_id'])) {
        jsonResponse([
            'success' => false,
            'message' => 'Kitchen staff authentication required.',
            'code' => 'AUTH_REQUIRED'
        ], 401);
    }

    return (int) $_SESSION['staff_id'];
}
