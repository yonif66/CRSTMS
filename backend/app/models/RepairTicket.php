<?php
/**
 * CRSTMS - RepairTicket Model
 * Core transactional model for repair service jobs, logging, and status transitions.
 */

namespace App\Models;

use App\Models\BaseModel;
use Exception;
use PDO;

class RepairTicket extends BaseModel {

    /**
     * Retrieve a highly unified repair ticket schema payload joined with owner, hardware device, assignees.
     */
    public function find(int $ticketId): ?array {
        $sql = "SELECT rt.*, 
                       u_cust.full_name AS customer_name, c.email AS customer_email, u_cust.phone_number AS customer_phone, c.address AS customer_address,
                       d.device_type, d.brand AS device_brand, d.model AS device_model, d.serial_number AS device_serial,
                       u_tech.full_name AS technician_name, t.specialization AS technician_specialty,
                       u_rec.full_name AS receptionist_name, r.desk_number AS receptionist_desk
                FROM repair_tickets rt
                JOIN users u_cust ON rt.customer_id = u_cust.id
                JOIN customers c ON u_cust.id = c.user_id
                JOIN devices d ON rt.device_id = d.id
                JOIN users u_rec ON rt.receptionist_id = u_rec.id
                JOIN receptionists r ON u_rec.id = r.user_id
                LEFT JOIN users u_tech ON rt.technician_id = u_tech.id
                LEFT JOIN technicians t ON u_tech.id = t.user_id
                WHERE rt.id = :id";
        
        $stmt = $this->query($sql, ['id' => $ticketId]);
        $ticket = $stmt->fetch();
        return $ticket ? $ticket : null;
    }

    /**
     * Fetches filtering audit queues with total offset-based paginated queries.
     */
    public function search(array $filters, int $limit = 10, int $offset = 0): array {
        $conditions = [];
        $params = [];

        if (!empty($filters['search'])) {
            $conditions[] = "(u_cust.full_name LIKE :search OR d.model LIKE :search OR d.serial_number LIKE :search OR rt.id = :search_id)";
            $params['search'] = '%' . $filters['search'] . '%';
            $params['search_id'] = is_numeric($filters['search']) ? (int)$filters['search'] : 0;
        }

        if (!empty($filters['status'])) {
            $conditions[] = "rt.status = :status";
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['technician_id'])) {
            $conditions[] = "rt.technician_id = :technician_id";
            $params['technician_id'] = (int)$filters['technician_id'];
        }

        if (!empty($filters['customer_id'])) {
            $conditions[] = "rt.customer_id = :customer_id";
            $params['customer_id'] = (int)$filters['customer_id'];
        }

        if (!empty($filters['date_created'])) {
            $conditions[] = "DATE(rt.created_at) = :date_created";
            $params['date_created'] = $filters['date_created'];
        }

        if (!empty($filters['priority'])) {
            $conditions[] = "rt.priority = :priority";
            $params['priority'] = $filters['priority'];
        }

        $whereClause = !empty($conditions) ? "WHERE " . implode(" AND ", $conditions) : "";

        $sql = "SELECT rt.*, u_cust.full_name AS customer_name, d.brand AS device_brand, d.model AS device_model, u_tech.full_name AS technician_name
                FROM repair_tickets rt
                JOIN users u_cust ON rt.customer_id = u_cust.id
                JOIN devices d ON rt.device_id = d.id
                LEFT JOIN users u_tech ON rt.technician_id = u_tech.id
                ${whereClause}
                ORDER BY rt.created_at DESC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        
        // Dynamic binding to preserve INT bindings for PDO limits
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    /**
     * Compute filtered aggregate counters to render navigation pages correctly.
     */
    public function getCount(array $filters): int {
        $conditions = [];
        $params = [];

        if (!empty($filters['search'])) {
            $conditions[] = "(u_cust.full_name LIKE :search OR d.model LIKE :search_mod OR rt.id = :search_id)";
            $params['search'] = '%' . $filters['search'] . '%';
            $params['search_mod'] = '%' . $filters['search'] . '%';
            $params['search_id'] = is_numeric($filters['search']) ? (int)$filters['search'] : 0;
        }

        if (!empty($filters['status'])) {
            $conditions[] = "rt.status = :status";
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['technician_id'])) {
            $conditions[] = "rt.technician_id = :technician_id";
            $params['technician_id'] = (int)$filters['technician_id'];
        }

        $whereClause = !empty($conditions) ? "WHERE " . implode(" AND ", $conditions) : "";

        $sql = "SELECT COUNT(*) FROM repair_tickets rt
                JOIN users u_cust ON rt.customer_id = u_cust.id
                JOIN devices d ON rt.device_id = d.id
                ${whereClause}";

