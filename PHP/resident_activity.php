<?php
require_once "resident_auth.php";

post_only();
$userId = require_resident();
$residentId = get_resident_id($conn, $userId);

$type = $_POST['activity_type'] ?? 'other';
$title = trim($_POST['title'] ?? '');
$description = trim($_POST['description'] ?? '');

$allowedTypes = ['meal','medication','exercise','social','health-check','therapy','other'];

if (!in_array($type, $allowedTypes, true)) {
    json_response(['success' => false, 'error' => 'Invalid activity type'], 400);
}

if ($title === '') {
    json_response(['success' => false, 'error' => 'Activity title is required'], 400);
}

$recordedBy = 'Resident Portal';

$stmt = mysqli_prepare($conn, "
    INSERT INTO activity_logs
        (resident_id, activity_type, title, description, recorded_by)
    VALUES (?, ?, ?, ?, ?)
");
mysqli_stmt_bind_param($stmt, "issss", $residentId, $type, $title, $description, $recordedBy);
mysqli_stmt_execute($stmt);
$activityId = mysqli_insert_id($conn);
mysqli_stmt_close($stmt);

json_response([
    'success' => true,
    'message' => 'Activity saved',
    'activity_id' => $activityId
]);
?>
