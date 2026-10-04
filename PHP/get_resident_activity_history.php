<?php
require_once "resident_auth.php";

$userId = require_resident();
$residentId = get_resident_id($conn, $userId);

$stmt = mysqli_prepare($conn, "
    SELECT activity_id, activity_type, title, description, recorded_by, activity_at
    FROM activity_logs
    WHERE resident_id = ?
    ORDER BY activity_at DESC
");
mysqli_stmt_bind_param($stmt, "i", $residentId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$activities = [];
while ($row = mysqli_fetch_assoc($result)) {
    $activities[] = $row;
}
mysqli_stmt_close($stmt);

json_response([
    'success' => true,
    'activities' => $activities
]);
?>
