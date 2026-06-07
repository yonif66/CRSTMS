<?php
/**
 * CRSTMS - TicketController
 * Facilitates service tickets checking, assigning, updating, and technician workflows.
 */

namespace App\Controllers;

use App\Models\RepairTicket;
use App\Models\Customer;
use App\Models\Device;
use Exception;

class TicketController extends BaseController {

    private RepairTicket $ticketModel;
    private Customer $customerModel;
    private Device $deviceModel;

    public function __construct() {
        $this->ticketModel = new RepairTicket();
        $this->customerModel = new Customer();
        $this->deviceModel = new Device();
    }

    /**
     * Displays searchable queues of existing service tickets with status and staff filters.
     */
    public function index(): void {
        $this->requireAuth(['Admin', 'Receptionist', 'Technician']);

        $filters = [
            'search'        => $_GET['search'] ?? '',
            'status'        => $_GET['status'] ?? '',
            'technician_id' => $_GET['technician_id'] ?? '',
            'priority'      => $_GET['priority'] ?? '',
            'date_created'  => $_GET['date_created'] ?? ''
        ];

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        if ($page < 1) $page = 1;
        $limit = 10;
        $offset = ($page - 1) * $limit;

        $totalRecords = $this->ticketModel->getCount($filters);
        $totalPages = ceil($totalRecords / $limit) ?: 1;
        $tickets = $this->ticketModel->search($filters, $limit, $offset);

        // Fetch support listings for template dropdown lists
        $technicians = $this->customerModel->query("SELECT id, full_name DISTINCT FROM users WHERE role = 'Technician'")->fetchAll();

        $this->render('tickets/index', [
            'tickets'      => $tickets,
            'filters'      => $filters,
            'technicians'  => $technicians,
            'currentPage'  => $page,
            'totalPages'   => $totalPages,
            'totalRecords' => $totalRecords,
            'page_title'   => "Active Service Tickets"
        ]);
    }

    /**
     * Check-in new hardware device and open service ticket records.
     */
    public function create(): void {
        $this->requireAuth(['Admin', 'Receptionist']);

        $errors = [];
        $input = [];

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $token = $_POST['csrf_token'] ?? '';
            if ($token !== ($_SESSION['csrf_token'] ?? '')) {
                die("CSRF authenticity token mismatch. Session halted.");
            }

            $input = [
                'customer_id'               => (int)($_POST['customer_id'] ?? 0),
                'device_id'                 => (int)($_POST['device_id'] ?? 0),
                'technician_id'             => !empty($_POST['technician_id']) ? (int)$_POST['technician_id'] : null,
                'priority'                  => trim($_POST['priority'] ?? 'Medium'),
                'estimated_completion_date' => trim($_POST['estimated_completion_date'] ?? ''),
                'issue_description'         => trim($_POST['issue_description'] ?? '')
            ];

            if (empty($input['customer_id']) || empty($input['device_id']) || empty($input['issue_description'])) {
                $errors[] = "Operation rejected: Direct customer, model identification asset, and reported fault are mandatory.";
            }

            if (empty($errors)) {
                try {
                    $creatorId = $_SESSION['user_id'];
                    $ticketId = $this->ticketModel->createTicket($input, $creatorId);
                    $this->redirect("/tickets/view?id=${ticketId}", "Success: Repair service ticket opened securely under Ref #${ticketId}!");
                } catch (Exception $e) {
                    $errors[] = "Database Transaction Interruption: " . $e->getMessage();
                }
            }
        }

        // Gather clients and devices
        $customers = $this->customerModel->search('', 100, 0);
        $devices = [];
        if (!empty($_GET['customer_id'])) {
            $devices = $this->deviceModel->getDevicesByCustomer((int)$_GET['customer_id']);
        }

        $technicians = $this->customerModel->query("SELECT id, full_name FROM users WHERE role = 'Technician'")->fetchAll();

