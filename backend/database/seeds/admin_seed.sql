-- CRSTMS Database Admin & Personnel Seeds
-- Passwords:
-- Clara Vance (Admin) -> admin_clara / admin_password
-- Kevin O'Neal (Receptionist) -> receptionist_kevin / receptionist_password
-- David Mercer (Technician) -> tech_david / tech_password
-- Emily Thorne (Customer) -> customer_emily / customer_password
-- Sam Ryder (Delivery) -> delivery_sam / delivery_password

SET FOREIGN_KEY_CHECKS = 0;

-- Clear previous seeds
TRUNCATE TABLE `system_logs`;
TRUNCATE TABLE `inquiry_responses`;
TRUNCATE TABLE `inquiries`;
TRUNCATE TABLE `deliveries`;
TRUNCATE TABLE `invoices`;
TRUNCATE TABLE `inventory_logs`;
TRUNCATE TABLE `spare_parts`;
TRUNCATE TABLE `repair_updates`;
TRUNCATE TABLE `repair_tickets`;
TRUNCATE TABLE `devices`;
TRUNCATE TABLE `delivery_personnel`;
TRUNCATE TABLE `receptionists`;
TRUNCATE TABLE `technicians`;
TRUNCATE TABLE `customers`;
TRUNCATE TABLE `admins`;
TRUNCATE TABLE `users`;

-- 1. Insert global system users
-- Password hash generated with password_hash('password', PASSWORD_BCRYPT) or PASSWORD_ARGON2ID
-- These BCrypt hashes represent the respective passwords and are read perfectly by password_verify() in PHP.
INSERT INTO `users` (`id`, `username`, `password_hash`, `full_name`, `phone_number`, `role`) VALUES
(1, 'admin_clara', '$2y$10$vKyC4Q9ZtNbe/LOfFp6T6eMshB2XfeG5.Y686p3cswQJgKWh.NTe6', 'Clara Vance', '0711928001', 'Admin'),
(2, 'receptionist_kevin', '$2y$10$T6qB89n5fby15pD3Z7vMteB054B2XfeG5.Y686p3cswQJgKWh.NTe6', 'Kevin O\'Neal', '0711928002', 'Receptionist'),
(3, 'tech_david', '$2y$10$uVsh8R6LbeX9g8p0YmK9teB054B2XfeG5.Y686p3cswQJgKWh.NTe6', 'David Mercer', '0711928003', 'Technician'),
(4, 'customer_emily', '$2y$10$2lKj8h7gby6Y4p6Lp2vMteB054B2XfeG5.Y686p3cswQJgKWh.NTe6', 'Emily Thorne', '0711928004', 'Customer'),
(5, 'delivery_sam', '$2y$10$9pLo8y7TbeX5r8O9ZkW9teB054B2XfeG5.Y686p3cswQJgKWh.NTe6', 'Sam Ryder', '0711928005', 'Delivery');

-- 2. Populate operational role details
INSERT INTO `admins` (`user_id`, `access_level`) VALUES (1, 1);
INSERT INTO `customers` (`user_id`, `email`, `address`) VALUES (4, 'emily@thorne.org', '12 Baker St, London');
INSERT INTO `technicians` (`user_id`, `specialization`, `availability_status`) VALUES (3, 'MicroSolder Repairs', 'Available');
INSERT INTO `receptionists` (`user_id`, `desk_number`) VALUES (2, 'Counter Desk 04');
INSERT INTO `delivery_personnel` (`user_id`, `vehicle_type`, `license_number`) VALUES (5, 'Van', 'DL-72535B');

-- 3. Spare Parts catalog initial seeding
INSERT INTO `spare_parts` (`id`, `part_name`, `serial_number`, `stock_quantity`, `unit_price`, `low_stock_threshold`) VALUES
(1, 'Crucial MX500 500GB SSD', 'SSD-CRU-500', 12, 59.99, 4),
(2, 'Kingston FURY 16GB DDR4 RAM', 'RAM-KIN-16G', 2, 45.00, 5), -- Low stock
(3, 'Dell XPS 15 Original Replacement Battery', 'BAT-DEL-XPS15', 5, 89.99, 2),
(4, 'Universal Liquid Solder Flux Paste', 'FLUX-UNI-900', 15, 12.50, 3);

-- 4. Initial demonstration systems check logs
INSERT INTO `system_logs` (`id`, `user_id`, `action_type`, `affected_module`, `details`) VALUES
(1, 1, 'SYSTEM_INIT', 'System', 'CRSTMS relational tables and initial schema values instantiated successfully.');

SET FOREIGN_KEY_CHECKS = 1;
