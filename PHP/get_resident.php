<?php
/** @var mysqli $conn */
require "dbconnection.php";

$residentId = trim($_GET['residentId'] ?? '');

if (!$residentId || !ctype_digit($residentId)) {
    echo json_encode(['success' => false]);
    exit;
}

$stmt = mysqli_prepare($conn, "SELECT u.full_name FROM residents r JOIN users u ON r.user_id = u.user_id WHERE r.user_id = ?");
mysqli_stmt_bind_param($stmt, "i", $residentId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$resident = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if ($resident) {
    echo json_encode(['success' => true, 'name' => $resident['full_name']]);
} else {
    echo json_encode(['success' => false]);
}
?>