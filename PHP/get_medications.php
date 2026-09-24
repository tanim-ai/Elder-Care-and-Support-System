<?php
/** @var mysqli $conn */
session_start();
require "dbconnection.php";

header("Content-Type: application/json");

if (empty($_SESSION['user_id'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}

$user_id = (int) $_SESSION['user_id'];

$stmt = mysqli_prepare($conn, "SELECT r.resident_id FROM residents r JOIN guardians g ON r.guardian_id = g.guardian_id WHERE g.user_id = ? LIMIT 1");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$row = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if (!$row) {
    echo json_encode(["error" => "No resident found"]);
    exit;
}

$resident_id = (int) $row['resident_id'];

$stmt = mysqli_prepare($conn,
    "SELECT ml.log_id, ci.item_name, ci.scheduled_time, ml.status, ml.taken_at
     FROM medication_logs ml
     JOIN care_items ci ON ci.care_item_id = ml.care_item_id
     WHERE ml.resident_id = ? AND ml.scheduled_date = CURDATE()
     ORDER BY ci.scheduled_time ASC");
mysqli_stmt_bind_param($stmt, "i", $resident_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$medications = [];
$takenCount = 0;
$totalCount = 0;

while ($med = mysqli_fetch_assoc($result)) {
    $totalCount++;
    if ($med['status'] === 'completed') {
        $takenCount++;
    }
    $medications[] = [
        "name"      => $med['item_name'],
        "status"    => $med['status'],
        "scheduled" => $med['scheduled_time'],
        "taken_at"  => $med['taken_at']
    ];
}
mysqli_stmt_close($stmt);

echo json_encode([
    "medications" => $medications,
    "taken_count" => $takenCount,
    "total_count" => $totalCount
]);
?>