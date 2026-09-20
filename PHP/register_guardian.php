<?php
/** @var mysqli $conn */
require "dbconnection.php";

function fail($msg) {
    header("Location:../Login-Registration/Registration.html?error=" . urlencode($msg));
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    die("Invalid Request Method");
}

$fullName        = trim($_POST['fullName'] ?? '');
$email           = trim($_POST['email'] ?? '');
$guardianPhone    = trim($_POST['guardianPhone'] ?? '');
$password        = $_POST['password'] ?? '';
$confirmPassword = $_POST['confirmPassword'] ?? '';

$residentId       = trim($_POST['residentId'] ?? '');
$guardianRelation = $_POST['guardianRelation'] ?? '';

$validRelations = ['parent', 'spouse', 'child', 'sibling', 'relative', 'friend', 'legal-guardian'];

if (!$fullName || !$email || !$password) {
    fail("Please fill in all required fields.");
}
if (strlen($password) < 8) {
    fail("Password must be at least 8 characters.");
}
if ($password !== $confirmPassword) {
    fail("Passwords do not match.");
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail("Invalid email address.");
}
if (!$guardianPhone) {
    fail("Phone number is required.");
}
if (!$residentId) {
    fail("Guardian ID is required.");
}
if (!in_array($guardianRelation, $validRelations, true)) {
    fail("Please select a valid relation type.");
}

$password_hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt1 = mysqli_prepare($conn, "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'guardian')");
    mysqli_stmt_bind_param($stmt1, "sss", $fullName, $email, $password_hash);
    mysqli_stmt_execute($stmt1);
    mysqli_stmt_close($stmt1);
    $user_id = mysqli_insert_id($conn);

    $guardianCode = 'GDN-' . str_pad($user_id, 5, '0', STR_PAD_LEFT);

    $stmt2 = mysqli_prepare($conn, "INSERT INTO guardians (user_id, phone_number, guardian_code, relation_type) VALUES (?, ?, ?, ?)");
    mysqli_stmt_bind_param($stmt2, "isss", $user_id, $guardianPhone, $guardianCode, $guardianRelation);
    mysqli_stmt_execute($stmt2);
    mysqli_stmt_close($stmt2);
    $guardian_id = mysqli_insert_id($conn);

    $stmt3 = mysqli_prepare($conn, "SELECT resident_id FROM residents WHERE user_id = ?");
    mysqli_stmt_bind_param($stmt3, "i", $residentId);
    mysqli_stmt_execute($stmt3);
    $result = mysqli_stmt_get_result($stmt3);
    $resident = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt3);

    if (!$resident) {
        fail("Resident ID not found.");
    }

    $stmt4 = mysqli_prepare($conn, "UPDATE residents SET guardian_id = ? WHERE resident_id = ?");
    mysqli_stmt_bind_param($stmt4, "ii", $guardian_id, $resident['resident_id']);
    mysqli_stmt_execute($stmt4);
    mysqli_stmt_close($stmt4);

    header("Location:../Login-Registration/login.html?status=success&code=" . urlencode($guardianCode));
    exit;

} catch (mysqli_sql_exception $e) {
    if (mysqli_errno($conn) == 1062) {
        fail("An account with this email already exists.");
    }
    die("Error: " . $e->getMessage());
}
?>