<?php
session_start();
/** @var mysqli $conn */
require "dbconnection.php";

header("Content-Type: application/json");

if (empty($_SESSION['user_id']) || empty($_SESSION['role'])) {
    echo json_encode(["success" => false, "error" => "Not logged in"]);
    exit;
}

$user_id = (int) $_SESSION['user_id'];
$role    = $_SESSION['role'];
$resident_id = null;

if ($role === 'resident') {
    $stmt = mysqli_prepare($conn, "SELECT resident_id FROM residents WHERE user_id = ?");
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);

    if (!$row) {
        echo json_encode(["success" => false, "error" => "Resident record not found"]);
        exit;
    }
    $resident_id = (int) $row['resident_id'];

} elseif ($role === 'guardian') {
    $requested = trim($_GET['residentId'] ?? '');

    if ($requested !== '' && ctype_digit($requested)) {
        $reqId = (int) $requested;
        $stmt = mysqli_prepare($conn,
            "SELECT r.resident_id
             FROM residents r
             JOIN guardians g ON g.guardian_id = r.guardian_id
             WHERE g.user_id = ? AND r.resident_id = ?");
        mysqli_stmt_bind_param($stmt, "ii", $user_id, $reqId);
    } else {
        $stmt = mysqli_prepare($conn,
            "SELECT r.resident_id
             FROM residents r
             JOIN guardians g ON g.guardian_id = r.guardian_id
             WHERE g.user_id = ?
             LIMIT 1");
        mysqli_stmt_bind_param($stmt, "i", $user_id);
    }

    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);

    if (!$row) {
        echo json_encode(["success" => false, "error" => "No linked resident found"]);
        exit;
    }
    $resident_id = (int) $row['resident_id'];

} else {
    echo json_encode(["success" => false, "error" => "Unauthorized role"]);
    exit;
}

$stmt = mysqli_prepare($conn,
    "SELECT r.resident_id, r.service_code, r.room_number, r.room_since, r.created_at,
            sc.service_name, sc.monthly_price, sc.description
     FROM residents r
     JOIN service_categories sc ON sc.service_code = r.service_code
     WHERE r.resident_id = ?");
mysqli_stmt_bind_param($stmt, "i", $resident_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$data = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if (!$data) {
    echo json_encode(["success" => false, "error" => "Accommodation data not found"]);
    exit;
}

$since = $data['room_since'] ?: $data['created_at'];
$sinceFormatted = $since ? date("j F Y", strtotime($since)) : null;

echo json_encode([
    "success"       => true,
    "resident_id"   => $data['resident_id'],
    "service_code"  => $data['service_code'],   // 'standard' or 'premium'
    "service_name"  => $data['service_name'],
    "monthly_price" => $data['monthly_price'],
    "description"   => $data['description'],
    "room_number"   => $data['room_number'],
    "since"         => $sinceFormatted
]);