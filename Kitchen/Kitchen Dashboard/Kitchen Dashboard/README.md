# CareDirect Kitchen — Complete Frontend + PHP + MySQL

## Run with XAMPP

1. Put this folder in `C:\xampp\htdocs\CareDirect_Kitchen`.
2. Start **Apache** and **MySQL**.
3. Make sure the existing CareDirect database is named `caredirect`.
4. In phpMyAdmin, select `caredirect` and import `database/kitchen_module.sql`.
5. Open `http://localhost/CareDirect_Kitchen/`.
6. Login with:
   - Email: `kitchen@caredirect.local`
   - Password: `password`

The project uses same-origin relative API URLs, so you do not need CORS configuration.

## What is connected

- Login -> PHP session -> dashboard authentication
- Dashboard statistics -> MySQL
- Resident list -> existing `residents` + `users` tables
- Diet flags/preferences -> `kitchen_resident_profiles`
- Meal checklist -> `kitchen_meal_service`
- Mark as served -> PHP/MySQL
- Emergency -> `kitchen_emergency_alerts`
- Cooler status -> `kitchen_cooler_readings`
- Staff count -> `kitchen_staff`
- Logout -> destroys PHP session

## Database password

If your XAMPP MySQL root account has a password, edit `config/config.php` and change `DB_PASS`.

## Existing CareDirect data

The supplied CareDirect database contains resident IDs 3 and 4. The SQL migration creates kitchen profiles for those two residents. Add more `kitchen_resident_profiles` rows for additional residents.