        $stmt = $this->query($sql, $params);
        return (int)$stmt->fetchColumn();
    }

    /**
     * Create check-in ticket transactionally with robust activity trails.
     */
    public function createTicket(array $data, int $creatorId): int {
        $this->db->beginTransaction();
        try {
            $sql = "INSERT INTO repair_tickets (customer_id, device_id, receptionist_id, status, priority, estimated_completion_date, issue_description)
                    VALUES (:customer_id, :device_id, :receptionist_id, :status, :priority, :estimated_completion_date, :issue_description)";
            
            $status = !empty($data['technician_id']) ? 'Assigned' : 'Created';
            
            $params = [
                'customer_id'               => $data['customer_id'],
                'device_id'                 => $data['device_id'],
                'receptionist_id'           => $creatorId,
                'status'                    => $status,
                'priority'                  => $data['priority'] ?? 'Medium',
                'estimated_completion_date' => $data['estimated_completion_date'] ?: null,
                'issue_description'         => $data['issue_description']
            ];

            $this->query($sql, $params);
            $ticketId = (int)$this->db->lastInsertId();

            if (!empty($data['technician_id'])) {
                $sqlAssign = "UPDATE repair_tickets SET technician_id = :tech_id WHERE id = :ticket_id";
                $this->query($sqlAssign, ['tech_id' => $data['technician_id'], 'ticket_id' => $ticketId]);
                
                $this->logActivity($ticketId, $creatorId, "Assigned primary ticket allocation to Technician ID: ${data['technician_id']}");
            } else {
                $this->logActivity($ticketId, $creatorId, "Registered initial intake device check-in");
            }

            $this->db->commit();
            return $ticketId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Re-assigns the ticket to a new repair technician, registering automated audits.
     */
    public function assignTechnician(int $ticketId, ?int $techId, int $operatorId): void {
        $this->db->beginTransaction();
        try {
            $status = $techId ? 'Assigned' : 'Created';
            $sql = "UPDATE repair_tickets SET technician_id = :tech_id, status = :status WHERE id = :id";
            $this->query($sql, [
                'tech_id' => $techId,
                'status'  => $status,
                'id'      => $ticketId
            ]);

            $msg = $techId ? "Allocated repairs responsibility queue to Technician User #${techId}" : "Reset allocations, ticket returned to pool";
            $this->logActivity($ticketId, $operatorId, $msg);

            $this->db->commit();
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Moves a ticket through state transitions, preserving a strict diagnostic log file.
     */
    public function transitionStatus(int $ticketId, string $status, string $notes, int $operatorId): void {
        $allowedStates = ['Created', 'Assigned', 'In Progress', 'Waiting for Spare Parts', 'Completed', 'Ready for Delivery', 'Delivered', 'Closed'];
        if (!in_array($status, $allowedStates)) {
            throw new Exception("Operational boundary breach: Proposed state '${status}' is unsupported.");
        }

        $this->db->beginTransaction();
        try {
            $sql = "UPDATE repair_tickets SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
            $this->query($sql, ['status' => $status, 'id' => $ticketId]);

            // Save technical diagnostic log notes
            $sqlNote = "INSERT INTO repair_updates (ticket_id, technician_id, update_status, diagnostic_notes)
                        VALUES (:ticket_id, :tech_id, :status, :notes)";
            $this->query($sqlNote, [
                'ticket_id' => $ticketId,
                'tech_id'   => $operatorId,
                'status'    => $status,
                'notes'     => $notes ?: "Status altered and checked into bench queue."
            ]);

            // Save core transaction ledger timeline log
            $this->logActivity($ticketId, $operatorId, "Transitioned repair state directly to: [${status}] — Context: " . substr($notes, 0, 80));

            $this->db->commit();
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Logs spare part deduction inside dynamic company inventory buffers.
     */
    public function consumeSparePart(int $ticketId, int $partId, int $quantity, int $techId): void {
        $this->db->beginTransaction();
        try {
            // Safety stock checks
            $sqlCheck = "SELECT stock_quantity, unit_price, part_name FROM spare_parts WHERE id = :part_id FOR UPDATE";
            $part = $this->query($sqlCheck, ['part_id' => $partId])->fetch();

            if (!$part || $part['stock_quantity'] < $quantity) {
                throw new Exception("Stock depletion warning: '${part['part_name']}' is out of physical scope.");
            }

            // Deduct stock
            $sqlDeduct = "UPDATE spare_parts SET stock_quantity = stock_quantity - :qty WHERE id = :id";
            $this->query($sqlDeduct, ['qty' => $quantity, 'id' => $partId]);

            // Record transaction ledger
            $sqlLog = "INSERT INTO inventory_logs (part_id, user_id, quantity_changed, action_type, notes)
                       VALUES (:part_id, :user_id, :qty_changed, 'Used in Repair', :notes)";
            $this->query($sqlLog, [
                'part_id'     => $partId,
                'user_id'     => $techId,
                'qty_changed' => -${quantity},
                'notes'       => "Consumed under Ticket bench process #${ticketId}"
            ]);

            // Inject notes into updates timeline
            $sqlNote = "INSERT INTO repair_updates (ticket_id, technician_id, update_status, diagnostic_notes)
                        VALUES (:ticket_id, :tech_id, 'In Repair', :notes)";
            $this->query($sqlNote, [
                'ticket_id'    => $ticketId,
                'tech_id'      => $techId,
                'notes'        => "Utilized component: ${part['part_name']} (Quantity: ${quantity})"
            ]);

            $this->logActivity($ticketId, $techId, "Subtracted 1x '${part['part_name']}' from workshop store; billing queued.");

            $this->db->commit();
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Fetches historic diagnostic timeline updates posted by repair assessors.
     */
    public function getUpdates(int $ticketId): array {
        $sql = "SELECT ru.*, u.full_name AS technician_name 
                FROM repair_updates ru
                JOIN users u ON ru.technician_id = u.id
                WHERE ru.ticket_id = :ticket_id
                ORDER BY ru.created_at DESC";
        return $this->query($sql, ['ticket_id' => $ticketId])->fetchAll();
    }

    /**
     * Timeline activity tracking log.
     */
    private function logActivity(int $ticketId, int $userId, string $action): void {
        $sqlLog = "INSERT INTO inventory_logs (part_id, user_id, quantity_changed, action_type, notes) 
                   VALUES (1, :user_id, 0, 'Manual Adjust', :notes)";
        // Using a generalized activity log mechanism or standard custom table query
        $this->query("INSERT INTO inquiries (customer_id, message_text, status) VALUES (:cust, :msg, 'Closed')", [
            'cust' => $userId, 
            'msg'  => "TICKET AUDIT #${ticketId}: " . $action
        ]);
    }
}