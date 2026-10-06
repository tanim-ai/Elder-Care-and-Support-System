<?php
declare(strict_types=1);
require __DIR__ . '/billing_common.php';

$db       = db();
$user     = require_user($db);
$resident = accessible_resident($db, $user, isset($_REQUEST['residentId']) ? (int)$_REQUEST['residentId'] : null);
$rid      = (int)$resident['resident_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->prepare('SELECT status, decision_note FROM upgrade_requests WHERE resident_id = ? ORDER BY request_id DESC LIMIT 1');
    $stmt->bind_param('i', $rid);
    $stmt->execute();
    $last = $stmt->get_result()->fetch_assoc();
    json_out(['success' => true, 'pending' => ($last['status'] ?? '') === 'pending',
              'status' => $last['status'] ?? null, 'note' => $last['decision_note'] ?? null]);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Method not allowed.', 405);
}

$db->begin_transaction();
try {
    $stmt = $db->prepare('SELECT service_code FROM residents WHERE resident_id = ? FOR UPDATE');
    $stmt->bind_param('i', $rid);
    $stmt->execute();
    $from = $stmt->get_result()->fetch_assoc()['service_code'];
    if ($from === 'premium') {
        $db->rollback();
        fail('This resident is already on the Premium plan.', 409);
    }

    $stmt = $db->prepare("SELECT 1 FROM upgrade_requests WHERE resident_id = ? AND status = 'pending'");
    $stmt->bind_param('i', $rid);
    $stmt->execute();
    if ($stmt->get_result()->fetch_row()) {
        $db->rollback();
        fail('An upgrade request is already waiting for staff approval.', 409);
    }

    $uid  = (int)$user['user_id'];
    $role = $user['role'];
    $stmt = $db->prepare('INSERT INTO upgrade_requests (resident_id, requested_by_user_id, requested_by_role, from_service) VALUES (?, ?, ?, ?)');
    $stmt->bind_param('iiss', $rid, $uid, $role, $from);
    $stmt->execute();

    log_activity($db, $rid, 'Premium upgrade requested', 'Waiting for staff approval and room assignment.', actor_label($user));
    $db->commit();
} catch (Throwable $e) {
    $db->rollback();
    error_log('request_upgrade failed: ' . $e->getMessage());
    fail('Could not send the request. Please try again.', 500);
}

json_out(['success' => true, 'pending' => true]);