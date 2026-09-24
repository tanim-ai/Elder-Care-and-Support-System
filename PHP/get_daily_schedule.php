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
    "SELECT activity_type, title, description, scheduled_time, status
     FROM activity_logs
     WHERE resident_id = ?
       AND scheduled_date = CURDATE()
       AND activity_type IN ('medication', 'health-check')
     ORDER BY scheduled_time ASC");
mysqli_stmt_bind_param($stmt, "i", $resident_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$tasks = [];
$remaining = 0;

$icons = [
    'medication'   => '💊',
    'health-check' => '🩸',
    'therapy'      => '🧑‍⚕️'
];

$statusLabels = [
    'pending'   => 'Pending',
    'completed' => 'Completed',
    'missed'    => 'Missed',
    'skipped'   => 'Skipped'
];

while ($task = mysqli_fetch_assoc($result)) {
    if ($task['status'] !== 'completed') $remaining++;

    $tasks[] = [
        "time"   => $task['scheduled_time'],
        "name"   => $task['title'],
        "detail" => ($icons[$task['activity_type']] ?? '📋') . ' ' . $task['description'],
        "status" => $statusLabels[$task['status']] ?? ucfirst($task['status'])
    ];
}
mysqli_stmt_close($stmt);

echo json_encode([
    "tasks"     => $tasks,
    "remaining" => $remaining
]);
?>