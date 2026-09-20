<?php
/** @var mysqli $conn */ 
require "dbconnection.php";

function fail($msg){
    header("Location:../Login-Registration/Registration.html?error=" . urlencode($msg));
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    die("Invalid Request Method");
}

$fullName        = trim($_POST['fullName'] ?? '');
$email           = trim($_POST['email'] ?? '');
$password        = $_POST['password'] ?? '';
$confirmPassword = $_POST['confirmPassword'] ?? '';

$residentAge = $_POST['residentAge'] ?? '';
$residentGender = $_POST['residentGender'] ?? '';
$residentHealth = trim($_POST['residentHealth'] ?? '');
$residentEmergencyName = trim($_POST['residentEmergencyName'] ?? '');
$residentEmergencyContact = $_POST['residentEmergencyContact'] ?? '';

$serviceCategorySelect = $_POST['serviceCategorySelect'] ?? 'standard';

$careType = $_POST['careType'] ?? '';
$careName = trim($_POST['careName'] ?? '');
$carePurpose = trim($_POST['carePurpose'] ?? '');
$careTime = $_POST['careTime'] ?? '';
$careFrequency = $_POST['careFrequency'] ?? '';
$careNotes = trim($_POST['careNotes'] ?? '');

$residentAge = (int)$residentAge;
$validGenders = ['female', 'male'];
$validServices = ['standard', 'premium'];

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
if ($residentAge === '') {
    fail("Age is required.");
}
if (!ctype_digit((string)$residentAge) || (int)$residentAge < 0 || (int)$residentAge > 120) {
    fail("Please provide a valid age between 0 and 120.");
}
if (!in_array($residentGender, $validGenders, true)) {
    fail("Please select a valid gender.");
}
if (!$residentEmergencyName) {
    fail("Emergency contact name is required.");
}
if (!$residentEmergencyContact) {
    fail("Emergency contact number is required.");
}
if (!in_array($serviceCategorySelect, $validServices, true)) {
    fail("Please select a valid service category.");
}

$password_hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt1 = mysqli_prepare($conn, "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'resident')");
    mysqli_stmt_bind_param($stmt1, "sss", $fullName, $email, $password_hash);
    mysqli_stmt_execute($stmt1);
    mysqli_stmt_close($stmt1);
    $user_id = mysqli_insert_id($conn);

    $stmt2 = mysqli_prepare($conn, "INSERT INTO residents (user_id, age, gender, health_conditions, service_code) VALUES (?, ?, ?, ?, ?)");
    mysqli_stmt_bind_param($stmt2, "issss", $user_id, $residentAge, $residentGender, $residentHealth, $serviceCategorySelect);
    mysqli_stmt_execute($stmt2);
    mysqli_stmt_close($stmt2);
    $resident_id = mysqli_insert_id($conn);

    $stmt3 = mysqli_prepare($conn, "INSERT INTO emergency_contacts (resident_id, contact_name, contact_phone) VALUES (?, ?, ?)");
    mysqli_stmt_bind_param($stmt3, "iss", $resident_id, $residentEmergencyName, $residentEmergencyContact);
    mysqli_stmt_execute($stmt3);
    mysqli_stmt_close($stmt3);

    if ($careType && $careName) {
        $stmt4 = mysqli_prepare($conn, "INSERT INTO care_items (resident_id, care_type, item_name, purpose, scheduled_time, frequency, notes) VALUES (?, ?, ?, ?, ?, ?, ?)");
        mysqli_stmt_bind_param($stmt4, "issssss", $resident_id, $careType, $careName, $carePurpose, $careTime, $careFrequency, $careNotes);
        mysqli_stmt_execute($stmt4);
        mysqli_stmt_close($stmt4);
    }

    header("Location:../Login-Registration/login.html?status=success");
    exit;

} catch (mysqli_sql_exception $e) {
    if (mysqli_errno($conn) == 1062) {
        fail("An account with this email already exists.");
    }
    die("Error: " . $e->getMessage());
}
?>