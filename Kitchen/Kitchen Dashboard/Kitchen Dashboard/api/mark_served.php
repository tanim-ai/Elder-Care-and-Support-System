<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

requestMethod('POST');
$staffId = requireKitchenStaff();
$data = requestBody();

$residentId = filter_var($data['resident_id'] ?? null, FILTER_VALIDATE_INT);
$mealType = $data['meal_type'] ?? 'lunch';
$serviceDate = $data['service_date'] ?? date('Y-m-d');

if (!$residentId || !in_array($mealType, ['breakfast', 'lunch', 'dinner', 'snack'], true)) {
    jsonResponse(['success' => false, 'message' => 'Invalid resident or meal.'], 422);
}

$date = DateTime::createFromFormat('Y-m-d', $serviceDate);
if (!$date || $date->format('Y-m-d') !== $serviceDate) {
    jsonResponse(['success' => false, 'message' => 'Invalid service date.'], 422);
}

$pdo = db();

$check = $pdo->prepare("SELECT resident_id FROM residents WHERE resident_id = ?");
$check->execute([$residentId]);
if (!$check->fetch()) {
    jsonResponse(['success' => false, 'message' => 'Resident not found.'], 404);
}

$stmt = $pdo->prepare("
    INSERT INTO kitchen_meal_service
        (resident_id, service_date, meal_type, status, served_at, served_by)
    VALUES
        (?, ?, ?, 'served', NOW(), ?)
    ON DUPLICATE KEY UPDATE
        status = 'served',
        served_at = NOW(),
        served_by = VALUES(served_by)
");
$stmt->execute([$residentId, $serviceDate, $mealType, $staffId]);

jsonResponse([
    'success' => true,
    'message' => 'Meal marked as served.',
    'resident_id' => $residentId,
    'meal_type' => $mealType,
    'service_date' => $serviceDate
]);
