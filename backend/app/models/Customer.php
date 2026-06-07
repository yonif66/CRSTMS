<?php
/**
 * CRSTMS - Customer OOP Model
 */

namespace App\Models;

use PDO;
use Exception;

class Customer extends BaseModel {

    /**
     * Finds customer profile and merges parent user credential details.
     */
    public function find(int $userId): ?array {
        $sql = "SELECT c.*, u.full_name, u.phone_number as primary_phone, u.role, u.created_at as registered_date 
                FROM customers c 
                JOIN users u ON c.user_id = u.id 
                WHERE c.user_id = :user_id LIMIT 1";
        
        $stmt = $this->query($sql, ['user_id' => $userId]);
        $result = $stmt->fetch();
        return $result ? $result : null;
    }

    /**
     * Prevents duplicate logins/customers with existing email addresses.
     */
    public function emailExists(string $email, ?int $excludeUserId = null): bool {
        $sql = "SELECT 1 FROM customers WHERE email = :email";
        $params = ['email' => $email];
        if ($excludeUserId !== null) {
            $sql .= " AND user_id != :exclude_id";
            $params['exclude_id'] = $excludeUserId;
        }
        $stmt = $this->query($sql, $params);
        return (bool)$stmt->fetchColumn();
    }

    /**
     * Creates a customer account inside user and customer registries transactional-ly.
     * Prevents half-baked data leaks by rolling back upon unexpected PDO failures.
     */
    public function registerCustomer(array $profile): int {
        if ($this->emailExists($profile['email'])) {
            throw new Exception("Registration conflict error: A customer with email '{$profile['email']}' is already registered.");
        }

        $this->beginTransaction();
        try {
            // 1. Create entry in users credentials table
            // Password is cryptographically salted using high-grade Argon2id hash protocols
            $hashedPassword = password_hash($profile['password'] ?? 'crstms_default123', PASSWORD_ARGON2ID);
            
            $sqlUser = "INSERT INTO users (username, password_hash, full_name, phone_number, role) 
                        VALUES (:username, :password, :full_name, :phone, 'Customer')";
            
            $username = $profile['username'] ?? strtolower(str_replace(' ', '_', $profile['full_name'])) . rand(10, 99);
            
            $this->query($sqlUser, [
                'username'  => $username,
                'password'  => $hashedPassword,
                'full_name' => $profile['full_name'],
                'phone'     => $profile['phone_number']
            ]);

            $userId = (int)$this->db->lastInsertId();

            // 2. Create corresponding client settings mapping Profile
            $sqlCustomer = "INSERT INTO customers (user_id, email, address, alternative_phone) 
                            VALUES (:user_id, :email, :address, :alt_phone)";
            
            $this->query($sqlCustomer, [
                'user_id'   => $userId,
                'email'     => $profile['email'],
                'address'   => $profile['address'],
                'alt_phone' => $profile['alternative_phone'] ?? null
            ]);

            $this->commit();
            return $userId;

        } catch (Exception $e) {
            $this->rollBack();
            throw new Exception("Operational Failure committing Customer creation transaction: " . $e->getMessage());
        }
    }

    /**
     * Updates customer and parent users profiles inside a secure transaction.
     */
    public function updateCustomer(int $userId, array $data): bool {
        if ($this->emailExists($data['email'], $userId)) {
            throw new Exception("Constraint Violation: Email '{$data['email']}' is already in use by another billing profile.");
        }

        $this->beginTransaction();
        try {
            // Update Base User Credentials Name & Primary Phone
            $sqlUser = "UPDATE users SET full_name = :full_name, phone_number = :phone WHERE id = :id";
            $this->query($sqlUser, [
                'full_name' => $data['full_name'],
                'phone'     => $data['phone_number'],
                'id'        => $userId
            ]);

            // Update Specific Contact and Billing Options
            $sqlCust = "UPDATE customers SET email = :email, address = :address, alternative_phone = :alt_phone WHERE user_id = :user_id";
            $this->query($sqlCust, [
                'email'     => $data['email'],
                'address'   => $data['address'],
                'alt_phone' => $data['alternative_phone'] ?? null,
                'user_id'   => $userId
            ]);

            $this->commit();
            return true;
        } catch (Exception $e) {
            $this->rollBack();
            throw new Exception("Failed to update customer transaction: " . $e->getMessage());
        }
    }

    /**
     * Safely deletes/deactivates a customer.
     */
    public function deleteCustomer(int $userId): bool {
        $this->beginTransaction();
        try {
            // Cascade rules will automatically delete customer metadata upon user master deletion
            $sql = "DELETE FROM users WHERE id = :id AND role = 'Customer'";
            $this->query($sql, ['id' => $userId]);
            $this->commit();
            return true;
        } catch (Exception $e) {
            $this->rollBack();
            throw new Exception("Cascaded delete transaction failed safely: " . $e->getMessage());
        }
    }

    /**
     * Searches customers based on full text elements with pagination constraints.
     */
    public function search(string $term, int $limit = 10, int $offset = 0): array {
        $sql = "SELECT c.*, u.full_name, u.phone_number as primary_phone, u.created_at as registered_date 
                FROM customers c 
                JOIN users u ON c.user_id = u.id";
        
        $params = [];
        if (!empty($term)) {
            $sql .= " WHERE u.full_name LIKE :term OR c.email LIKE :term OR u.phone_number LIKE :term";
            $params['term'] = "%{$term}%";
        }
        
        $sql .= " ORDER BY u.full_name ASC LIMIT :limit OFFSET :offset";
        
        // Manual binding necessary for integer variables in PDO strict environments
        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val, PDO::PARAM_STR);
        }
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }

    /**
     * Aggregates total customer count for pagination calculation.
     */
    public function getCount(string $term = ""): int {
        $sql = "SELECT COUNT(*) FROM customers c JOIN users u ON c.user_id = u.id";
        $params = [];
        if (!empty($term)) {
            $sql .= " WHERE u.full_name LIKE :term OR c.email LIKE :term";
            $params['term'] = "%{$term}%";
        }
        $stmt = $this->query($sql, $params);
        return (int)$stmt->fetchColumn();
    }

    /**
     * Retrieves all history of hardware repairs under this Customer ID.
     */
    public function getRepairHistory(int $userId): array {
        $sql = "SELECT t.*, d.brand, d.model, d.serial_number,
                       u.full_name as technician_name,
                       (SELECT SUM(unit_price) FROM spare_parts WHERE id IN (
                           SELECT part_id FROM inventory_logs WHERE notes LIKE CONCAT('%Ticket #', t.id, '%')
                       )) as part_costs
                FROM repair_tickets t
                JOIN devices d ON t.device_id = d.id
                LEFT JOIN users u ON t.technician_id = u.id
                WHERE t.customer_id = :user_id
                ORDER BY t.created_at DESC";
                
        return $this->query($sql, ['user_id' => $userId])->fetchAll();
    }
}