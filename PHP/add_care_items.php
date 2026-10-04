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


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "POST only"]);
    exit;
}

$in = json_decode(file_get_contents('php://input'), true) ?: [];

$type    = $in['care_type'] ?? '';
$name    = trim($in['item_name'] ?? '');
$freq    = $in['frequency'] ?? '';
$time1   = $in['scheduled_time'] ?? '';
$time2   = $in['scheduled_time_2'] ?? '';
$dose    = trim($in['dosage'] ?? '');
$purpose = trim($in['purpose'] ?? '');
$notes   = trim($in['notes'] ?? '');

function fail($msg) {
    echo json_encode(["error" => $msg]);
    exit;
}

if (!in_array($type, ['medication', 'therapy', 'routine-check'], true)) fail('Pick a care type');
if ($name === '') fail('Name is required');
if (!in_array($freq, ['daily', 'twice-daily', 'weekly', 'as-needed'], true)) fail('Pick a frequency');
if ($freq !== 'as-needed' && !preg_match('/^\d{2}:\d{2}$/', $time1)) fail('Time is required');
if ($freq === 'twice-daily' && !preg_match('/^\d{2}:\d{2}$/', $time2)) fail('Second time is required for twice-daily');

$time1   = $time1 !== '' ? $time1 . ':00' : null;
$time2   = ($freq === 'twice-daily') ? $time2 . ':00' : null;
$purpose = $purpose !== '' ? $purpose : null;
$notes   = $notes !== '' ? $notes : null;

$stmt = mysqli_prepare($conn,
    "INSERT INTO care_items
       (resident_id, care_type, item_name, dosage, purpose,
        scheduled_time, scheduled_time_2, frequency, notes)
     VALUES (?,?,?,?,?,?,?,?,?)");
mysqli_stmt_bind_param($stmt, "issssssss",
    $resident_id, $type, $name, $dose, $purpose,
    $time1, $time2, $freq, $notes);
mysqli_stmt_execute($stmt);
$new_id = mysqli_insert_id($conn);
mysqli_stmt_close($stmt);

echo json_encode(["success" => true, "care_item_id" => $new_id]);