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
    "SELECT care_item_id, item_name, dosage,
            scheduled_time, scheduled_time_2, scheduled_time_3
     FROM care_items
     WHERE resident_id = ? AND care_type = 'medication'
     ORDER BY scheduled_time ASC, care_item_id ASC");
mysqli_stmt_bind_param($stmt, "i", $resident_id);
mysqli_stmt_execute($stmt);
$items = mysqli_fetch_all(mysqli_stmt_get_result($stmt), MYSQLI_ASSOC);
mysqli_stmt_close($stmt);

$stmt = mysqli_prepare($conn,
    "SELECT care_item_id, scheduled_time, status, taken_at
     FROM medication_logs
     WHERE resident_id = ? AND scheduled_date = CURDATE()");
mysqli_stmt_bind_param($stmt, "i", $resident_id);
mysqli_stmt_execute($stmt);
$logRows = mysqli_fetch_all(mysqli_stmt_get_result($stmt), MYSQLI_ASSOC);
mysqli_stmt_close($stmt);

$logs = [];
foreach ($logRows as $l) {
    $logs[$l['care_item_id'] . '|' . $l['scheduled_time']] = $l;
}

$medications = [];
$taken = 0;

foreach ($items as $it) {
    $times = array_values(array_filter([
        $it['scheduled_time'], $it['scheduled_time_2'], $it['scheduled_time_3']
    ]));
    if (!$times) $times = [null]; 

    $name = trim(trim($it['item_name']) . ' ' . trim($it['dosage']));

    foreach ($times as $t) {
        $log = $t ? ($logs[$it['care_item_id'] . '|' . $t] ?? null) : null;
        $status = $log['status'] ?? 'pending';
        if ($status === 'completed') $taken++;

        $medications[] = [
            "name"      => $name,
            "scheduled" => $t ? substr($t, 0, 5) : null,
            "status"    => $status,
            "taken_at"  => $log['taken_at'] ?? null,
        ];
    }
}

echo json_encode([
    "medications" => $medications,
    "taken_count" => $taken,
    "total_count" => count($medications),
]);