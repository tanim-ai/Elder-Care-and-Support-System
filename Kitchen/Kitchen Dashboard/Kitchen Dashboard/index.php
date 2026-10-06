<?php
declare(strict_types=1);
session_start();

// Never let the browser cache the dashboard (so Back button after logout shows nothing)
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

if (($_SESSION['role'] ?? '') !== 'kitchen' || empty($_SESSION['staff_id'])) {
    header('Location: ../../../Login-Registration/login.html?error=' . urlencode('Please log in.'));
    exit;
}

readfile(__DIR__ . '/index.html');
