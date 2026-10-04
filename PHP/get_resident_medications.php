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
        c.item_name,
        c.dosage,
        c.purpose,
        c.slot_time AS scheduled_time,
        c.dose_no,
        c.frequency,
        c.notes,
        COALESCE(m.status, 'pending') AS status,
        m.taken_at,
        m.administered_by,
        m.notes AS log_notes
    FROM (
        SELECT ci.*, 1 AS dose_no, ci.scheduled_time AS slot_time
        FROM care_items ci
        UNION ALL
        SELECT ci.*, 2 AS dose_no, ci.scheduled_time_2 AS slot_time
        FROM care_items ci
        WHERE ci.scheduled_time_2 IS NOT NULL
        UNION ALL
        SELECT ci.*, 3 AS dose_no, ci.scheduled_time_3 AS slot_time
        FROM care_items ci
        WHERE ci.scheduled_time_3 IS NOT NULL
    ) c
    LEFT JOIN medication_logs m
        ON m.care_item_id = c.care_item_id
       AND m.resident_id = c.resident_id
       AND m.scheduled_date = ?
       AND m.scheduled_time = COALESCE(c.slot_time, '00:00:00')
    WHERE c.resident_id = ?
      AND c.care_type = 'medication'
    ORDER BY c.slot_time IS NULL, c.slot_time
");
mysqli_stmt_bind_param($stmt, "si", $date, $residentId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$medications = [];
while ($row = mysqli_fetch_assoc($result)) {
    $medications[] = $row;
}
mysqli_stmt_close($stmt);

json_response([
    'success' => true,
    'date' => $date,
    'medications' => $medications
]);
?>