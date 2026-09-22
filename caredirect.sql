-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 22, 2026 at 05:23 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `caredirect`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `activity_id` bigint(20) UNSIGNED NOT NULL,
  `resident_id` bigint(20) UNSIGNED NOT NULL,
  `activity_type` enum('meal','medication','exercise','social','health-check','therapy','other') NOT NULL DEFAULT 'other',
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `recorded_by` varchar(150) DEFAULT NULL,
  `activity_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `billing`
--

CREATE TABLE `billing` (
  `bill_id` bigint(20) UNSIGNED NOT NULL,
  `resident_id` bigint(20) UNSIGNED NOT NULL,
  `billing_month` date NOT NULL,
  `service_code` varchar(20) NOT NULL,
  `amount_due` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('unpaid','partial','paid','overdue') NOT NULL DEFAULT 'unpaid',
  `due_date` date NOT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `care_items`
--

CREATE TABLE `care_items` (
  `care_item_id` bigint(20) UNSIGNED NOT NULL,
  `resident_id` bigint(20) UNSIGNED NOT NULL,
  `care_type` enum('medication','therapy','routine-check') NOT NULL,
  `item_name` varchar(150) NOT NULL,
  `purpose` varchar(255) DEFAULT NULL,
  `scheduled_time` time DEFAULT NULL,
  `frequency` enum('daily','twice-daily','weekly','as-needed') DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `care_items`
--

INSERT INTO `care_items` (`care_item_id`, `resident_id`, `care_type`, `item_name`, `purpose`, `scheduled_time`, `frequency`, `notes`, `created_at`) VALUES
(1, 3, 'medication', 'Metforming 500mg', 'Diabetes Managemenet', '14:00:00', 'twice-daily', '', '2026-09-19 18:56:33'),
(2, 4, 'medication', 'Abecabe 5/20', 'Blood Pressure Management', '14:00:00', 'daily', '', '2026-09-20 08:24:10');

-- --------------------------------------------------------

--
-- Table structure for table `emergency_contacts`
--

CREATE TABLE `emergency_contacts` (
  `contact_id` bigint(20) UNSIGNED NOT NULL,
  `resident_id` bigint(20) UNSIGNED NOT NULL,
  `contact_name` varchar(150) NOT NULL,
  `contact_phone` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `emergency_contacts`
--

INSERT INTO `emergency_contacts` (`contact_id`, `resident_id`, `contact_name`, `contact_phone`, `created_at`) VALUES
(1, 3, 'Mr.Karim', '01970322911', '2026-09-19 18:56:33'),
(2, 4, 'Tanim', '01970311911', '2026-09-20 08:24:10');

-- --------------------------------------------------------

--
-- Table structure for table `guardians`
--

CREATE TABLE `guardians` (
  `guardian_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `guardian_code` varchar(30) NOT NULL,
  `relation_type` enum('parent','spouse','child','sibling','relative','friend','legal-guardian') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `guardians`
--

INSERT INTO `guardians` (`guardian_id`, `user_id`, `phone_number`, `guardian_code`, `relation_type`, `created_at`) VALUES
(1, 5, '01670322911', 'GDN-00005', 'child', '2026-09-20 12:39:17');

-- --------------------------------------------------------

--
-- Table structure for table `medication_logs`
--

