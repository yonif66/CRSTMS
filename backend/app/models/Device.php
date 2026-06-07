<?php
/**
 * CRSTMS - Device OOP Model
 */

namespace App\Models;

use PDO;
use Exception;

class Device extends BaseModel {

    /**
     * Finds standard device details and corresponding owner file.
     */
    public function find(int $id): ?array {
        $sql = "SELECT d.*, u.full_name as owner_name, c.email as owner_email 
                FROM devices d
                JOIN customers c ON d.customer_id = c.user_id
                JOIN users u ON c.user_id = u.id
                WHERE d.id = :id LIMIT 1";
        return $this->query($sql, ['id' => $id])->fetch() ?: null;
    }

    /**
     * Prevents registering twin hardware components already tracked inside the system.
     */
    public function verifySerialNumber(string $serialNumber, ?int $excludeDeviceId = null): bool {
        $sql = "SELECT 1 FROM devices WHERE serial_number = :serial";
        $params = ['serial' => $serialNumber];
        if ($excludeDeviceId !== null) {
            $sql .= " AND id != :exclude_id";
            $params['exclude_id'] = $excludeDeviceId;
        }
        $stmt = $this->query($sql, $params);
        return (bool)$stmt->fetchColumn();
    }

    /**
     * Registers a device and bonds it to the customer.
     */
    public function registerDevice(array $deviceData): int {
        // Enforce strong uniqueness rules for hardware serial codes
        $serial = trim($deviceData['serial_number']);
        if ($this->verifySerialNumber($serial)) {
            throw new Exception("Operational conflict: Device Serial ID '{$serial}' is already registered under maintenance logs.");
        }

        $sql = "INSERT INTO devices (customer_id, device_type, brand, model, serial_number, issue_description) 
                VALUES (:customer_id, :device_type, :brand, :model, :serial, :issue)";
        
        $this->query($sql, [
            'customer_id'       => $deviceData['customer_id'],
            'device_type'       => $deviceData['device_type'],
            'brand'             => $deviceData['brand'],
            'model'             => $deviceData['model'],
            'serial'            => $serial,
            'issue'             => $deviceData['issue_description']
        ]);

        return (int)$this->db->lastInsertId();
    }

    /**
     * Updates device specifications in database.
     */
    public function updateDevice(int $id, array $data): bool {
        $serial = trim($data['serial_number']);
        if ($this->verifySerialNumber($serial, $id)) {
            throw new Exception("Database constraint violation: Serial Code '{$serial}' matches another system component asset.");
        }

        $sql = "UPDATE devices 
                SET device_type = :device_type, brand = :brand, model = :model, serial_number = :serial, issue_description = :issue 
                WHERE id = :id";
                
        $this->query($sql, [
            'device_type' => $data['device_type'],
            'brand'       => $data['brand'],
            'model'       => $data['model'],
            'serial'      => $serial,
            'issue'       => $data['issue_description'],
            'id'          => $id
        ]);

        return true;
    }

    /**
     * Links a list of registered units under a specific Customer.
     */
    public function getDevicesByCustomer(int $customerId): array {
        $sql = "SELECT d.*, 
                (SELECT COUNT(*) FROM repair_tickets WHERE device_id = d.id) as ticket_count
                FROM devices d 
                WHERE d.customer_id = :cust_id 
                ORDER BY d.created_at DESC";
        return $this->query($sql, ['cust_id' => $customerId])->fetchAll();
    }
}