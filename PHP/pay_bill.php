<?php
declare(strict_types=1);
require __DIR__ . '/billing_common.php';

// POST bill_id, paymentMethod  -> pays the full remaining balance of that bill.
// Works for a guardian (their residents' bills) or a resident (their own bill).
// NOTE: no real payment gateway is called here; it records the payment in the database.
// Hook your bKash/Nagad/card gateway in where marked below.

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Method not allowed.', 405);
}

$db       = db();
$user     = require_user($db);

$billId = (int)($_POST['bill_id'] ?? 0);
$method = (string)($_POST['paymentMethod'] ?? '');
if ($billId <= 0) {
    fail('Missing invoice.');
}
if (!isset(PAYMENT_METHODS[$method])) {
    fail('Please choose a valid payment method.');
}
$methodLabel = PAYMENT_METHODS[$method];

$db->begin_transaction();
try {
    // Lock the bill, and make sure it belongs to this user's resident.
    $uid = (int)$user['user_id'];
    if ($user['role'] === 'resident') {
        $sql = "SELECT b.bill_id, b.resident_id, b.billing_month, b.amount_due, b.amount_paid
                FROM billing b JOIN residents r ON r.resident_id = b.resident_id
                WHERE b.bill_id = ? AND r.user_id = ? FOR UPDATE";
    } else {
        $sql = "SELECT b.bill_id, b.resident_id, b.billing_month, b.amount_due, b.amount_paid
                FROM billing b
                JOIN residents r ON r.resident_id = b.resident_id
                JOIN guardians g ON g.guardian_id = r.guardian_id
                WHERE b.bill_id = ? AND g.user_id = ? FOR UPDATE";
    }
    $stmt = $db->prepare($sql);
    $stmt->bind_param('ii', $billId, $uid);
    $stmt->execute();
    $bill = $stmt->get_result()->fetch_assoc();

    if (!$bill) {
        $db->rollback();
        fail('Invoice not found.', 404);
    }

    $balance = round((float)$bill['amount_due'] - (float)$bill['amount_paid'], 2);
    if ($balance <= 0) {
        $db->rollback();
        fail('This invoice has already been paid.', 409);
    }

    // >>> Call the payment gateway for $balance here; abort (rollback + fail) if it is declined. <<<

    $reference = new_reference('PAY');
    $amountStr = money($balance);
    $rid       = (int)$bill['resident_id'];

    $stmt = $db->prepare(
        "INSERT INTO payments (bill_id, resident_id, paid_by_user_id, paid_by_role, amount, payment_method, reference_number)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    $role = $user['role'];
    $stmt->bind_param('iiissss', $billId, $rid, $uid, $role, $amountStr, $methodLabel, $reference);
    $stmt->execute();

    $stmt = $db->prepare(
        "UPDATE billing
         SET amount_paid = amount_due, status = 'paid', paid_at = NOW(),
             paid_by_user_id = ?, paid_by_role = ?
         WHERE bill_id = ?"
    );
    $stmt->bind_param('isi', $uid, $role, $billId);
    $stmt->execute();

    $month = date('F Y', strtotime($bill['billing_month']));
    log_activity($db, $rid, 'Bill paid', "{$month} invoice of \${$amountStr} paid via {$methodLabel}. Ref: {$reference}", actor_label($user));

    $db->commit();
} catch (Throwable $e) {
    $db->rollback();
    error_log('pay_bill failed: ' . $e->getMessage());
    fail('Payment could not be completed. Please try again.', 500);
}

json_out([
    'success'        => true,
    'amount'         => $amountStr,
    'amount_paid'    => $amountStr,   // resident-api.js reads this key
    'payment_method' => $methodLabel,
    'reference'      => $reference,
]);