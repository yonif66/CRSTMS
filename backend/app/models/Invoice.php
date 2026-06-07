<?php
/**
 * CRSTMS - Invoice Model
 * Coordinates labor costs, material cost totals, VAT calculations, and billing reports.
 */

namespace App\Models;

use App\Models\BaseModel;
use Exception;
use PDO;

class Invoice extends BaseModel {

    /**
     * Retrieve complete detailed payload for invoice files.
     */
    public function find(int $invoiceId): ?array {
        $sql = "SELECT i.*, rt.created_at AS ticket_created, rt.status AS ticket_status,
                       u_cust.full_name AS customer_name, c.email AS customer_email, u_cust.phone_number AS customer_phone, c.address AS customer_address,
                       d.brand AS device_brand, d.model AS device_model, d.serial_number AS device_serial, d.device_type,
                       u_tech.full_name AS technician_name
                FROM invoices i
                JOIN repair_tickets rt ON i.ticket_id = rt.id
                JOIN users u_cust ON rt.customer_id = u_cust.id
                JOIN customers c ON u_cust.id = c.user_id
                JOIN devices d ON rt.device_id = d.id
                LEFT JOIN users u_tech ON rt.technician_id = u_tech.id
                WHERE i.id = :id";
        
        $stmt = $this->query($sql, ['id' => $invoiceId]);
        $row = $stmt->fetch();
        return $row ? $row : null;
    }

    /**
     * Locates invoices referencing a ticket.
     */
    public function findByTicketId(int $ticketId): ?array {
        $sql = "SELECT id FROM invoices WHERE ticket_id = :ticket_id";
        $stmt = $this->query($sql, ['ticket_id' => $ticketId]);
        $row = $stmt->fetch();
        return $row ? $this->find((int)$row['id']) : null;
    }

    /**
     * Dynamic compile of aggregate material costs dynamically from ticket diagnostics updates.
     */
    public function calculateMaterialsCost(int $ticketId): float {
        // Query matching all consumed spare parts parsed during diagnostic update lines
        // For testing / compliance, we calculate the sum matching logs for that ticket
        $sql = "SELECT SUM(sp.unit_price * ABS(il.quantity_changed)) AS parts_total
                FROM inventory_logs il
                JOIN spare_parts sp ON il.part_id = sp.id
                WHERE il.notes LIKE :ticket_string";
        
        $stmt = $this->query($sql, ['ticket_string' => "%Ticket bench process #${ticketId}%"]);
        $sum = $stmt->fetchColumn();
        return $sum ? (float)$sum : 0.00;
    }

    /**
     * Registers a new initialized static invoice in the database.
     */
    public function generateInvoice(int $ticketId, float $serviceCost, float $taxMultiplier): int {
        $this->db->beginTransaction();
        try {
            // Check if ticket exists
            $sqlTicket = "SELECT id, status FROM repair_tickets WHERE id = :id";
            $ticket = $this->query($sqlTicket, ['id' => $ticketId])->fetch();

            if (!$ticket) {
                throw new Exception("Operational halt: Hardware ticket matches index zero.");
            }

            // Calculate material cost
            $partsCost = $this->calculateMaterialsCost($ticketId);
            $total = ($serviceCost + $partsCost) * $taxMultiplier;

            // Inserts row (UPSERT if invoice already established for simple testing)
            $sqlCheck = "SELECT id FROM invoices WHERE ticket_id = :ticket_id";
            $exists = $this->query($sqlCheck, ['ticket_id' => $ticketId])->fetch();

            if ($exists) {
                $sqlInput = "UPDATE invoices 
                             SET service_cost = :service, spare_parts_cost = :parts, tax_multiplier = :tax, total_amount = :total, invoice_date = CURRENT_TIMESTAMP
                             WHERE ticket_id = :ticket_id";
                $this->query($sqlInput, [
                    'service'   => $serviceCost,
                    'parts'     => $partsCost,
                    'tax'       => $taxMultiplier,
                    'total'     => $total,
                    'ticket_id' => $ticketId
                ]);
                $invoiceId = (int)$exists['id'];
            } else {
                $sqlInput = "INSERT INTO invoices (ticket_id, service_cost, spare_parts_cost, tax_multiplier, total_amount, payment_status)
                             VALUES (:ticket_id, :service, :parts, :tax, :total, 'Unpaid')";
                $this->query($sqlInput, [
                    'ticket_id' => $ticketId,
                    'service'   => $serviceCost,
                    'parts'     => $partsCost,
                    'tax'       => $taxMultiplier,
                    'total'     => $total
                ]);
                $invoiceId = (int)$this->db->lastInsertId();
            }

            $this->db->commit();
            return $invoiceId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Mark paid / unpaid status. No online payment gateway connected.
     */
    public function updatePaymentStatus(int $invoiceId, string $status): void {
        if (!in_array($status, ['Paid', 'Unpaid'])) {
            throw new Exception("Safety Violation: Attempted to set corrupted payment parameters.");
        }
        $sql = "UPDATE invoices SET payment_status = :status WHERE id = :id";
        $this->query($sql, ['status' => $status, 'id' => $invoiceId]);
    }

    /**
     * Complete audits trail mapping invoices.
     */
    public function getHistory(array $filters = []): array {
        $conditions = ["1=1"];
        $params = [];

        if (!empty($filters['payment_status'])) {
            $conditions[] = "i.payment_status = :status";
            $params['status'] = $filters['payment_status'];
        }

        if (!empty($filters['customer_id'])) {
            $conditions[] = "rt.customer_id = :cust_id";
            $params['cust_id'] = (int)$filters['customer_id'];
        }

        $whereClause = implode(" AND ", $conditions);

        $sql = "SELECT i.*, u_cust.full_name AS customer_name, d.brand AS device_brand, d.model AS device_model 
                FROM invoices i
                JOIN repair_tickets rt ON i.ticket_id = rt.id
                JOIN users u_cust ON rt.customer_id = u_cust.id
                JOIN devices d ON rt.device_id = d.id
                WHERE ${whereClause}
                ORDER BY i.invoice_date DESC";
        
        return $this->query($sql, $params)->fetchAll();
    }
}