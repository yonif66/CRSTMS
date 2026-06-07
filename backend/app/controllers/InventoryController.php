<?php
/**
 * CRSTMS - InventoryController
 * Controls physical warehouse buffers, safe levels, alerts, and histories.
 */

namespace App\Controllers;

use App\Models\SparePart;
use Exception;

class InventoryController extends BaseController {

    private SparePart $inventoryModel;

    public function __construct() {
        $this->inventoryModel = new SparePart();
    }

    /**
     * Main dashboard displaying parts, stock counts, alerts, and log events.
     */
    public function index(): void {
        $this->requireAuth(['Admin', 'Receptionist', 'Technician']);

        $filters = [
            'search'    => $_GET['search'] ?? '',
            'low_stock' => isset($_GET['low_stock'])
        ];

        $parts = $this->inventoryModel->search($filters, 100, 0);
        $alertsCount = $this->inventoryModel->getCount(['low_stock' => true]);
        $logs = $this->inventoryModel->getLogs(15);

        $this->render('inventory/index', [
            'parts'       => $parts,
            'filters'     => $filters,
            'alertsCount' => $alertsCount,
            'logs'        => $logs,
            'page_title'  => "Workshop Inventory Control"
        ]);
    }

    /**
     * Action to register a brand new SKU into the workshop database.
     */
    public function create(): void {
        $this->requireAuth(['Admin']);

        $errors = [];
        $input = [];

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $token = $_POST['csrf_token'] ?? '';
            if ($token !== ($_SESSION['csrf_token'] ?? '')) {
                die("CSRF Authenticity mismatch.");
            }

            $input = [
                'part_name'           => trim($_POST['part_name'] ?? ''),
                'serial_number'       => trim($_POST['serial_number'] ?? ''),
                'stock_quantity'      => (int)($_POST['stock_quantity'] ?? 0),
                'unit_price'          => (float)($_POST['unit_price'] ?? 0.00),
                'low_stock_threshold' => (int)($_POST['low_stock_threshold'] ?? 5)
            ];

            if (empty($input['part_name']) || empty($input['serial_number'])) {
                $errors[] = "Operation Rejected: Part catalog tag and manufacturer code are mandatory.";
            }
            if ($input['unit_price'] <= 0) {
                $errors[] = "Operation Rejected: Value cost must sit positive.";
            }

            if (empty($errors)) {
                try {
                    $this->inventoryModel->createPart($input, $_SESSION['user_id']);
                    $this->redirect('/inventory', "Success: Part registered into workshop records successfully.");
                } catch (Exception $e) {
                    $errors[] = "Database insertion halt: " . $e->getMessage();
                }
            }
        }

        $this->render('inventory/add_part', [
            'errors'     => $errors,
            'input'      => $input,
            'page_title' => "Register New Catalog SKU"
        ]);
    }

    /**
     * Replenish or manually adjust quantity levels.
     */
    public function adjust(): void {
        $this->requireAuth(['Admin', 'Technician']);

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $partId = (int)($_POST['part_id'] ?? 0);
            $qtyChange = (int)($_POST['quantity_changed'] ?? 0);
            $reason = trim($_POST['reason'] ?? 'Manual stock level reconciliation');

            if ($qtyChange === 0) {
                $this->redirect('/inventory', "Error: Discrepancy delta matches zero. Adjustment skipped.");
            }

            try {
                $this->inventoryModel->adjustStock($partId, $qtyChange, $reason, $_SESSION['user_id']);
                $this->redirect('/inventory', "Success: Warehouse stock counts updated successfully.");
            } catch (Exception $e) {
                $this->redirect('/inventory', "Operation Blocked: " . $e->getMessage());
            }
        }
    }
}