<?php
require_once "resident_auth.php";

post_only();
$userId = require_resident();
$residentId = get_resident_id($conn, $userId);

$careItemId = (int)($_POST['care_item_id'] ?? 0);
$status = $_POST['status'] ?? '';
$notes = trim($_POST['notes'] ?? '');
$date = $_POST['scheduled_date'] ?? date('Y-m-d');

$allowedStatuses = ['pending', 'completed', 'missed', 'skipped'];

if ($careItemId <= 0 || !in_array($status, $allowedStatuses, true)) {
    json_response(['success' => false, 'error' => 'Invalid medication data'], 400);
}

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    json_response(['success' => false, 'error' => 'Invalid date'], 400);
}

$stmt = mysqli_prepare($conn, "
    SELECT care_item_id, item_name, scheduled_time
    FROM care_items
    WHERE care_item_id = ?
      AND resident_id = ?
      AND care_type = 'medication'
    LIMIT 1
");
mysqli_stmt_bind_param($stmt, "ii", $careItemId, $residentId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$medication = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if (!$medication) {
    json_response(['success' => false, 'error' => 'Medication not found'], 404);
}

$scheduledTime = $medication['scheduled_time'] ?: '00:00:00';
$administeredBy = 'Resident Portal';

$stmt = mysqli_prepare($conn, "
    INSERT INTO medication_logs
        (care_item_id, resident_id, scheduled_date, scheduled_time, status, taken_at, administered_by, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        taken_at = VALUES(taken_at),
        administered_by = VALUES(administered_by),
        notes = VALUES(notes)
");
$takenAt = ($status === 'completed') ? date('Y-m-d H:i:s') : null;
mysqli_stmt_bind_param(
    $stmt,
    "iissssss",
    $careItemId,
    $residentId,
    $date,
    $scheduledTime,
    $status,
    $takenAt,
    $administeredBy,
    $notes
);
mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

$title = $medication['item_name'] . ' marked ' . $status;
$description = 'Medication status updated by the resident portal.';

$stmt = mysqli_prepare($conn, "
    INSERT INTO activity_logs
        (resident_id, activity_type, title, description, recorded_by)
    VALUES (?, 'medication', ?, ?, ?)
");
mysqli_stmt_bind_param($stmt, "isss", $residentId, $title, $description, $administeredBy);
mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

json_response([
    'success' => true,
    'message' => 'Medication status updated',
    'care_item_id' => $careItemId,
    'status' => $status,
    'date' => $date
]);
?>
