<?php

session_start();

require_once "dbconnection.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: donation.php");
    exit;
}

$name           = trim($_POST["name"] ?? "");
$profession     = trim($_POST["profession"] ?? "");
$phone          = trim($_POST["phone"] ?? "");
$address        = trim($_POST["address"] ?? "");
$amount         = trim($_POST["amount"] ?? "");
$payment_method = trim($_POST["payment_method"] ?? "");

if (
    $name === "" ||
    $profession === "" ||
    $phone === "" ||
    $address === "" ||
    $amount === "" ||
    $payment_method === ""
) {
    die("Please fill in all required fields.");
}

if (!is_numeric($amount) || (float) $amount <= 0) {
    die("Invalid donation amount.");
}

$amount = (float) $amount;

$allowed_methods = ["bKash", "Rocket", "Nagad", "Card"];

if (!in_array($payment_method, $allowed_methods, true)) {
    die("Invalid payment method.");
}

$receipt_number = "CD-"
    . date("Ymd")
    . "-"
    . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));

$sql = "
    INSERT INTO donations
    (
        donor_name,
        profession,
        phone,
        address,
        amount,
        payment_method,
        receipt_number
    )
    VALUES
    (?, ?, ?, ?, ?, ?, ?)
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    die("Database query preparation failed: " . $conn->error);
}

$stmt->bind_param("ssssdss",$name,$profession,$phone,$address,$amount,$payment_method,$receipt_number);
if (!$stmt->execute()) {
    die("Donation could not be saved: " . $stmt->error);
}
$donation_id = $stmt->insert_id;

$_SESSION["donation_id"]    = $donation_id;
$_SESSION["donor_name"]     = $name;
$_SESSION["profession"]     = $profession;
$_SESSION["phone"]          = $phone;
$_SESSION["address"]        = $address;
$_SESSION["amount"]         = $amount;
$_SESSION["payment_method"] = $payment_method;
$_SESSION["receipt_number"] = $receipt_number;

$stmt->close();
$conn->close();

header("Location: after-donation.php");
exit;