<?php
/** @var mysqli $conn */
session_start();
require_once "dbconnection.php";

header("Content-Type: application/json");

if (empty($_SESSION['user_id'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}

$user_id = (int) $_SESSION['user_id'];

if (!$user_id) {
    echo json_encode([
        'success' => false,
        'message' => 'You must be logged in.'
    ]);
    exit;
}

$sql = "
    SELECT 
        r.resident_id,
        r.user_id,
        u.full_name
    FROM residents r
    INNER JOIN users u
        ON r.user_id = u.user_id
    WHERE r.user_id = ?
      AND u.role = 'resident'
    LIMIT 1
";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);
$resident = mysqli_fetch_assoc($result);

mysqli_stmt_close($stmt);

if (!$resident) {
    echo json_encode([
        'success' => false,
        'message' => 'Resident not found.'
    ]);
    exit;
}

$amount = $_POST['amount'] ?? '';
$paymentMethod = $_POST['paymentMethod'] ?? '';
$message = $_POST['message'] ?? '';

if (!is_numeric($amount) || (float)$amount <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid donation amount.'
    ]);
    exit;
}

if (empty($paymentMethod)) {
    echo json_encode([
        'success' => false,
        'message' => 'Please select a payment method.'
    ]);
    exit;
}

$donorName = $resident['full_name'];

$receiptNumber =
    'CD-' .
    date('Ymd') .
    '-' .
    strtoupper(bin2hex(random_bytes(4)));

$profession = '';
$phone = '';
$address = '';
$status = 'Completed';

$sql = "
    INSERT INTO donations
    (
        donor_name,
        profession,
        phone,
        address,
        amount,
        payment_method,
        receipt_number,
        status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
";

$stmt = mysqli_prepare($conn, $sql);

mysqli_stmt_bind_param(
    $stmt,
    "ssssdsss",
    $donorName,
    $profession,
    $phone,
    $address,
    $amount,
    $paymentMethod,
    $receiptNumber,
    $status
);


if (!mysqli_stmt_execute($stmt)) {

    echo json_encode([
        'success' => false,
        'message' => 'Failed to save donation.'
    ]);

    mysqli_stmt_close($stmt);
    exit;
}

$donationId = mysqli_insert_id($conn);

mysqli_stmt_close($stmt);

echo json_encode([
    'success' => true,
    'message' => 'Donation successful.',
    'donation_id' => $donationId,
    'donor_name' => $donorName,
    'amount' => number_format((float)$amount, 2, '.', ''),
    'payment_method' => $paymentMethod,
    'receipt_number' => $receiptNumber,
    'status' => $status
]);

?>