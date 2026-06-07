-- CRSTMS Database Migration: create_repair_tickets_table.sql

SET FOREIGN_KEY_CHECKS = 0;

-- Table structure for table `devices`
DROP TABLE IF EXISTS `devices`;
CREATE TABLE devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  device_type VARCHAR(50) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  serial_number VARCHAR(100) NOT NULL,
  issue_description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `repair_tickets`
DROP TABLE IF EXISTS `repair_tickets`;
CREATE TABLE repair_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  device_id INT NOT NULL,
  receptionist_id INT NOT NULL,
  technician_id INT NULL,
  status ENUM('Created', 'Assigned', 'In Progress', 'Waiting for Spare Parts', 'Completed', 'Ready for Delivery', 'Delivered', 'Closed') NOT NULL DEFAULT 'Created',
  estimated_completion_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(user_id) ON DELETE RESTRICT,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  FOREIGN KEY (receptionist_id) REFERENCES receptionists(user_id) ON DELETE RESTRICT,
  FOREIGN KEY (technician_id) REFERENCES technicians(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `repair_updates`
DROP TABLE IF EXISTS `repair_updates`;
CREATE TABLE repair_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  technician_id INT NOT NULL,
  update_status VARCHAR(50) NOT NULL,
  diagnostic_notes TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES repair_tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (technician_id) REFERENCES technicians(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `deliveries`
DROP TABLE IF EXISTS `deliveries`;
CREATE TABLE deliveries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  customer_id INT NOT NULL,
  device_id INT NOT NULL,
  delivery_personnel_id INT NULL,
  pickup_date DATETIME NULL,
  delivery_date DATETIME NULL,
  status ENUM('Pending', 'Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Confirmed') NOT NULL DEFAULT 'Pending',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES repair_tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(user_id) ON DELETE CASCADE,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  FOREIGN KEY (delivery_personnel_id) REFERENCES delivery_personnel(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `inquiries`
DROP TABLE IF EXISTS `inquiries`;
CREATE TABLE inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  assigned_staff_id INT NULL,
  status ENUM('Open', 'In Progress', 'Responded', 'Escalated', 'Closed') NOT NULL DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(user_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_staff_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `inquiry_responses`
DROP TABLE IF EXISTS `inquiry_responses`;
CREATE TABLE inquiry_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inquiry_id INT NOT NULL,
  responder_id INT NOT NULL,
  response_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE,
  FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `system_logs`
DROP TABLE IF EXISTS `system_logs`;
CREATE TABLE system_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action_type VARCHAR(100) NOT NULL,
  affected_module VARCHAR(100) NOT NULL,
  reference_id VARCHAR(50) NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
