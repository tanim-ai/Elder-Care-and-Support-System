<?php
$body = json_decode(file_get_contents('php://input'), true);
if (is_array($body)) $_POST = $body;
require __DIR__ . '/../../../../PHP/emergency.php';
