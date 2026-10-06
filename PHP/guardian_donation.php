<?php
/** @var mysqli $conn */
session_start();
require_once "dbconnection.php";

header("Content-Type: application/json");

function respond(array $data): void
{
    echo json_encode($data);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'message' => 'Invalid request method.']);
}

if (empty($_SESSION['user_id'])) {
    respond(['success' => false, 'message' => 'You must be logged in.']);
}

$user_id = (int) $_SESSION['user_id'];

$sql = "
    SELECT
        g.guardian_id,
        g.phone_number,
        u.full_name
    FROM guardians g
    INNER JOIN users u
        ON g.user_id = u.user_id
    WHERE g.user_id = ?
      AND u.role = 'guardian'
    LIMIT 1
";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result   = mysqli_stmt_get_result($stmt);
$guardian = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if (!$guardian) {
    respond(['success' => false, 'message' => 'Guardian not found.']);
}

$amount        = $_POST['amount'] ?? '';
$paymentMethod = trim($_POST['paymentMethod'] ?? '');

if (!is_numeric($amount) || (float) $amount <= 0) {
    respond(['success' => false, 'message' => 'Invalid donation amount.']);
}

$allowed_methods = [
    'bkash'      => 'bKash',
    'nagad'      => 'Nagad',
    'visa'       => 'Visa',
    'mastercard' => 'Mastercard',
    'bank'       => 'Bank Transfer',
    'new-card'   => 'Card',
];

$key = strtolower($paymentMethod);

if ($paymentMethod === '' || !isset($allowed_methods[$key])) {
    respond(['success' => false, 'message' => 'Please select a valid payment method.']);
}

$paymentMethod = $allowed_methods[$key];
$amount        = round((float) $amount, 2);

$donorName     = $guardian['full_name'];
$profession    = 'Guardian';
$phone         = $guardian['phone_number'];
$address       = ''; 
$status        = 'Completed';
$receiptNumber = 'CD-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(4)));

$sql = "
    INSERT INTO donations
    (
        donor_name,
        phone,
        address,
        amount,
        payment_method,
        receipt_number,
        status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param(
    $stmt,
    "sssdsss",
    $donorName,
    $phone,
    $address,
    $amount,
    $paymentMethod,
    $receiptNumber,
    $status
);

if (!mysqli_stmt_execute($stmt)) {
    mysqli_stmt_close($stmt);
    respond(['success' => false, 'message' => 'Failed to save donation.']);
}

$donationId = mysqli_insert_id($conn);
mysqli_stmt_close($stmt);

respond([
    'success'        => true,
    'message'        => 'Donation successful.',
    'donation_id'    => $donationId,
    'donor_name'     => $donorName,
    'amount'         => number_format($amount, 2, '.', ''),
    'payment_method' => $paymentMethod,
    'receipt_number' => $receiptNumber,
    'status'         => $status
]);