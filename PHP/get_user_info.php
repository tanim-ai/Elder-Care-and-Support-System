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

$stmt = mysqli_prepare($conn,
    "SELECT u.full_name, r.resident_id
     FROM users u
     JOIN guardians g ON g.user_id = u.user_id
     JOIN residents r ON r.guardian_id = g.guardian_id
     WHERE u.user_id = ?
     LIMIT 1");

mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$data = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if (!$data) {
    echo json_encode(["error" => "No data found"]);
    exit;
}

echo json_encode([
    "guardian_name" => $data['full_name'],
    "resident_id"   => "EL-" . $data['resident_id']
]);
?>