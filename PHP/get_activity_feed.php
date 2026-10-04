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

function formatMedicationTitle($title) {
    if (!preg_match('/item_name:\s*(.+?)\s*dosage:\s*(.+?)\s*purpose:/si', $title, $m)) {
        return $title;
    }
    $name   = trim($m[1]);
    $dosage = preg_replace('/(\d)\s*(mg|mcg|g|ml)\b/i', '$1 $2', trim($m[2]));

    $status = 'due';
    if (preg_match('/marked\s+(\w+)\s*$/i', $title, $s)) {
        $word = strtolower($s[1]);
        $status = ($word === 'completed' || $word === 'done' || $word === 'taken') ? 'done' : 'due';
    }
    return "$name $dosage marked $status";
}

$stmt = mysqli_prepare($conn,
    "SELECT activity_type, TRIM(title) AS title, description, activity_at AS taken_at
     FROM activity_logs
     WHERE resident_id = ?
       AND title NOT LIKE '%marked missed%'
     ORDER BY activity_at DESC
     LIMIT 4");
mysqli_stmt_bind_param($stmt, "i", $resident_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$activities = [];
while ($row = mysqli_fetch_assoc($result)) {
    $title = $row['title'];

    if ($row['activity_type'] === 'medication') {
        $title = formatMedicationTitle($title);
    }

    $activities[] = [
        "title"       => $title,
        "description" => $row['description'],
        "taken_at"    => $row['taken_at']
    ];
}
mysqli_stmt_close($stmt);

echo json_encode(["activities" => $activities]);
?>