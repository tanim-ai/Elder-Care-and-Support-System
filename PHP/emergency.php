<?php
require_once __DIR__ . '/billing_common.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('POST request required.', 405);
$connection = db();
$role = $_SESSION['role'] ?? '';
if ($role === 'kitchen') {
    $actor = (int)($_SESSION['staff_id'] ?? 0);
    $stmt = $connection->prepare('SELECT staff_id FROM kitchen_staff WHERE staff_id = ? AND is_active = 1');
    $stmt->bind_param('i', $actor);
    $stmt->execute();
    if (!$stmt->get_result()->fetch_assoc()) fail('Kitchen staff authentication required.', 401);
    $residentId = null;
} else {
    $user = require_user($connection);
    $role = $user['role'];
    $actor = (int)$user['user_id'];
    $resident = accessible_resident($connection, $user, isset($_POST['resident_id']) ? (int)$_POST['resident_id'] : null);
    $residentId = (int)$resident['resident_id'];
}
$message = trim((string)($_POST['message'] ?? ucfirst($role) . ' requested immediate assistance.'));
if ($message === '' || strlen($message) > 500) fail('Provide an emergency message of 1 to 500 characters.', 422);
$connection->begin_transaction();
try {
    $stmt = $connection->prepare('INSERT INTO emergency_alerts (resident_id, actor_id, actor_role, message) VALUES (?, ?, ?, ?)');
    $stmt->bind_param('iiss', $residentId, $actor, $role, $message);
    $stmt->execute();
    $alertId = $connection->insert_id;
    if ($residentId) log_activity($connection, $residentId, 'Emergency SOS', $message, ucfirst($role) . ' Portal');
    $connection->commit();
    json_out(['success' => true, 'alert_id' => $alertId, 'message' => 'Emergency SOS recorded for staff review. Call emergency services if immediate help is needed.']);
} catch (Throwable $e) {
    $connection->rollback();
    error_log('Emergency SOS: ' . $e->getMessage());
    fail('Could not record the emergency SOS. Please contact staff directly.', 500);
}
