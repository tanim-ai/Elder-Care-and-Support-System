CAREDIRECT RESIDENT BACKEND
===========================

These files are designed for the existing Elder-Care-and-Support-System project.
They use the project's existing dbconnection.php and existing login session.

DO NOT replace dbconnection.php.
DO NOT replace the existing 7 PHP files.

Copy these files into:
Elder-Care-and-Support-System-main\Elder-Care-and-Support-System-main\PHP\

New files:
- resident_auth.php
- get_resident_dashboard.php
- get_resident_health.php
- get_resident_medications.php
- medication_action.php
- get_resident_schedule.php
- resident_activity.php
- resident_emergency.php

The APIs expect the existing login.php to set:
$_SESSION['user_id']
$_SESSION['role'] = 'resident'

Resident data is found using residents.user_id, so the logged-in resident sees their own data.

Resident frontend is expected at:
Resident\caredirect-portal\

From a page in Resident/caredirect-portal, the PHP API URL is:
../../PHP/get_resident_dashboard.php

Examples:
../../PHP/get_resident_health.php
../../PHP/get_resident_medications.php
../../PHP/get_resident_schedule.php
../../PHP/medication_action.php
../../PHP/resident_activity.php
../../PHP/resident_emergency.php

No SQL changes are required because the supplied caredirect schema already contains:
residents, vitals, care_items, medication_logs, activity_logs, emergency_contacts.
