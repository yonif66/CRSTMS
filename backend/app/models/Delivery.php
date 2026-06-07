<?php
/**
 * CRSTMS - Delivery Model (OOP PHP Layout)
 */

namespace App\Models;

use Config\Database;
use App\Models\SystemLog;
use PDO;

class Delivery extends BaseModel {
    private int $id;
    private int $ticket_id;
    private int $customer_id;
    private int $device_id;
    private ?int $delivery_personnel_id;
    private ?string $pickup_date;
    private ?string $delivery_date;
    private string $status; // 'Pending', 'Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Confirmed'
    private ?string $notes;

    /**
     * Create delivery record for a completed repair ticket
     */
    public static function create(int $ticketId, int $customerId, int $deviceId, ?string $notes = null): bool {
        $db = Database::getConnection();
        
        // Enforce data integrity
        $stmt = $db->prepare("
            INSERT INTO deliveries (ticket_id, customer_id, device_id, status, notes)
            VALUES (?, ?, ?, 'Pending', ?)
        ");
        
        $result = $stmt->execute([$ticketId, $customerId, $deviceId, $notes]);
        if ($result) {
            $deliveryId = $db->lastInsertId();
            SystemLog::log(
                "CREATE_DELIVERY", 
                "Deliveries", 
                (string)$deliveryId, 
                "Delivery order scheduled automatically for Ticket #{$ticketId}", 
                $_SESSION['user_id'] ?? null
            );
            return true;
        }
        return false;
    }

    /**
     * Assign delivery personnel driver
     */
    public static function assign(int $deliveryId, int $personnelId): bool {
        $db = Database::getConnection();
        
        // Enforce driver verification
        $stmt = $db->prepare("
            UPDATE deliveries 
            SET delivery_personnel_id = ?, status = 'Assigned', pickup_date = NULL, delivery_date = NULL 
            WHERE id = ?
        ");
        
        $result = $stmt->execute([$personnelId, $deliveryId]);
        if ($result) {
            SystemLog::log(
                "ASSIGN_DELIVERY", 
                "Deliveries", 
                (string)$deliveryId, 
                "Assembled delivery coordinator personnel #{$personnelId} to order.", 
                $_SESSION['user_id'] ?? null
            );
            return true;
        }
        return false;
    }

    /**
     * Update delivery progress and log handovers
     */
    public static function updateStatus(int $deliveryId, string $status, ?string $notes = null): bool {
        $db = Database::getConnection();
        
        $allowedStatuses = ['Pending', 'Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Confirmed'];
        if (!in_array($status, $allowedStatuses)) {
            return false;
        }

        $pickupField = "";
        $deliveryField = "";
        $params = [];

        if ($status === 'Picked Up') {
            $pickupField = ", pickup_date = CURRENT_TIMESTAMP";
        } elseif ($status === 'Delivered') {
            $deliveryField = ", delivery_date = CURRENT_TIMESTAMP";
        }

        $sql = "UPDATE deliveries SET status = ? {$pickupField} {$deliveryField}";
        $params[] = $status;

        if ($notes !== null) {
            $sql .= ", notes = ?";
            $params[] = $notes;
        }

        $sql .= " WHERE id = ?";
        $params[] = $deliveryId;

        $stmt = $db->prepare($sql);
        $result = $stmt->execute($params);

        if ($result) {
            // Log update
            SystemLog::log(
                "UPDATE_DELIVERY_STATUS", 
                "Deliveries", 
                (string)$deliveryId, 
                "Delivery status updated to '{$status}'. Notes: {$notes}", 
                $_SESSION['user_id'] ?? null
            );
            return true;
        }
        return false;
    }

    /**
     * Fetch filtered delivery ledger records
     */
    public static function getDeliveries(array $filters = []): array {
        $db = Database::getConnection();
        
        $sql = "
            SELECT d.*, 
                   t.status as ticket_status,
                   u_driver.full_name as driver_name,
                   u_cust.full_name as customer_name,
                   cust.address as customer_address, 
                   cust.email as customer_email,
                   dev.brand as device_brand,
                   dev.model as device_model,
                   dev.device_type
            FROM deliveries d
            JOIN repair_tickets t ON d.ticket_id = t.id
            JOIN users u_cust ON d.customer_id = u_cust.id
            JOIN customers cust ON u_cust.id = cust.user_id
            JOIN devices dev ON d.device_id = dev.id
            LEFT JOIN users u_driver ON d.delivery_personnel_id = u_driver.id
            WHERE 1=1
        ";
        
        $params = [];

        if (!empty($filters['status'])) {
            $sql .= " AND d.status = ?";
            $params[] = $filters['status'];
        }

        if (!empty($filters['driver_id'])) {
            $sql .= " AND d.delivery_personnel_id = ?";
            $params[] = $filters['driver_id'];
        }

        if (!empty($filters['customer_id'])) {
            $sql .= " AND d.customer_id = ?";
            $params[] = $filters['customer_id'];
        }

        if (!empty($filters['search'])) {
            $sql .= " AND (u_cust.full_name LIKE ? OR dev.brand LIKE ? OR dev.model LIKE ?)";
            $searchTerm = "%" . $filters['search'] . "%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $sql .= " ORDER BY d.created_at DESC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}