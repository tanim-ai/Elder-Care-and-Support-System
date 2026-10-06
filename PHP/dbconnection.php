<?php
// Local XAMPP defaults; production can override these environment variables.
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$conn = new mysqli(getenv('DB_HOST') ?: '127.0.0.1', getenv('DB_USER') ?: 'root',
    getenv('DB_PASSWORD') ?: '', getenv('DB_NAME') ?: 'caredirect', (int)(getenv('DB_PORT') ?: 3306));
$conn->set_charset('utf8mb4');
