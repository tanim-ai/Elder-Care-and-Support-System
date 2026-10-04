<?php
require_once "resident_auth.php";

$userId = require_resident();
$residentId = get_resident_id($conn, $userId);

$stmt = mysqli_prepare($conn, "
    SELECT
        u.full_name,
        u.email,
        r.resident_id,
        r.age,
        r.gender,
        r.health_conditions,
        r.service_code,
        sc.service_name,
        sc.monthly_price,
        sc.description AS service_description
    FROM residents r
    JOIN users u ON u.user_id = r.user_id
    LEFT JOIN service_categories sc ON sc.service_code = r.service_code
    WHERE r.resident_id = ?
    LIMIT 1
");
mysqli_stmt_bind_param($stmt, "i", $residentId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$resident = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if (!$resident) {
    json_response(['success' => false, 'error' => 'Resident profile not found'], 404);
}

$stmt = mysqli_prepare($conn, "
    SELECT bp_systolic, bp_diastolic, bp_status,
           heart_rate, heart_rate_status,
           blood_sugar, blood_sugar_unit, blood_sugar_status,
           blood_oxygen, temperature,
           recorded_at, recorded_by
    FROM vitals
    WHERE resident_id = ?
    ORDER BY recorded_at DESC
    LIMIT 1
");
mysqli_stmt_bind_param($stmt, "i", $residentId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$vitals = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

$stmt = mysqli_prepare($conn, "
    SELECT care_item_id, item_name, purpose, scheduled_time, frequency, notes
    FROM care_items
    WHERE resident_id = ? AND care_type = 'medication'
    ORDER BY scheduled_time IS NULL, scheduled_time
");
mysqli_stmt_bind_param($stmt, "i", $residentId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$medications = [];
while ($row = mysqli_fetch_assoc($result)) {
    $medications[] = $row;
}
mysqli_stmt_close($stmt);

$stmt = mysqli_prepare($conn, "
    SELECT activity_id, activity_type, title, description, recorded_by, activity_at
    FROM activity_logs
    WHERE resident_id = ?
      AND activity_at >= NOW() - INTERVAL 12 HOUR
    ORDER BY activity_at DESC
    LIMIT 50
");
mysqli_stmt_bind_param($stmt, "i", $residentId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$activities = [];
while ($row = mysqli_fetch_assoc($result)) {
    $activities[] = $row;
}
mysqli_stmt_close($stmt);

// Today's meal-related activity, used to check off Breakfast/Lunch/Dinner on the dashboard
$today = date('Y-m-d');
$stmt = mysqli_prepare($conn, "
    SELECT title, activity_at
    FROM activity_logs
    WHERE resident_id = ?
      AND activity_type = 'meal'
      AND DATE(activity_at) = ?
    ORDER BY activity_at ASC
");
mysqli_stmt_bind_param($stmt, "is", $residentId, $today);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$todayMeals = [];
while ($row = mysqli_fetch_assoc($result)) {
    $todayMeals[] = $row;
}
mysqli_stmt_close($stmt);

json_response([
    'success' => true,
    'resident' => $resident,
    'vitals' => $vitals ?: null,
    'medications' => $medications,
    'recent_activities' => $activities,
    'today_meals' => $todayMeals
]);
?>
