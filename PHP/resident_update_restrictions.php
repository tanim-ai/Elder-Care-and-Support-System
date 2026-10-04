<?php
require_once "resident_auth.php";

post_only();
$userId = require_resident();
$residentId = get_resident_id($conn, $userId);

$newNote = trim($_POST['note'] ?? '');

if ($newNote === '') {
    json_response(['success' => false, 'error' => 'Restriction text is required'], 400);
}

// Get the existing restrictions text
$stmt = mysqli_prepare($conn, "SELECT dietary_restrictions FROM residents WHERE resident_id = ? LIMIT 1");
mysqli_stmt_bind_param($stmt, "i", $residentId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$row = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

$existing = $row['dietary_restrictions'] ?? '';
$updated = $existing !== '' && $existing !== null
    ? $existing . "\n" . $newNote
    : $newNote;

$stmt = mysqli_prepare($conn, "UPDATE residents SET dietary_restrictions = ? WHERE resident_id = ?");
mysqli_stmt_bind_param($stmt, "si", $updated, $residentId);
mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

$title = 'Dietary restriction added';
$stmt = mysqli_prepare($conn, "
    INSERT INTO activity_logs (resident_id, activity_type, title, description, recorded_by)
    VALUES (?, 'other', ?, ?, 'Resident Portal')
");
mysqli_stmt_bind_param($stmt, "iss", $residentId, $title, $newNote);
mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

json_response([
    'success' => true,
    'message' => 'Restriction saved',
    'dietary_restrictions' => $updated
]);
?>
