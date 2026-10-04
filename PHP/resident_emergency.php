<?php
require_once "resident_auth.php";

post_only();
$userId = require_resident();
$residentId = get_resident_id($conn, $userId);

$stmt = mysqli_prepare($conn, "
    SELECT contact_name, contact_phone
    FROM emergency_contacts
    WHERE resident_id = ?
    ORDER BY contact_id
    LIMIT 1
");
mysqli_stmt_bind_param($stmt, "i", $residentId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$contact = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

$title = 'Emergency alert requested';
$description = $contact
    ? 'Resident requested emergency assistance. Contact: ' . $contact['contact_name'] . ' (' . $contact['contact_phone'] . ').'
    : 'Resident requested emergency assistance. No emergency contact is configured.';
$recordedBy = 'Resident Portal';

$stmt = mysqli_prepare($conn, "
    INSERT INTO activity_logs
        (resident_id, activity_type, title, description, recorded_by)
    VALUES (?, 'other', ?, ?, ?)
");
mysqli_stmt_bind_param($stmt, "isss", $residentId, $title, $description, $recordedBy);
mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

json_response([
    'success' => true,
    'message' => 'Emergency request recorded',
    'emergency_contact' => $contact ?: null
]);
?>
