<?php
/**
 * CRSTMS - User Model
 * Models system users, credentials, role authorizations, and password matching checks.
 */

namespace App\Models;

use App\Models\BaseModel;
use PDO;

class User extends BaseModel {
    
    /**
     * Find a user record by username securely
     * 
     * @param string $username
     * @return array|false
     */
    public function findByUsername(string $username) {
        $sql = "SELECT * FROM users WHERE username = :username LIMIT 1";
        $stmt = $this->query($sql, ['username' => $username]);
        return $stmt->fetch();
    }

    /**
     * Find user record by ID
     * 
     * @param int $id
     * @return array|false
     */
    public function find(int $id) {
        $sql = "SELECT * FROM users WHERE id = :id LIMIT 1";
        $stmt = $this->query($sql, ['id' => $id]);
        return $stmt->fetch();
    }
    
    /**
     * Create a new user with secure password hash
     * 
     * @param array $data
     * @return int Last inserted ID
     */
    public function create(array $data): int {
        $sql = "INSERT INTO users (username, password_hash, full_name, phone_number, role) 
                VALUES (:username, :password_hash, :full_name, :phone_number, :role)";
        
        // Default to Argon2id as outlined in the SRS
        $passwordHash = password_hash($data['password'], PASSWORD_ARGON2ID);
        
        $this->query($sql, [
            'username' => $data['username'],
            'password_hash' => $passwordHash,
            'full_name' => $data['full_name'],
            'phone_number' => $data['phone_number'],
            'role' => $data['role'] ?? 'Customer'
        ]);
        
        return (int)$this->db->lastInsertId();
    }
}