        $this->render('tickets/create', [
            'errors'      => $errors,
            'input'       => $input,
            'customers'   => $customers,
            'devices'     => $devices,
            'technicians' => $technicians,
            'page_title'  => "Initiate Repair Ticket"
        ]);
    }

    /**
     * Dispatches complete maintenance audits, timeline notes, logs, and billing.
     */
    public function view(): void {
        $this->requireAuth(['Admin', 'Receptionist', 'Technician', 'Customer']);

        $ticketId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        $ticket = $this->ticketModel->find($ticketId);

        if (!$ticket) {
            $this->redirect('/tickets', "Information Error: Specified service record matched index zero.");
        }

        // Authorization boundary checks for basic Client accounts
        if ($_SESSION['user_role'] === 'Customer' && $_SESSION['user_id'] !== $ticket['customer_id']) {
            $this->redirect('/dashboard', "Permission Interrupted: Security bounds prevent reading external data files.");
        }

        $updates = $this->ticketModel->getUpdates($ticketId);
        $technicians = $this->customerModel->query("SELECT id, full_name FROM users WHERE role = 'Technician'")->fetchAll();
        $parts = $this->customerModel->query("SELECT id, part_name, stock_quantity, unit_price FROM spare_parts")->fetchAll();

        $this->render('tickets/view', [
            'ticket'      => $ticket,
            'updates'     => $updates,
            'technicians' => $technicians,
            'parts'       => $parts,
            'page_title'  => "Service Ticket Details — Ref #DB00" . $ticketId
        ]);
    }

    /**
     * Processes re-assigning requests of device services to bench employees.
     */
    public function assign(): void {
        $this->requireAuth(['Admin', 'Receptionist']);

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $ticketId = (int)($_POST['ticket_id'] ?? 0);
            $techId = !empty($_POST['technician_id']) ? (int)$_POST['technician_id'] : null;

            try {
                $this->ticketModel->assignTechnician($ticketId, $techId, $_SESSION['user_id']);
                $this->redirect("/tickets/view?id=${ticketId}", "Success: Bench technician assignment established.");
            } catch (Exception $e) {
                $this->redirect("/tickets/view?id=${ticketId}", "Error: Persistent failure " . $e->getMessage());
            }
        }
    }

    /**
     * Process updates of technicians bench notes or state transitions.
     */
    public function updateStatus(): void {
        $this->requireAuth(['Admin', 'Technician']);

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $ticketId = (int)($_POST['ticket_id'] ?? 0);
            $status = trim($_POST['status'] ?? '');
            $notes = trim($_POST['diagnostic_notes'] ?? '');

            $ticket = $this->ticketModel->find($ticketId);
            if (!$ticket) {
                die("Access disrupted: Data row null.");
            }

            // Tech role can only adjust tickets designated directly to their name
            if ($_SESSION['user_role'] === 'Technician' && $ticket['technician_id'] !== $_SESSION['user_id']) {
                $this->redirect("/tickets/view?id=${ticketId}", "Access Denied: Ticket is assigned to another technician.");
            }

            try {
                $this->ticketModel->transitionStatus($ticketId, $status, $notes, $_SESSION['user_id']);
                $this->redirect("/tickets/view?id=${ticketId}", "Success: System state transitioned securely to '${status}'.");
            } catch (Exception $e) {
                $this->redirect("/tickets/view?id=${ticketId}", "Error: Transition aborted " . $e->getMessage());
            }
        }
    }

    /**
     * Records deduction of spare physical parts utilized during bench operations.
     */
    public function deductPart(): void {
        $this->requireAuth(['Admin', 'Technician']);

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $ticketId = (int)($_POST['ticket_id'] ?? 0);
            $partId = (int)($_POST['part_id'] ?? 0);
            $qty = (int)($_POST['quantity'] ?? 1);

            $ticket = $this->ticketModel->find($ticketId);
            if ($_SESSION['user_role'] === 'Technician' && $ticket['technician_id'] !== $_SESSION['user_id']) {
                $this->redirect("/tickets/view?id=${ticketId}", "Permissions Error: Security bounds check failed.");
            }

            try {
                $this->ticketModel->consumeSparePart($ticketId, $partId, $qty, $_SESSION['user_id']);
                $this->redirect("/tickets/view?id=${ticketId}", "Success: Component consumed; safety counts adjusted.");
            } catch (Exception $e) {
                $this->redirect("/tickets/view?id=${ticketId}", "Operational Block: " . $e->getMessage());
            }
        }
    }
}