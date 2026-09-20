-- =====================================================================
-- CareDirect - Registration Database Schema
-- Generated from Registration.html (Guardian / Resident sign-up form)
-- Target: MySQL 8.0+ (InnoDB, utf8mb4)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS caredirect
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE caredirect;

-- ---------------------------------------------------------------------
-- 1. USERS  (shared account fields for both roles)
-- ---------------------------------------------------------------------
CREATE TABLE users (
    user_id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(150)    NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,   -- store a hash, never plaintext
    role            ENUM('guardian', 'resident') NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                     ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. GUARDIANS  (1-to-1 with users where role = 'guardian')
-- ---------------------------------------------------------------------
CREATE TABLE guardians (
    guardian_id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT UNSIGNED NOT NULL,
    phone_number     VARCHAR(20)     NOT NULL,
    guardian_code    VARCHAR(30)     NOT NULL,   -- e.g. "GDN-10025"
    relation_type    ENUM('parent','spouse','child','sibling',
                          'relative','friend','legal-guardian') NOT NULL,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_guardians_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_guardians_user UNIQUE (user_id),
    CONSTRAINT uq_guardians_code UNIQUE (guardian_code)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. SERVICE CATEGORIES  (lookup table: Standard / Premium)
-- ---------------------------------------------------------------------
CREATE TABLE service_categories (
    service_code     VARCHAR(20)     PRIMARY KEY,   -- 'standard' | 'premium'
    service_name     VARCHAR(50)     NOT NULL,
    monthly_price    DECIMAL(10,2)   NOT NULL,
    description      TEXT
) ENGINE=InnoDB;

INSERT INTO service_categories (service_code, service_name, monthly_price, description) VALUES
    ('standard', 'Standard', 1200.00,
     'Daily living support, shared common areas, weekly wellness checks.'),
    ('premium',  'Premium',  2200.00,
     'Private suite option, daily nursing visits, dedicated care coordinator.');

-- ---------------------------------------------------------------------
-- 4. RESIDENTS  (1-to-1 with users where role = 'resident')
-- ---------------------------------------------------------------------
CREATE TABLE residents (
    resident_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT UNSIGNED NOT NULL,
    guardian_id       BIGINT UNSIGNED NULL,        -- optional linked guardian
    age               TINYINT UNSIGNED NOT NULL CHECK (age BETWEEN 0 AND 120),
    gender            ENUM('female','male','non-binary','prefer-not') NOT NULL,
    health_conditions TEXT NULL,                   -- sensitive: restrict access at app layer
    service_code      VARCHAR(20) NOT NULL DEFAULT 'standard',
    created_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_residents_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_residents_guardian
        FOREIGN KEY (guardian_id) REFERENCES guardians(guardian_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_residents_service
        FOREIGN KEY (service_code) REFERENCES service_categories(service_code),
    CONSTRAINT uq_residents_user UNIQUE (user_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. EMERGENCY CONTACTS  (1-to-many: a resident may list contacts)
-- ---------------------------------------------------------------------
CREATE TABLE emergency_contacts (
    contact_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resident_id      BIGINT UNSIGNED NOT NULL,
    contact_name     VARCHAR(150) NOT NULL,
    contact_phone    VARCHAR(20)  NOT NULL,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_emergency_resident
        FOREIGN KEY (resident_id) REFERENCES residents(resident_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. CARE ITEMS  (1-to-many: medications / therapy / routine checks)
-- ---------------------------------------------------------------------
CREATE TABLE care_items (
    care_item_id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resident_id      BIGINT UNSIGNED NOT NULL,
    care_type        ENUM('medication','therapy','routine-check') NOT NULL,
    item_name        VARCHAR(150) NOT NULL,
    purpose          VARCHAR(255),
    scheduled_time   TIME,
    frequency        ENUM('daily','twice-daily','weekly','as-needed'),
    notes            TEXT,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_care_items_resident
        FOREIGN KEY (resident_id) REFERENCES residents(resident_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Helpful indexes
-- ---------------------------------------------------------------------
CREATE INDEX idx_users_role            ON users(role);
CREATE INDEX idx_residents_guardian    ON residents(guardian_id);
CREATE INDEX idx_care_items_resident   ON care_items(resident_id);
CREATE INDEX idx_emergency_resident    ON emergency_contacts(resident_id);

-- =====================================================================
-- Example inserts (matches the demo form defaults) — remove in production
-- =====================================================================
-- INSERT INTO users (full_name, email, password_hash, role)
--     VALUES ('Jane Doe', 'jane@example.com', '<bcrypt-hash>', 'resident');
-- INSERT INTO residents (user_id, age, gender, health_conditions, service_code)
--     VALUES (LAST_INSERT_ID(), 78, 'female', 'diabetes, limited mobility', 'standard');
