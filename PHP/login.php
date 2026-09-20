<?php
session_start();
/** @var mysqli $conn */
require "dbconnection.php";

function fail($msg){
    header("Location:../Login-Registration/login.html?error=" . urlencode($msg));
    exit;
}

if($_SERVER["REQUEST_METHOD"] != "POST"){
    die("Invalid Request Method!");
}

$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if(!$email || !$password){
    fail("Please fill in all required field");
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail("Invalid email address.");
}

try{
    $stmt = mysqli_prepare($conn,"SELECT user_id, password_hash, role FROM users WHERE email = ?");
    mysqli_stmt_bind_param($stmt,"s",$email);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $user = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);

    if(!$user || !password_verify($password,$user['password_hash'])){
        fail("Invalid email or password.");
    }

    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['role']    = $user['role'];

    if ($user['role'] === 'guardian') {
        header("Location:../dashboard.html");
    } else {
        header("Location:../Resident/caredirect-portal/index.html");
    }
    exit;


}
catch(mysqli_sql_exception $e){
    fail("Something went wrong. Please try again.");
}
?>