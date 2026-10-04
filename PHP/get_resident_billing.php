<?php
require_once "resident_auth.php";

$userId = require_resident();
$residentId = get_resident_id($conn, $userId);

// Current invoice: the most recent unpaid/partial/overdue bill
$stmt = mysqli_prepare($conn, "
    SELECT bill_id, billing_month, service_code, amount_due, amount_paid, status, due_date, paid_at, notes
    FROM billing
    WHERE resident_id = ?
      AND status IN ('unpaid', 'partial', 'overdue')
    ORDER BY billing_month DESC
    LIMIT 1
");
mysqli_stmt_bind_param($stmt, "i", $residentId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$currentInvoice = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

// Payment history: paid bills, most recent first (short list for the Billing page)
$stmt = mysqli_prepare($conn, "
    SELECT bill_id, billing_month, amount_paid, paid_at
    FROM billing
    WHERE resident_id = ?
      AND status = 'paid'
    ORDER BY billing_month DESC
    LIMIT 5
");
mysqli_stmt_bind_param($stmt, "i", $residentId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$history = [];
while ($row = mysqli_fetch_assoc($result)) {
    $history[] = $row;
}
mysqli_stmt_close($stmt);

// Full payment history, no limit, for the "View All History" page
$stmt = mysqli_prepare($conn, "
    SELECT bill_id, billing_month, amount_paid, paid_at
    FROM billing
    WHERE resident_id = ?
      AND status = 'paid'
    ORDER BY billing_month DESC
");
mysqli_stmt_bind_param($stmt, "i", $residentId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$fullHistory = [];
while ($row = mysqli_fetch_assoc($result)) {
    $fullHistory[] = $row;
}
mysqli_stmt_close($stmt);

json_response([
    'success' => true,
    'current_invoice' => $currentInvoice ?: null,
    'payment_history' => $history,
    'full_payment_history' => $fullHistory
]);
?>
