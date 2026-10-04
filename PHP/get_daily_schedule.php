<?php
/** @var mysqli $conn */
session_start();
require "dbconnection.php";

header("Content-Type: application/json");

if (empty($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "Not logged in"]);
    exit;
}

$userId = (int) $_SESSION['user_id'];

$stmt = mysqli_prepare($conn, "SELECT r.resident_id FROM residents r JOIN guardians g ON r.guardian_id = g.guardian_id WHERE g.user_id = ? LIMIT 1");
mysqli_stmt_bind_param($stmt, "i", $userId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$row = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if (!$row) {
    echo json_encode(["success" => false, "error" => "No resident found"]);
    exit;
}

$residentId = (int) $row['resident_id'];

$date = $_GET['date'] ?? date('Y-m-d');

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid date"]);
    exit;
}

$stmt = mysqli_prepare($conn, "
    SELECT
        c.care_item_id,
        c.care_type,
        c.item_name,
        c.purpose,
        c.scheduled_time,
        c.frequency,
        c.notes,
        COALESCE(m.status, 'pending') AS medication_status,
        m.taken_at
    FROM care_items c
    LEFT JOIN medication_logs m
        ON m.care_item_id = c.care_item_id
       AND m.resident_id = c.resident_id
       AND m.scheduled_date = ?
       AND m.scheduled_time = COALESCE(c.scheduled_time, '00:00:00')
    WHERE c.resident_id = ?
    ORDER BY c.scheduled_time IS NULL, c.scheduled_time, c.care_item_id
");
mysqli_stmt_bind_param($stmt, "si", $date, $residentId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$items = [];
while ($r = mysqli_fetch_assoc($result)) {
    $items[] = $r;
}
mysqli_stmt_close($stmt);

echo json_encode([
    "success" => true,
    "date" => $date,
    "schedule" => $items
]);
?>