<?php
require_once "resident_auth.php";

$userId = require_resident();
$residentId = get_resident_id($conn, $userId);

$stmt = mysqli_prepare($conn, "
    SELECT meal_type, meal_name, meal_time
    FROM meal_plans
    WHERE resident_id = ?
");
mysqli_stmt_bind_param($stmt, "i", $residentId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$rows = [];
while ($row = mysqli_fetch_assoc($result)) {
    $rows[$row['meal_type']] = $row;
}
mysqli_stmt_close($stmt);

// Sensible defaults for any meal type not yet customized
$defaults = [
    'breakfast' => ['meal_name' => 'Breakfast', 'meal_time' => '07:30:00'],
    'lunch'     => ['meal_name' => 'Lunch',     'meal_time' => '12:00:00'],
    'snack'     => ['meal_name' => 'Snack',     'meal_time' => '15:30:00'],
    'dinner'    => ['meal_name' => 'Dinner',    'meal_time' => '18:00:00'],
];

$mealPlan = [];
foreach ($defaults as $type => $default) {
    $mealPlan[] = [
        'meal_type' => $type,
        'meal_name' => $rows[$type]['meal_name'] ?? $default['meal_name'],
        'meal_time' => $rows[$type]['meal_time'] ?? $default['meal_time'],
    ];
}

json_response([
    'success' => true,
    'meal_plan' => $mealPlan
]);
?>
