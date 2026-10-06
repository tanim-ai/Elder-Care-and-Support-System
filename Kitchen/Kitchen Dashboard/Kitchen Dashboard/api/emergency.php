<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

requestMethod('POST');
$staffId = requireKitchenStaff();
$data = requestBody();

$residentId = isset($data['resident_id'])
    ? filter_var($data['resident_id'], FILTER_VALIDATE_INT)
    : null;

$message = trim((string) ($data['message'] ?? 'Kitchen emergency alert'));

if (strlen($message) > 500) {
    jsonResponse(['success' => false, 'message' => 'Emergency message is too long.'], 422);
}

$pdo = db();

if ($residentId !== null && $residentId !== false) {
    $check = $pdo->prepare("SELECT resident_id FROM residents WHERE resident_id = ?");
    $check->execute([$residentId]);
    if (!$check->fetch()) {
        jsonResponse(['success' => false, 'message' => 'Resident not found.'], 404);
    }
}

$stmt = $pdo->prepare("
    INSERT INTO kitchen_emergency_alerts
        (resident_id, staff_id, message, status)
    VALUES (?, ?, ?, 'active')
");
$stmt->execute([
    ($residentId === false ? null : $residentId),
    $staffId,
    $message
]);

jsonResponse([
    'success' => true,
    'message' => 'Emergency alert sent.',
    'alert_id' => (int) $pdo->lastInsertId()
]);