CREATE TABLE `medication_logs` (
  `log_id` bigint(20) UNSIGNED NOT NULL,
  `care_item_id` bigint(20) UNSIGNED NOT NULL,
  `resident_id` bigint(20) UNSIGNED NOT NULL,
  `scheduled_date` date NOT NULL,
  `scheduled_time` time NOT NULL,
  `status` enum('pending','completed','missed','skipped') NOT NULL DEFAULT 'pending',
  `taken_at` timestamp NULL DEFAULT NULL,
  `administered_by` varchar(150) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `residents`
--

CREATE TABLE `residents` (
  `resident_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `guardian_id` bigint(20) UNSIGNED DEFAULT NULL,
  `age` tinyint(3) UNSIGNED NOT NULL CHECK (`age` between 0 and 120),
  `gender` enum('female','male','non-binary','prefer-not') NOT NULL,
  `health_conditions` text DEFAULT NULL,
  `service_code` varchar(20) NOT NULL DEFAULT 'standard',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `residents`
--

INSERT INTO `residents` (`resident_id`, `user_id`, `guardian_id`, `age`, `gender`, `health_conditions`, `service_code`, `created_at`) VALUES
(3, 3, 1, 56, 'male', 'Diabetes', 'standard', '2026-09-19 18:56:33'),
(4, 4, NULL, 63, 'male', 'High Blood Pressure', 'premium', '2026-09-20 08:24:10');

-- --------------------------------------------------------

--
-- Table structure for table `service_categories`
--

CREATE TABLE `service_categories` (
  `service_code` varchar(20) NOT NULL,
  `service_name` varchar(50) NOT NULL,
  `monthly_price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `service_categories`
--

INSERT INTO `service_categories` (`service_code`, `service_name`, `monthly_price`, `description`) VALUES
('premium', 'Premium', 2200.00, 'Private suite option, daily nursing visits, dedicated care coordinator.'),
('standard', 'Standard', 1200.00, 'Daily living support, shared common areas, weekly wellness checks.');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('guardian','resident') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `full_name`, `email`, `password_hash`, `role`, `created_at`, `updated_at`) VALUES
(1, 'Ibna Salehin', 'ibnasalehin9@gmail.com', '$2y$10$gy.D2viH33.Qn9UJAf5NE.FkrPnrAbb5WjwQ47QC66ld41TZDchsC', 'resident', '2026-09-19 18:47:54', '2026-09-19 18:47:54'),
(3, 'Abdur Rahman', 'ibnasalehin@gmail.com', '$2y$10$AR0Nd8t65gGyHEgtQ2oxJO4LujtW1npURSHVt51SX2j/zNU0YPjRi', 'resident', '2026-09-19 18:56:33', '2026-09-19 18:56:33'),
(4, 'Abdur Karim', 'abdurkarim@gmail.com', '$2y$10$80t/d9xwsed82OALMm/fvu4V32DJZKIOK7nZMm/SNP9qau1/PK50q', 'resident', '2026-09-20 08:24:10', '2026-09-20 08:29:05'),
(5, 'MD. Sabbir', 'sabbir@gmail.com', '$2y$10$UMaDYCJzCKa1N74vIpnZFOQ/2qHlJEozzcgNJstaXYIArld9j5Rr6', 'guardian', '2026-09-20 12:39:17', '2026-09-20 12:39:17');

-- --------------------------------------------------------

--
-- Table structure for table `vitals`
--

CREATE TABLE `vitals` (
  `vital_id` bigint(20) UNSIGNED NOT NULL,
  `resident_id` bigint(20) UNSIGNED NOT NULL,
  `bp_systolic` smallint(5) UNSIGNED DEFAULT NULL,
  `bp_diastolic` smallint(5) UNSIGNED DEFAULT NULL,
  `bp_status` enum('stable','low','high','critical') DEFAULT NULL,
  `heart_rate` smallint(5) UNSIGNED DEFAULT NULL,
  `heart_rate_status` enum('normal','low','high','critical') DEFAULT NULL,
  `blood_sugar` decimal(5,1) DEFAULT NULL,
  `blood_sugar_unit` enum('mmol/L','mg/dL','%') DEFAULT 'mmol/L',
  `blood_sugar_status` enum('normal','pre-diabetic','diabetic','critical') DEFAULT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `recorded_by` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`activity_id`),
  ADD KEY `idx_actlog_resident` (`resident_id`),
  ADD KEY `idx_actlog_activity_at` (`activity_at`);

--
-- Indexes for table `billing`
--
ALTER TABLE `billing`
  ADD PRIMARY KEY (`bill_id`),
  ADD UNIQUE KEY `uq_billing_month` (`resident_id`,`billing_month`),
  ADD KEY `fk_billing_service` (`service_code`),
  ADD KEY `idx_billing_resident` (`resident_id`),
  ADD KEY `idx_billing_status` (`status`);

--
-- Indexes for table `care_items`
--
ALTER TABLE `care_items`
  ADD PRIMARY KEY (`care_item_id`),
  ADD KEY `idx_care_items_resident` (`resident_id`);

--
-- Indexes for table `emergency_contacts`
--
ALTER TABLE `emergency_contacts`
  ADD PRIMARY KEY (`contact_id`),
  ADD KEY `idx_emergency_resident` (`resident_id`);

--
-- Indexes for table `guardians`
--
ALTER TABLE `guardians`
  ADD PRIMARY KEY (`guardian_id`),
  ADD UNIQUE KEY `uq_guardians_user` (`user_id`),
  ADD UNIQUE KEY `uq_guardians_code` (`guardian_code`);

--
-- Indexes for table `medication_logs`
--
ALTER TABLE `medication_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD UNIQUE KEY `uq_medlog_slot` (`care_item_id`,`scheduled_date`,`scheduled_time`),
  ADD KEY `idx_medlog_resident_date` (`resident_id`,`scheduled_date`),
  ADD KEY `idx_medlog_status` (`status`);

--
-- Indexes for table `residents`
--
ALTER TABLE `residents`
  ADD PRIMARY KEY (`resident_id`),
  ADD UNIQUE KEY `uq_residents_user` (`user_id`),
  ADD KEY `fk_residents_service` (`service_code`),
  ADD KEY `idx_residents_guardian` (`guardian_id`);

--
-- Indexes for table `service_categories`
--
ALTER TABLE `service_categories`
  ADD PRIMARY KEY (`service_code`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `uq_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`);

--
-- Indexes for table `vitals`
--
ALTER TABLE `vitals`
  ADD PRIMARY KEY (`vital_id`),
  ADD KEY `idx_vitals_resident` (`resident_id`),
  ADD KEY `idx_vitals_recorded_at` (`recorded_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `activity_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `billing`
--
ALTER TABLE `billing`
  MODIFY `bill_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `care_items`
--
ALTER TABLE `care_items`
  MODIFY `care_item_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `emergency_contacts`
--
ALTER TABLE `emergency_contacts`
  MODIFY `contact_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `guardians`
--
ALTER TABLE `guardians`
  MODIFY `guardian_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `medication_logs`
--
ALTER TABLE `medication_logs`
  MODIFY `log_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `residents`
--
ALTER TABLE `residents`
  MODIFY `resident_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `vitals`
--
ALTER TABLE `vitals`
  MODIFY `vital_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `fk_actlog_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE CASCADE;

--
-- Constraints for table `billing`
--
ALTER TABLE `billing`
  ADD CONSTRAINT `fk_billing_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_billing_service` FOREIGN KEY (`service_code`) REFERENCES `service_categories` (`service_code`);

--
-- Constraints for table `care_items`
--
ALTER TABLE `care_items`
  ADD CONSTRAINT `fk_care_items_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE CASCADE;

--
-- Constraints for table `emergency_contacts`
--
ALTER TABLE `emergency_contacts`
  ADD CONSTRAINT `fk_emergency_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE CASCADE;

--
-- Constraints for table `guardians`
--
ALTER TABLE `guardians`
  ADD CONSTRAINT `fk_guardians_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `medication_logs`
--
ALTER TABLE `medication_logs`
  ADD CONSTRAINT `fk_medlog_care_item` FOREIGN KEY (`care_item_id`) REFERENCES `care_items` (`care_item_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_medlog_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE CASCADE;

--
-- Constraints for table `residents`
--
ALTER TABLE `residents`
  ADD CONSTRAINT `fk_residents_guardian` FOREIGN KEY (`guardian_id`) REFERENCES `guardians` (`guardian_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_residents_service` FOREIGN KEY (`service_code`) REFERENCES `service_categories` (`service_code`),
  ADD CONSTRAINT `fk_residents_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `vitals`
--
ALTER TABLE `vitals`
  ADD CONSTRAINT `fk_vitals_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
