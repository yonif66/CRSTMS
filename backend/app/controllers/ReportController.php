<?php
/**
 * CRSTMS - Reporting and dashboard Controller
 */

namespace App\Controllers;

use Config\Database;
use PDO;

class ReportController extends BaseController {

    /**
     * Aggregates and renders analytical outputs
     */
    public function index(): void {
        $this->requireAuth(['Admin', 'Receptionist']);

        $startDate = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
        $endDate = $_GET['end_date'] ?? date('Y-m-d');

        $db = Database::getConnection();

        // 1. REPAIR SUMMARY REPORT
        $stmtRepairs = $db->prepare("
            SELECT status, COUNT(*) as count
            FROM repair_tickets
            WHERE DATE(created_at) BETWEEN ? AND ?
            GROUP BY status
        ");
        $stmtRepairs->execute([$startDate, $endDate]);
        $repairSummary = $stmtRepairs->fetchAll(PDO::FETCH_ASSOC);

        // 2. INVENTORY USAGE REPORT
        $stmtInventory = $db->prepare("
            SELECT p.part_name, p.serial_number, SUM(ABS(l.quantity_changed)) as units_used
            FROM inventory_logs l
            JOIN spare_parts p ON l.part_id = p.id
            WHERE l.action_type = 'Used in Repair' AND DATE(l.created_at) BETWEEN ? AND ?
            GROUP BY p.id
            ORDER BY units_used DESC
        ");
        $stmtInventory->execute([$startDate, $endDate]);
        $inventoryUsage = $stmtInventory->fetchAll(PDO::FETCH_ASSOC);

        // 3. FINANCIAL SUMMARY (from invoices)
        $stmtFinance = $db->prepare("
            SELECT 
                COUNT(*) as total_invoices,
                SUM(service_cost) as total_labor,
                SUM(spare_parts_cost) as total_parts,
                SUM(total_amount) as grand_total_revenue,
                SUM(CASE WHEN payment_status = 'Paid' THEN total_amount ELSE 0 END) as total_collected,
                SUM(CASE WHEN payment_status = 'Unpaid' THEN total_amount ELSE 0 END) as total_outstanding
            FROM invoices
            WHERE DATE(invoice_date) BETWEEN ? AND ?
        ");
        $stmtFinance->execute([$startDate, $endDate]);
        $financeSummary = $stmtFinance->fetch(PDO::FETCH_ASSOC);

        // 4. TECHNICIAN PERFORMANCE REPORT
        $stmtTech = $db->prepare("
            SELECT u.full_name as technician_name, 
                   COUNT(t.id) as total_assigned,
                   SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_jobs,
                   SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_jobs
            FROM users u
            JOIN technicians tech ON u.id = tech.user_id
            LEFT JOIN repair_tickets t ON u.id = t.technician_id
            GROUP BY u.id
            ORDER BY completed_jobs DESC
        ");
        $stmtTech->execute();
        $techPerformance = $stmtTech->fetchAll(PDO::FETCH_ASSOC);

        // 5. DELIVERY PERFORMANCE REPORT
        $stmtDeliveries = $db->prepare("
            SELECT status, COUNT(*) as count,
                   AVG(TIMESTAMPDIFF(HOUR, pickup_date, delivery_date)) as avg_transit_hours
            FROM deliveries
            WHERE DATE(created_at) BETWEEN ? AND ?
            GROUP BY status
        ");
        $stmtDeliveries->execute([$startDate, $endDate]);
        $deliveryPerformance = $stmtDeliveries->fetchAll(PDO::FETCH_ASSOC);

        $this->render("reports/index", [
            'startDate' => $startDate,
            'endDate' => $endDate,
            'repairs' => $repairSummary,
            'inventory' => $inventoryUsage,
            'finance' => $financeSummary,
            'technicians' => $techPerformance,
            'deliveries' => $deliveryPerformance
        ]);
    }
}