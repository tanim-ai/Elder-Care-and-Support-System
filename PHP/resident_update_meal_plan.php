<?php
require_once "resident_auth.php";

post_only();
$userId = require_resident();
$residentId = get_resident_id($conn, $userId);

$mealType = $_POST['meal_type'] ?? '';
$mealName = trim($_POST['meal_name'] ?? '');
$mealTime = $_POST['meal_time'] ?? '';

$allowedTypes = ['breakfast', 'lunch', 'snack', 'dinner'];

if (!in_array($mealType, $allowedTypes, true)) {
    json_response(['success' => false, 'error' => 'Invalid meal type'], 400);
}
if ($mealName === '') {
    json_response(['success' => false, 'error' => 'Meal name is required'], 400);
}
if (!preg_match('/^\d{2}:\d{2}$/', $mealTime)) {
    json_response(['success' => false, 'error' => 'Invalid time'], 400);
}
$mealTime .= ':00';

$stmt = mysqli_prepare($conn, "
    INSERT INTO meal_plans (resident_id, meal_type, meal_name, meal_time)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        meal_name = VALUES(meal_name),
        meal_time = VALUES(meal_time)
");
mysqli_stmt_bind_param($stmt, "isss", $residentId, $mealType, $mealName, $mealTime);
mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

json_response([
    'success' => true,
    'message' => 'Meal plan updated',
    'meal_type' => $mealType,
    'meal_name' => $mealName,
    'meal_time' => $mealTime
]);
?>
