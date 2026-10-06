<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

requestMethod('GET');
requireKitchenStaff();

$pdo = db();
$date = $_GET['date'] ?? date('Y-m-d');
$meal = $_GET['meal'] ?? 'lunch';

$allowedMeals = ['breakfast', 'lunch', 'dinner', 'snack'];
if (!in_array($meal, $allowedMeals, true)) {
    jsonResponse(['success' => false, 'message' => 'Invalid meal type.'], 422);
}

$stmt = $pdo->prepare("
    SELECT
        r.resident_id,
        u.full_name,
        p.room_number,
        p.diet_flag,
        p.preferences,
        ms.status AS meal_status,
        ms.served_at
    FROM residents r
    INNER JOIN users u ON u.user_id = r.user_id
    INNER JOIN kitchen_resident_profiles p ON p.resident_id = r.resident_id
    LEFT JOIN kitchen_meal_service ms
        ON ms.resident_id = r.resident_id
        AND ms.service_date = :service_date
        AND ms.meal_type = :meal_type
    ORDER BY p.room_number, u.full_name
");
$stmt->execute([
    ':service_date' => $date,
    ':meal_type' => $meal
]);
$residents = $stmt->fetchAll();

$summaryStmt = $pdo->prepare("
    SELECT
        SUM(diet_flag = 'low-salt') AS low_salt,
        SUM(diet_flag = 'sugar-free') AS sugar_free,
        SUM(diet_flag = 'regular') AS regular_diet,
        COUNT(*) AS total
    FROM kitchen_resident_profiles
");
$summaryStmt->execute();
$summary = $summaryStmt->fetch() ?: [
    'low_salt' => 0,
    'sugar_free' => 0,
    'regular_diet' => 0,
    'total' => 0
];

$nextStmt = $pdo->query("
    SELECT meal_type, service_time
    FROM kitchen_meal_schedule
    WHERE service_date = CURDATE()
      AND service_time >= CURTIME()
    ORDER BY service_time
    LIMIT 1
");
$nextMeal = $nextStmt->fetch() ?: null;

$tempStmt = $pdo->query("
    SELECT temperature_c, status, recorded_at
    FROM kitchen_cooler_readings
    ORDER BY recorded_at DESC
    LIMIT 1
");
$cooler = $tempStmt->fetch() ?: [
    'temperature_c' => null,
    'status' => 'unknown',
    'recorded_at' => null
];

$staffStmt = $pdo->query("
    SELECT
        COUNT(*) AS total,
        SUM(is_active = 1) AS active
    FROM kitchen_staff
");
$staff = $staffStmt->fetch() ?: ['total' => 0, 'active' => 0];

$pendingStmt = $pdo->prepare("
    SELECT COUNT(*) AS pending
    FROM kitchen_meal_service
    WHERE service_date = :service_date
      AND meal_type = :meal_type
      AND status <> 'served'
");
$pendingStmt->execute([
    ':service_date' => $date,
    ':meal_type' => $meal
]);
$pending = (int) ($pendingStmt->fetch()['pending'] ?? 0);

jsonResponse([
    'success' => true,
    'date' => $date,
    'meal' => $meal,
    'summary' => [
        'low_salt' => (int) ($summary['low_salt'] ?? 0),
        'sugar_free' => (int) ($summary['sugar_free'] ?? 0),
        'regular_diet' => (int) ($summary['regular_diet'] ?? 0),
        'total' => (int) ($summary['total'] ?? 0)
    ],
    'next_meal' => $nextMeal,
    'cooler' => $cooler,
    'staff' => [
        'active' => (int) ($staff['active'] ?? 0),
        'total' => (int) ($staff['total'] ?? 0)
    ],
    'pending' => $pending,
    'residents' => $residents
]);
