-- CRSTMS Database Migration: create_users_table.sql


SET FOREIGN_KEY_CHECKS = 0;

-- Table structure for table `users`
DROP TABLE IF EXISTS `users`;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  role ENUM('Admin', 'Receptionist', 'Technician', 'Customer', 'Delivery') NOT NULL DEFAULT 'Customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `admins`
DROP TABLE IF EXISTS `admins`;
CREATE TABLE admins (
  user_id INT PRIMARY KEY,
  access_level INT NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `customers`
DROP TABLE IF EXISTS `customers`;
CREATE TABLE customers (
  user_id INT PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  address TEXT NOT NULL,
  alternative_phone VARCHAR(20) NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `technicians`
DROP TABLE IF EXISTS `technicians`;
CREATE TABLE technicians (
  user_id INT PRIMARY KEY,
  specialization VARCHAR(100) NOT NULL,
  availability_status ENUM('Available', 'In Repair', 'On Leave') NOT NULL DEFAULT 'Available',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `receptionists`
DROP TABLE IF EXISTS `receptionists`;
CREATE TABLE receptionists (
  user_id INT PRIMARY KEY,
  desk_number VARCHAR(20) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `delivery_personnel`
DROP TABLE IF EXISTS `delivery_personnel`;
CREATE TABLE delivery_personnel (
  user_id INT PRIMARY KEY,
  vehicle_type VARCHAR(50) NOT NULL,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
