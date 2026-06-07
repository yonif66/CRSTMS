-- CRSTMS Database Migration: update_remote_request_support.sql
-- Add Customer Accounts & Remote Service Tracking fields to existing tables

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Create customer_accounts if not already present (mapping users with additional flags)
CREATE TABLE IF NOT EXISTS `customer_accounts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `address` TEXT NOT NULL,
  `contact_phone` VARCHAR(20) NOT NULL,
  `registered_remotely` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Alter repair_tickets to incorporate Remote Request parameters
ALTER TABLE `repair_tickets` 
  ADD COLUMN `remote_request` TINYINT(1) DEFAULT 0,
  ADD COLUMN `pickup_required` TINYINT(1) DEFAULT 0,
  ADD COLUMN `customer_address` TEXT NULL,
  ADD COLUMN `contact_phone` VARCHAR(20) NULL,
  ADD COLUMN `delivery_tracking_status` VARCHAR(50) DEFAULT 'None',
  ADD COLUMN `request_source` VARCHAR(50) DEFAULT 'Walk-in',
  ADD COLUMN `device_image` VARCHAR(255) NULL;

SET FOREIGN_KEY_CHECKS = 1;
