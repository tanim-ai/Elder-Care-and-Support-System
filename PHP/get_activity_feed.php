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
    "SELECT title, description, taken_at
     FROM activity_logs
     WHERE resident_id = ? AND status = 'completed'
     ORDER BY taken_at DESC
     LIMIT 4");
mysqli_stmt_bind_param($stmt, "i", $resident_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$activities = [];
while ($row = mysqli_fetch_assoc($result)) {
    $activities[] = [
        "title"       => $row['title'],
        "description" => $row['description'],
        "taken_at"    => $row['taken_at']
    ];
}
mysqli_stmt_close($stmt);

echo json_encode(["activities" => $activities]);
?>