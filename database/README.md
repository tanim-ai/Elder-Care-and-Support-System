# Portal feature repair

The existing CareDirect database must already contain users, guardians, residents,
service_categories, activity_logs and kitchen_staff. The root caredirect.sql is only
an admins export, not a complete application database.

Billing and SOS endpoints create missing feature tables from portal_features.sql
and add missing payer metadata columns automatically. The database account needs
CREATE and ALTER privileges for this initial setup. Existing invoices and residents
are preserved. If production permissions are restricted, run the setup using a
migration account first (including the metadata additions in PHP/portal_schema.php).

Resident Billing now includes Request Premium upgrade. Admin's live requests panel
approves the request with a confirmed room number or declines it. Existing invoices
retain their original plan/price; future monthly invoices use the approved plan.

Guardian, resident and kitchen SOS requests are stored in emergency_alerts and
shown in Admin's live requests panel, refreshed every 10 seconds. Resolving them
persists to the database. This is in-app reporting, not an SMS or ambulance dispatch.

Payments retain the existing application's database-recording behaviour. No actual
bKash, Nagad or card payment gateway is connected.

Run frontend regression checks from the repository root:

    node tests/portal-flows.cjs

Deployment verification requires PHP 8.1+, MySQL/MariaDB and the existing database:
log in under each role, load/pay an invoice, retry a paid invoice, submit/approve
an upgrade, reload the resident plan, submit SOS under all three roles, verify
alerts in Admin, resolve them, and reload. Also confirm that a guardian cannot
pay another guardian's resident invoice. PHP/MySQL were unavailable in the repair
workspace; database integration must be verified in the deployment environment.
