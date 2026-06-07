-- CRSTMS Database Migration: create_invoices_table.sql


SET FOREIGN_KEY_CHECKS = 0;

-- Table structure for table `invoices`
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT UNIQUE NOT NULL,
  service_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  spare_parts_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.15,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status ENUM('Unpaid', 'Paid') NOT NULL DEFAULT 'Unpaid',
  invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES repair_tickets(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
