<?php
require_once "resident_auth.php";

$userId = require_resident();
$residentId = get_resident_id($conn, $userId);

$stmt = mysqli_prepare($conn, "
    SELECT
        u.full_name,
        u.email,
        r.resident_id,
        r.age,
        r.gender,
        r.health_conditions,
        r.dietary_restrictions,
        r.service_code,
        sc.service_name,
        sc.description AS service_description
    FROM residents r
    JOIN users u ON u.user_id = r.user_id
    LEFT JOIN service_categories sc ON sc.service_code = r.service_code
    WHERE r.resident_id = ?
    LIMIT 1
");
mysqli_stmt_bind_param($stmt, "i", $residentId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$resident = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

$stmt = mysqli_prepare($conn, "
    SELECT vital_id, bp_systolic, bp_diastolic, bp_status,
           heart_rate, heart_rate_status,
           blood_sugar, blood_sugar_unit, blood_sugar_status,
           blood_oxygen, temperature,
           recorded_at, recorded_by
    FROM vitals
    WHERE resident_id = ?
    ORDER BY recorded_at DESC
    LIMIT 1
");
mysqli_stmt_bind_param($stmt, "i", $residentId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$vitals = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

$stmt = mysqli_prepare($conn, "
    SELECT contact_id, contact_name, contact_phone
    FROM emergency_contacts
    WHERE resident_id = ?
    ORDER BY contact_id
    LIMIT 1
");
mysqli_stmt_bind_param($stmt, "i", $residentId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$emergency = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

// Today's medications with their scheduled times and status, for the "Next Dose" card
$today = date('Y-m-d');
$stmt = mysqli_prepare($conn, "
    SELECT
        c.care_item_id,
        c.item_name,
        c.purpose,
        c.scheduled_time,
        c.frequency,
        COALESCE(m.status, 'pending') AS status
    FROM care_items c
    LEFT JOIN medication_logs m
        ON m.care_item_id = c.care_item_id
       AND m.resident_id = c.resident_id
       AND m.scheduled_date = ?
       AND m.scheduled_time = COALESCE(c.scheduled_time, '00:00:00')
    WHERE c.resident_id = ?
      AND c.care_type = 'medication'
    ORDER BY c.scheduled_time IS NULL, c.scheduled_time
");
mysqli_stmt_bind_param($stmt, "si", $today, $residentId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$medications = [];
while ($row = mysqli_fetch_assoc($result)) {
    $medications[] = $row;
}
mysqli_stmt_close($stmt);

if (!$resident) {
    json_response(['success' => false, 'error' => 'Resident profile not found'], 404);
}

json_response([
    'success' => true,
    'resident' => $resident,
    'vitals' => $vitals ?: null,
    'emergency_contact' => $emergency ?: null,
    'medications' => $medications
]);
?>
