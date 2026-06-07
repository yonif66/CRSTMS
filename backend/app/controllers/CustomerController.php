<?php
/**
 * CRSTMS - CustomerController
 * Coordinates Customer Profiles, History, and Device registrations
 */

namespace App\Controllers;

use App\Models\Customer;
use App\Models\Device;
use Exception;

class CustomerController extends BaseController {
    
    private Customer $customerModel;
    private Device $deviceModel;

    public function __construct() {
        $this->customerModel = new Customer();
        $this->deviceModel = new Device();
    }

    /**
     * Dispatches list of customers with search parameters and multi-page pagination support.
     */
    public function index(): void {
        // Enforce that only Receptionists or Admins may inspect customer rosters
        $this->requireAuth(['Admin', 'Receptionist']);

        $searchTerm = $_GET['search'] ?? '';
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        if ($page < 1) $page = 1;
        
        $limit = 10;
        $offset = ($page - 1) * $limit;
        
        $totalCustomers = $this->customerModel->getCount($searchTerm);
        $totalPages = ceil($totalCustomers / $limit);
        if ($totalPages < 1) $totalPages = 1;

        $customers = $this->customerModel->search($searchTerm, $limit, $offset);

        $this->render('customers/index', [
            'customers'     => $customers,
            'search'        => $searchTerm,
            'currentPage'   => $page,
            'totalPages'    => $totalPages,
            'totalRecords'  => $totalCustomers,
            'page_title'    => "Customer File Rosters"
        ]);
    }

    /**
     * Renders detailed Customer profile, listings of registered hardware units and billing repair history files.
     */
    public function view(): void {
        $this->requireAuth(['Admin', 'Receptionist', 'Technician']);
        
        $userId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        $profile = $this->customerModel->find($userId);

        if (!$profile) {
            $this->redirect('/customers', "Error: The requested Customer profile matching ID {$userId} does not exist.");
        }

        // Fetch associated hardware devices and historic invoices/tickets
        $devices = $this->deviceModel->getDevicesByCustomer($userId);
        $repairs = $this->customerModel->getRepairHistory($userId);

        $this->render('customers/view', [
            'profile'    => $profile,
            'devices'    => $devices,
            'repairs'    => $repairs,
            'page_title' => "Customer Profile — " . $profile['full_name']
        ]);
    }

    /**
     * Validates and creates a new Customer profile dynamically in standard MySQL repository.
     */
    public function create(): void {
        $this->requireAuth(['Admin', 'Receptionist']);
        
        $errors = [];
        $input = [];

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Validate CSRF defenses
            $token = $_POST['csrf_token'] ?? '';
            if ($token !== ($_SESSION['csrf_token'] ?? '')) {
                die("Security Error: Invalid token payload detected. Authentication sequence terminated.");
            }

            // Input validation and sanitization loops
            $input['full_name'] = trim($_POST['full_name'] ?? '');
            $input['phone_number'] = trim($_POST['phone_number'] ?? '');
            $input['email'] = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
            $input['address'] = trim($_POST['address'] ?? '');
            $input['username'] = trim($_POST['username'] ?? '');
            $input['password'] = $_POST['password'] ?? '';
            $input['alternative_phone'] = trim($_POST['alternative_phone'] ?? '');

            // Form validation checks
            if (empty($input['full_name'])) {
                $errors[] = "Operational parameters error: Customer Full Name is required.";
            }
            if (empty($input['phone_number'])) {
                $errors[] = "Operational parameters error: Direct Contact Phone line is required.";
            }
            if (!$input['email']) {
                $errors[] = "Format mismatch error: Customer email address must be fully qualified.";
            }
            if (empty($input['address'])) {
                $errors[] = "Required field blank error: Dispatch / Residential target address cannot be empty.";
            }

            if (empty($errors)) {
                try {
                    $userId = $this->customerModel->registerCustomer($input);
                    $this->redirect("/customers/view?id={$userId}", "Success: Customer profile established securely!");
                } catch (Exception $e) {
                    $errors[] = "Transactional failure: " . $e->getMessage();
                }
            }
        }

        $this->render('customers/create', [
            'errors'     => $errors,
            'input'      => $input,
            'page_title' => "Establish Client Profile"
        ]);
    }

    /**
     * Edits customer file details.
     */
    public function edit(): void {
        $this->requireAuth(['Admin', 'Receptionist']);
        
        $userId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        $profile = $this->customerModel->find($userId);

        if (!$profile) {
            $this->redirect('/customers', "Error: Cannot edit non-existent customer.");
        }

        $errors = [];
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = [
                'full_name'         => trim($_POST['full_name'] ?? ''),
                'phone_number'      => trim($_POST['phone_number'] ?? ''),
                'email'             => filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL),
                'address'           => trim($_POST['address'] ?? ''),
                'alternative_phone' => trim($_POST['alternative_phone'] ?? '')
            ];

            if (empty($data['full_name']) || empty($data['phone_number']) || !$data['email'] || empty($data['address'])) {
                $errors[] = "Operation rejected: All fields besides alternative phone coordinates are mandatory.";
            }

            if (empty($errors)) {
                try {
                    $this->customerModel->updateCustomer($userId, $data);
                    $this->redirect("/customers/view?id={$userId}", "Success: Customer records updated inside DBMS.");
                } catch (Exception $e) {
                    $errors[] = "Persistence error: " . $e->getMessage();
                }
            }
        }

        $this->render('customers/edit', [
            'profile'    => $profile,
            'errors'     => $errors,
            'page_title' => "Adjust Records — " . $profile['full_name']
        ]);
    }

    /**
     * Registers client hardware devices inside the physical repair buffer array.
     */
    public function registerDevice(): void {
        $this->requireAuth(['Admin', 'Receptionist']);
        
        $customerId = isset($_GET['customer_id']) ? (int)$_GET['customer_id'] : 0;
        $customer = $this->customerModel->find($customerId);

        if (!$customer) {
            $this->redirect('/customers', "Error: Hardware device registration must map to a qualified customer owner profile.");
        }

        $errors = [];
        $input = [];

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = [
                'customer_id'       => $customerId,
                'device_type'       => trim($_POST['device_type'] ?? ''),
                'brand'             => trim($_POST['brand'] ?? ''),
                'model'             => trim($_POST['model'] ?? ''),
                'serial_number'     => trim($_POST['serial_number'] ?? ''),
                'issue_description' => trim($_POST['issue_description'] ?? '')
            ];

            if (empty($input['brand']) || empty($input['serial_number']) || empty($input['issue_description'])) {
                $errors[] = "Validation Failure: Brand, Serial Code identity, and Problem assessments are mandatory checkpoints.";
            }

            if (empty($errors)) {
                try {
                    $deviceId = $this->deviceModel->registerDevice($input);
                    $this->redirect("/customers/view?id={$customerId}", "Success: Registered hardware module linked to client profile!");
                } catch (Exception $e) {
                    $errors[] = "Operational Failure: " . $e->getMessage();
                }
            }
        }

        $this->render('devices/create', [
            'customer'   => $customer,
            'errors'     => $errors,
            'input'      => $input,
            'page_title' => "Register Client Asset"
        ]);
    }
}