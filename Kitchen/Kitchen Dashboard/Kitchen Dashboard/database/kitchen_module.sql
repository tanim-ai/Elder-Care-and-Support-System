USE caredirect;

CREATE TABLE IF NOT EXISTS kitchen_staff (
    staff_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (staff_id),
    UNIQUE KEY uq_kitchen_staff_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS kitchen_resident_profiles (
    resident_id BIGINT UNSIGNED NOT NULL,
    room_number VARCHAR(30) NOT NULL,
    diet_flag ENUM('low-salt','sugar-free','regular') NOT NULL DEFAULT 'regular',
    preferences VARCHAR(500) DEFAULT NULL,
    PRIMARY KEY (resident_id),
    CONSTRAINT fk_kitchen_profile_resident FOREIGN KEY (resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS kitchen_meal_schedule (
    schedule_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    service_date DATE NOT NULL,
    meal_type ENUM('breakfast','lunch','dinner','snack') NOT NULL,
    service_time TIME NOT NULL,
    PRIMARY KEY (schedule_id),
    UNIQUE KEY uq_kitchen_meal_schedule (service_date, meal_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS kitchen_meal_service (
    meal_service_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    resident_id BIGINT UNSIGNED NOT NULL,
    service_date DATE NOT NULL,
    meal_type ENUM('breakfast','lunch','dinner','snack') NOT NULL,
    status ENUM('pending','served','skipped') NOT NULL DEFAULT 'pending',
    served_at TIMESTAMP NULL DEFAULT NULL,
    served_by BIGINT UNSIGNED NULL DEFAULT NULL,
    PRIMARY KEY (meal_service_id),
    UNIQUE KEY uq_kitchen_meal_service (resident_id, service_date, meal_type),
    KEY idx_kitchen_meal_date (service_date, meal_type),
    CONSTRAINT fk_kitchen_meal_resident FOREIGN KEY (resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE,
    CONSTRAINT fk_kitchen_meal_staff FOREIGN KEY (served_by) REFERENCES kitchen_staff(staff_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS kitchen_emergency_alerts (
    alert_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    resident_id BIGINT UNSIGNED NULL DEFAULT NULL,
    staff_id BIGINT UNSIGNED NULL DEFAULT NULL,
    message VARCHAR(500) NOT NULL,
    status ENUM('active','acknowledged','resolved') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (alert_id),
    KEY idx_kitchen_alert_status (status, created_at),
    CONSTRAINT fk_kitchen_alert_resident FOREIGN KEY (resident_id) REFERENCES residents(resident_id) ON DELETE SET NULL,
    CONSTRAINT fk_kitchen_alert_staff FOREIGN KEY (staff_id) REFERENCES kitchen_staff(staff_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS kitchen_cooler_readings (
    reading_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    temperature_c DECIMAL(4,1) NOT NULL,
    status ENUM('optimal','warning','critical') NOT NULL DEFAULT 'optimal',
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (reading_id),
    KEY idx_kitchen_cooler_time (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Demo kitchen login: kitchen@caredirect.local / password
INSERT INTO kitchen_staff (full_name, email, password_hash)
SELECT 'Kitchen Staff', 'kitchen@caredirect.local', '$2y$12$NqPlgHXXHwi7Bwi49Mcy7.O0zMh2uwWoRxbGwOHMc.rVn8oaBvAs.'
WHERE NOT EXISTS (SELECT 1 FROM kitchen_staff WHERE email = 'kitchen@caredirect.local');

-- Kitchen information for the two residents in the supplied CareDirect database.
INSERT INTO kitchen_resident_profiles (resident_id, room_number, diet_flag, preferences)
SELECT 3, '302A', 'low-salt', 'No gravy, mash instead of roast'
WHERE EXISTS (SELECT 1 FROM residents WHERE resident_id = 3)
  AND NOT EXISTS (SELECT 1 FROM kitchen_resident_profiles WHERE resident_id = 3);

INSERT INTO kitchen_resident_profiles (resident_id, room_number, diet_flag, preferences)
SELECT 4, '105', 'sugar-free', 'Double portion veggies'
WHERE EXISTS (SELECT 1 FROM residents WHERE resident_id = 4)
  AND NOT EXISTS (SELECT 1 FROM kitchen_resident_profiles WHERE resident_id = 4);

INSERT INTO kitchen_meal_schedule (service_date, meal_type, service_time) VALUES
(CURDATE(), 'breakfast', '08:00:00'),
(CURDATE(), 'lunch', '12:30:00'),
(CURDATE(), 'dinner', '19:00:00')
ON DUPLICATE KEY UPDATE service_time = VALUES(service_time);

INSERT INTO kitchen_cooler_readings (temperature_c, status)
SELECT 3.4, 'optimal'
WHERE NOT EXISTS (SELECT 1 FROM kitchen_cooler_readings);
