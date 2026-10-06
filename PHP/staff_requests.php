<?php
require_once __DIR__ . '/billing_common.php';
$connection = db();
if (($_SESSION['role'] ?? '') !== 'admin' || empty($_SESSION['admin_id'])) fail('Administrator access required.', 403);
$stmt = $connection->prepare('SELECT admin_id FROM admins WHERE admin_id = ? AND is_active = 1');
$stmt->bind_param('i', $_SESSION['admin_id']);
$stmt->execute();
if (!$stmt->get_result()->fetch_assoc()) fail('Administrator access required.', 403);
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $alerts = $connection->query("SELECT e.*, u.full_name FROM emergency_alerts e LEFT JOIN residents r ON r.resident_id = e.resident_id LEFT JOIN users u ON u.user_id = r.user_id WHERE e.status <> 'resolved' ORDER BY e.created_at DESC")->fetch_all(MYSQLI_ASSOC);
    $upgrades = $connection->query("SELECT q.*, u.full_name FROM upgrade_requests q JOIN residents r ON r.resident_id = q.resident_id JOIN users u ON u.user_id = r.user_id WHERE q.status = 'pending' ORDER BY q.request_id")->fetch_all(MYSQLI_ASSOC);
    json_out(['success' => true, 'alerts' => $alerts, 'upgrades' => $upgrades]);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Method not allowed.', 405);
$id = (int)($_POST['id'] ?? 0);
$action = $_POST['action'] ?? '';
if ($id <= 0) fail('Invalid request.');
if ($action === 'resolve') {
    $stmt = $connection->prepare("UPDATE emergency_alerts SET status = 'resolved' WHERE alert_id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    json_out(['success' => true]);
}
if (!in_array($action, ['approve', 'reject'], true)) fail('Invalid action.');
$room = trim((string)($_POST['room'] ?? ''));
if ($action === 'approve' && ($room === '' || strlen($room) > 30)) fail('A room number of up to 30 characters is required.');
$connection->begin_transaction();
try {
    $stmt = $connection->prepare("SELECT resident_id FROM upgrade_requests WHERE request_id = ? AND status = 'pending' FOR UPDATE");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $request = $stmt->get_result()->fetch_assoc();
    if (!$request) { $connection->rollback(); fail('Request is no longer pending.', 409); }
    $rid = (int)$request['resident_id'];
    if ($action === 'approve') {
        $stmt = $connection->prepare("UPDATE residents SET service_code = 'premium', room_number = ?, room_since = CURDATE() WHERE resident_id = ?");
        $stmt->bind_param('si', $room, $rid);
        $stmt->execute();
    }
    $status = $action === 'approve' ? 'approved' : 'rejected';
    $note = $action === 'approve' ? 'Premium room assigned: ' . $room : 'Request declined by staff.';
    $stmt = $connection->prepare('UPDATE upgrade_requests SET status = ?, decision_note = ? WHERE request_id = ?');
    $stmt->bind_param('ssi', $status, $note, $id);
    $stmt->execute();
    log_activity($connection, $rid, 'Premium upgrade ' . $status, $note, 'Admin Portal');
    $connection->commit();
    json_out(['success' => true]);
} catch (Throwable $e) {
    $connection->rollback();
    error_log('Staff request: ' . $e->getMessage());
    fail('Unable to update this request.', 500);
}
