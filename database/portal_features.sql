CREATE TABLE IF NOT EXISTS billing (
 bill_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 resident_id BIGINT UNSIGNED NOT NULL, billing_month DATE NOT NULL,
 service_code VARCHAR(30) NOT NULL, amount_due DECIMAL(12,2) NOT NULL,
 amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0, status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
 due_date DATE NOT NULL, paid_at DATETIME NULL, notes TEXT NULL,
 paid_by_user_id BIGINT UNSIGNED NULL, paid_by_role VARCHAR(20) NULL,
 UNIQUE KEY uq_billing_month (resident_id, billing_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS payments (
 payment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, bill_id BIGINT UNSIGNED NOT NULL,
 resident_id BIGINT UNSIGNED NOT NULL, paid_by_user_id BIGINT UNSIGNED NULL,
 paid_by_role VARCHAR(20) NULL, amount DECIMAL(12,2) NOT NULL,
 payment_method VARCHAR(30) NOT NULL, reference_number VARCHAR(80) NOT NULL,
 status VARCHAR(20) NOT NULL DEFAULT 'Completed', paid_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uq_payment_reference (reference_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS upgrade_requests (
 request_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, resident_id BIGINT UNSIGNED NOT NULL,
 requested_by_user_id BIGINT UNSIGNED NOT NULL, requested_by_role VARCHAR(20) NOT NULL,
 from_service VARCHAR(30) NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'pending',
 decision_note TEXT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 KEY idx_upgrade_resident (resident_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS emergency_alerts (
 alert_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, resident_id BIGINT UNSIGNED NULL,
 actor_id BIGINT UNSIGNED NOT NULL, actor_role VARCHAR(20) NOT NULL,
 message VARCHAR(500) NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'active',
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 KEY idx_emergency_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
