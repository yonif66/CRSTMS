<?php
/**
 * CRSTMS - Delivery Controller
 */

namespace App\Controllers;

use App\Models\Delivery;
use App\Models\User;

class DeliveryController extends BaseController {
    
    /**
     * Renders logistics dashboard
     */
    public function index(): void {
        $this->requireAuth(['Admin', 'Receptionist', 'Delivery']);
        
        $filters = [
            'status' => $_GET['status'] ?? null,
            'driver_id' => $_GET['driver_id'] ?? null,
            'search' => $_GET['search'] ?? null
        ];

        // If active user is driving personnel, force-link context to self
        if ($_SESSION['user_role'] === 'Delivery') {
            $filters['driver_id'] = $_SESSION['user_id'];
        }

        $deliveries = Delivery::getDeliveries($filters);
        
        // Retrieve valid delivery runners for assignments
        $db = \Config\Database::getConnection();
        $driversQuery = $db->query("SELECT id, full_name FROM users WHERE role = 'Delivery' ORDER BY full_name ASC");
        $drivers = $driversQuery->fetchAll(\PDO::FETCH_ASSOC);

        $this->render("deliveries/index", [
            'deliveries' => $deliveries,
            'drivers' => $drivers,
            'filters' => $filters
        ]);
    }

    /**
     * Dispatch driver assignment form posts
     */
    public function assign(): void {
        $this->requireAuth(['Admin', 'Receptionist']);
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->redirect('/deliveries');
        }

        $deliveryId = (int)($_POST['delivery_id'] ?? 0);
        $personnelId = (int)($_POST['personnel_id'] ?? 0);

        if ($deliveryId > 0 && $personnelId > 0) {
            Delivery::assign($deliveryId, $personnelId);
        }

        $this->redirect('/deliveries', "Delivery Runner Assigned successfully.");
    }

    /**
     * Action driver pickup and progress updates
     */
    public function updateStatus(): void {
        $this->requireAuth(['Admin', 'Receptionist', 'Delivery']);
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->redirect('/deliveries');
        }

        $deliveryId = (int)($_POST['delivery_id'] ?? 0);
        $status = $_POST['status'] ?? '';
        $notes = $_POST['notes'] ?? '';

        if ($deliveryId > 0 && !empty($status)) {
            Delivery::updateStatus($deliveryId, $status, $notes);
        }

        $this->redirect('/deliveries', "Delivery status adjusted to '{$status}'.");
    }
}