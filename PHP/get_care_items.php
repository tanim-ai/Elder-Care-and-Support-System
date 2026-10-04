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
    "SELECT care_item_id, care_type, item_name, dosage, purpose,
            scheduled_time, scheduled_time_2, scheduled_time_3,
            frequency, notes
     FROM care_items
     WHERE resident_id = ?
     ORDER BY scheduled_time ASC, care_item_id ASC");
mysqli_stmt_bind_param($stmt, "i", $resident_id);
mysqli_stmt_execute($stmt);
$items = mysqli_fetch_all(mysqli_stmt_get_result($stmt), MYSQLI_ASSOC);
mysqli_stmt_close($stmt);

echo json_encode(["items" => $items]);