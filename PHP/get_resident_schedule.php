<?php
require_once "resident_auth.php";

$userId = require_resident();
$residentId = get_resident_id($conn, $userId);
$date = $_GET['date'] ?? date('Y-m-d');

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    json_response(['success' => false, 'error' => 'Invalid date'], 400);
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
while ($row = mysqli_fetch_assoc($result)) {
    $items[] = $row;
}
mysqli_stmt_close($stmt);

json_response([
    'success' => true,
    'date' => $date,
    'schedule' => $items
]);
?>
