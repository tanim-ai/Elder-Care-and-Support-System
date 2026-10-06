<?php
declare(strict_types=1);
require __DIR__ . '/billing_common.php';

// Used by both portals. GET ?all=1 returns the full payment history instead of the latest 3.
// ?resident_id=N is honoured for guardians only (and only for their own residents).

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    fail('Method not allowed.', 405);
}

$db       = db();
$user     = require_user($db);
$resident = accessible_resident($db, $user, isset($_GET['resident_id']) ? (int)$_GET['resident_id'] : null);
$rid      = (int)$resident['resident_id'];

// Make sure this month's bill exists (unique key uq_billing_month makes this idempotent).
$monthStart = date('Y-m-01');
$dueDate    = date('Y-m-t');
$stmt = $db->prepare(
    "INSERT IGNORE INTO billing (resident_id, billing_month, service_code, amount_due, due_date)
     SELECT ?, ?, sc.service_code, sc.monthly_price, ?
     FROM service_categories sc WHERE sc.service_code = ?"
);
$stmt->bind_param('isss', $rid, $monthStart, $dueDate, $resident['service_code']);
$stmt->execute();

// Current invoice = oldest unpaid one; if everything is paid, the most recent one.
$stmt = $db->prepare(
    "SELECT b.*, sc.service_name, sc.description AS service_description
     FROM billing b
     JOIN service_categories sc ON sc.service_code = b.service_code
     WHERE b.resident_id = ?
     ORDER BY (b.status = 'paid') ASC,                                -- unpaid first
              CASE WHEN b.status <> 'paid' THEN b.billing_month END ASC,  -- oldest unpaid
              b.billing_month DESC                                        -- else newest paid
     LIMIT 1"
);
$stmt->bind_param('i', $rid);
$stmt->execute();
$bill = $stmt->get_result()->fetch_assoc();

$invoice = null;
if ($bill) {
    $today    = new DateTimeImmutable('today');
    $due      = new DateTimeImmutable($bill['due_date']);
    $balance  = max(0.0, (float)$bill['amount_due'] - (float)$bill['amount_paid']);
    $daysLeft = (int)$today->diff($due)->format('%r%a');   // negative = overdue

    $status = $balance <= 0 ? 'paid' : $bill['status'];
    if ($status !== 'paid' && $daysLeft < 0) {
        $status = 'overdue';
    }

    $monthStartDt = new DateTimeImmutable($bill['billing_month']);
    $monthEndDt   = $monthStartDt->modify('last day of this month');

    $invoice = [
        'bill_id'        => (int)$bill['bill_id'],
        'billing_month'  => $bill['billing_month'],
        'invoice_number' => sprintf('INV-%s-%04d', $monthStartDt->format('Y-m'), $bill['bill_id']),
        'period_label'   => $monthStartDt->format('F j') . ' - ' . $monthEndDt->format('F j, Y'),
        'due_date'       => $bill['due_date'],
        'days_until_due' => $daysLeft,
        'status'         => $status,
        'amount_due'     => money($bill['amount_due']),
        'amount_paid'    => money($bill['amount_paid']),
        'balance'        => money($balance),
        'line_items'     => [
            ['label' => $bill['service_name'] . ' Care Plan', 'amount' => money($bill['amount_due'])],
        ],
        'notes'          => $bill['notes'],
    ];
}

// Payment history
$limit = isset($_GET['all']) ? 500 : 3;
$stmt = $db->prepare(
    "SELECT p.payment_id, p.amount, p.payment_method, p.reference_number, p.paid_at, b.billing_month
     FROM payments p
     JOIN billing b ON b.bill_id = p.bill_id
     WHERE p.resident_id = ? AND p.status = 'Completed'
     ORDER BY p.paid_at DESC, p.payment_id DESC
     LIMIT ?"
);
$stmt->bind_param('ii', $rid, $limit);
$stmt->execute();
$history = [];
foreach ($stmt->get_result() as $row) {
    $history[] = [
        'payment_id' => (int)$row['payment_id'],
        'billing_month' => $row['billing_month'],
        'label'      => date('F', strtotime($row['billing_month'])) . ' Invoice',
        'paid_on'    => date('F j', strtotime($row['paid_at'])),
        'paid_at'    => $row['paid_at'],
        'amount'     => money($row['amount']),
        'method'     => $row['payment_method'],
        'reference'  => $row['reference_number'],
    ];
}

json_out([
    'success'  => true,
    'resident' => ['id' => $rid, 'name' => $resident['full_name'], 'room' => $resident['room_number']],
    'invoice'  => $invoice,
    'history'  => $history,
]);