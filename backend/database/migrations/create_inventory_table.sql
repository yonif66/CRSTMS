-- CRSTMS Database Migration: create_inventory_table.sql


SET FOREIGN_KEY_CHECKS = 0;

-- Table structure for table `spare_parts`
DROP TABLE IF EXISTS `spare_parts`;
CREATE TABLE spare_parts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  part_name VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100) UNIQUE NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  unit_price DECIMAL(10,2) NOT NULL,
  low_stock_threshold INT NOT NULL DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `inventory_logs`
DROP TABLE IF EXISTS `inventory_logs`;
CREATE TABLE inventory_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  part_id INT NOT NULL,
  user_id INT NOT NULL,
  quantity_changed INT NOT NULL,
  action_type ENUM('Restock', 'Used in Repair', 'Manual Adjust') NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES spare_parts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
