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

$stmt = mysqli_prepare($conn, "SELECT bp_systolic, bp_diastolic, bp_status, heart_rate, heart_rate_status, blood_sugar, blood_sugar_unit, blood_sugar_status, recorded_at, recorded_by FROM vitals WHERE resident_id = ? ORDER BY recorded_at DESC LIMIT 1");
mysqli_stmt_bind_param($stmt, "i", $resident_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$vitals = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if (!$vitals) {
    echo json_encode(["error" => "No vitals recorded"]);
    exit;
}

echo json_encode([
    "blood_pressure" => [
        "value"  => $vitals['bp_systolic'] . "/" . $vitals['bp_diastolic'],
        "unit"   => "mmHg",
        "status" => $vitals['bp_status']
    ],
    "heart_rate" => [
        "value"  => $vitals['heart_rate'],
        "unit"   => "per minute",
        "status" => $vitals['heart_rate_status']
    ],
    "blood_sugar" => [
        "value"  => $vitals['blood_sugar'],
        "unit"   => $vitals['blood_sugar_unit'],
        "status" => $vitals['blood_sugar_status']
    ],
    "recorded_at" => $vitals['recorded_at'],
    "recorded_by" => $vitals['recorded_by']
]);
?>