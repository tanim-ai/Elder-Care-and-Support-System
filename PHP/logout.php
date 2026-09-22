<?php
session_start();
session_destroy();
header("Location: ../Login-Registration/login.html");
exit;
?>