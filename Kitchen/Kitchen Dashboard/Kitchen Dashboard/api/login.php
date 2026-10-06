<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/config.php';

requestMethod('POST');
$data = requestBody();

$email = strtolower(trim((string)($data['email'] ?? '')));
$password = (string)($data['password'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
    jsonResponse(['success' => false, 'message' => 'Enter a valid email and password.'], 422);
}

$stmt = db()->prepare('SELECT staff_id, full_name, email, password_hash, is_active FROM kitchen_staff WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$staff = $stmt->fetch();

if (!$staff || !(bool)$staff['is_active'] || !password_verify($password, $staff['password_hash'])) {
    jsonResponse(['success' => false, 'message' => 'Invalid email or password.'], 401);
}

session_regenerate_id(true);
$_SESSION['kitchen_staff_id'] = (int)$staff['staff_id'];
$_SESSION['kitchen_staff_name'] = $staff['full_name'];
$_SESSION['kitchen_staff_email'] = $staff['email'];

jsonResponse([
    'success' => true,
    'message' => 'Login successful.',
    'staff' => [
        'id' => (int)$staff['staff_id'],
        'name' => $staff['full_name'],
        'email' => $staff['email']
    ]
]);
