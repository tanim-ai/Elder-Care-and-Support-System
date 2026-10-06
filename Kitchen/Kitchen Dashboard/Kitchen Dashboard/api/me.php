<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

requestMethod('GET');
$staffId = requireKitchenStaff();

$stmt = db()->prepare("
    SELECT staff_id, full_name, email, is_active
    FROM kitchen_staff
    WHERE staff_id = ?
    LIMIT 1
");
$stmt->execute([$staffId]);
$staff = $stmt->fetch();

if (!$staff || !(bool) $staff['is_active']) {
    $_SESSION = [];
    session_destroy();
    jsonResponse(['success' => false, 'message' => 'Session is no longer valid.'], 401);
}

jsonResponse([
    'success' => true,
    'staff' => [
        'id' => (int) $staff['staff_id'],
        'name' => $staff['full_name'],
        'email' => $staff['email']
    ]
]);
