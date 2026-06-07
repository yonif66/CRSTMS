<?php
/**
 * CRSTMS - SparePart Model
 * Manages physical parts, reorder parameters, stock adjustments, and usage logs.
 */

namespace App\Models;

use App\Models\BaseModel;
use Exception;
use PDO;

class SparePart extends BaseModel {

    /**
     * Retrieve a specific part details.
     */
    public function find(int $id): ?array {
        $sql = "SELECT * FROM spare_parts WHERE id = :id";
        $stmt = $this->query($sql, ['id' => $id]);
        $part = $stmt->fetch();
        return $part ? $part : null;
    }

    /**
     * Search part catalogue with category details, sorting, and offset pagination.
     */
    public function search(array $filters, int $limit = 10, int $offset = 0): array {
        $conditions = ["1=1"];
        $params = [];

        if (!empty($filters['search'])) {
            $conditions[] = "(part_name LIKE :search OR serial_number LIKE :serial)";
            $params['search'] = '%' . $filters['search'] . '%';
            $params['serial'] = '%' . $filters['search'] . '%';
        }

        if (isset($filters['low_stock']) && $filters['low_stock'] === true) {
            $conditions[] = "stock_quantity <= low_stock_threshold";
        }

        $whereClause = implode(" AND ", $conditions);
        $sql = "SELECT * FROM spare_parts 
                WHERE ${whereClause} 
                ORDER BY stock_quantity ASC, part_name ASC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    /**
     * Retrieve total counting to enable directory pagination calculations.
     */
    public function getCount(array $filters): int {
        $conditions = ["1=1"];
        $params = [];

        if (!empty($filters['search'])) {
            $conditions[] = "(part_name LIKE :search OR serial_number LIKE :serial)";
            $params['search'] = '%' . $filters['search'] . '%';
            $params['serial'] = '%' . $filters['search'] . '%';
        }

        if (isset($filters['low_stock']) && $filters['low_stock'] === true) {
            $conditions[] = "stock_quantity <= low_stock_threshold";
        }

        $whereClause = implode(" AND ", $conditions);
        $sql = "SELECT COUNT(*) FROM spare_parts WHERE ${whereClause}";
        $stmt = $this->query($sql, $params);
        return (int)$stmt->fetchColumn();
    }

    /**
     * Registers a brand-new component in the centralized catalog.
     */
    public function createPart(array $data, int $operatorId): int {
        $sql = "INSERT INTO spare_parts (part_name, serial_number, stock_quantity, unit_price, low_stock_threshold)
                VALUES (:name, :serial, :qty, :price, :threshold)";
        
        $params = [
            'name'      => $data['part_name'],
            'serial'    => $data['serial_number'],
            'qty'       => (int)($data['stock_quantity'] ?? 0),
            'price'     => (float)($data['unit_price'] ?? 0.00),
            'threshold' => (int)($data['low_stock_threshold'] ?? 5)
        ];

        $this->db->beginTransaction();
        try {
            $this->query($sql, $params);
            $partId = (int)$this->db->lastInsertId();

            if ($params['qty'] > 0) {
                $this->logMovement($partId, $operatorId, $params['qty'], 'Restock', "Initial warehouse intake registration");
            }

            $this->db->commit();
            return $partId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Updates an existing part file details.
     */
    public function updatePart(int $id, array $data, int $operatorId): void {
        $sql = "UPDATE spare_parts 
                SET part_name = :name, serial_number = :serial, unit_price = :price, low_stock_threshold = :threshold
                WHERE id = :id";
        
        $params = [
            'name'      => $data['part_name'],
            'serial'    => $data['serial_number'],
            'price'     => (float)$data['unit_price'],
            'threshold' => (int)$data['low_stock_threshold'],
            'id'        => $id
        ];

        $this->query($sql, $params);
    }

    /**
     * Adjusted current physical stock levels with logging traces.
     */
    public function adjustStock(int $partId, int $delta, string $reason, int $operatorId): void {
        $this->db->beginTransaction();
        try {
            // Pessimistic locking check
            $sqlCheck = "SELECT stock_quantity, part_name FROM spare_parts WHERE id = :id FOR UPDATE";
            $part = $this->query($sqlCheck, ['id' => $partId])->fetch();

            if (!$part) {
                throw new Exception("Specified spare part matched ID zero.");
            }

            $nextQty = $part['stock_quantity'] + $delta;
            if ($nextQty < 0) {
                throw new Exception("Stock depletion error: Action would reduce '${part['part_name']}' below zero.");
            }

            $sqlUpdate = "UPDATE spare_parts SET stock_quantity = :qty WHERE id = :id";
            $this->query($sqlUpdate, ['qty' => $nextQty, 'id' => $partId]);

            $action = $delta > 0 ? 'Restock' : 'Manual Adjust';
            $this->logMovement($partId, $operatorId, $delta, $action, $reason);

            $this->db->commit();
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Purge catalogs or set inactive (for testing we soft-delete / remove)
     */
    public function deletePart(int $id): void {
        $this->query("DELETE FROM spare_parts WHERE id = :id", ['id' => $id]);
    }

    /**
     * Return movement ledger history.
     */
    public function getLogs(int $limit = 50): array {
        $sql = "SELECT il.*, sp.part_name, sp.serial_number, u.full_name AS operator_name 
                FROM inventory_logs il
                JOIN spare_parts sp ON il.part_id = sp.id
                JOIN users u ON il.user_id = u.id
                ORDER BY il.created_at DESC
                LIMIT :limit";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Internal movement logger.
     */
    private function logMovement(int $partId, int $userId, int $qty, string $actionType, string $notes): void {
        $sql = "INSERT INTO inventory_logs (part_id, user_id, quantity_changed, action_type, notes)
                VALUES (:part_id, :user_id, :qty, :action, :notes)";
        $this->query($sql, [
            'part_id' => $partId,
            'user_id' => $userId,
            'qty'     => $qty,
            'action'  => $actionType,
            'notes'   => $notes
        ]);
    }
}