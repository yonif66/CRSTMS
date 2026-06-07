<?php
/**
 * CRSTMS - Support/Inquiry System Controller
 */

namespace App\Controllers;

use App\Models\Inquiry;

class SupportController extends BaseController {

    /**
     * Renders Support interface workspace
     */
    public function index(): void {
        $this->requireAuth();
        
        $filters = [];
        if ($_SESSION['user_role'] === 'Customer') {
            $filters['customer_id'] = $_SESSION['user_id'];
        }
        if (!empty($_GET['status'])) {
            $filters['status'] = $_GET['status'];
        }

        $inquiries = Inquiry::getInquiries($filters);
        
        // Retrieve valid reception staff for inquiries delegation options
        $db = \Config\Database::getConnection();
        $staffQuery = $db->query("SELECT id, full_name, role FROM users WHERE role IN ('Admin', 'Receptionist') ORDER BY full_name ASC");
        $staff = $staffQuery->fetchAll(\PDO::FETCH_ASSOC);

        $this->render("support/index", [
            'inquiries' => $inquiries,
            'staff' => $staff,
            'filters' => $filters
        ]);
    }

    /**
     * Submit customer concern from frontend portal
     */
    public function submit(): void {
        $this->requireAuth(['Customer']);
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $subject = trim($_POST['subject'] ?? '');
            $message = trim($_POST['message'] ?? '');

            if (!empty($subject) && !empty($message)) {
                Inquiry::submit($_SESSION['user_id'], $subject, $message);
            }
        }

        $this->redirect('/support', "Support ticket submitted successfully.");
    }

    /**
     * Post a threaded response line
     */
    public function reply(): void {
        $this->requireAuth(); // Open to active Customers and Support operators back-and-forth

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $inquiryId = (int)($_POST['inquiry_id'] ?? 0);
            $responseText = trim($_POST['response_text'] ?? '');
            $status = $_POST['status'] ?? 'Responded';

            if ($inquiryId > 0 && !empty($responseText)) {
                Inquiry::reply($inquiryId, $_SESSION['user_id'], $responseText, $status);
            }
        }

        $this->redirect('/support', "Inquiry dialogue update registered.");
    }

    /**
     * Assign / Delegate inquiry
     */
    public function assign(): void {
        $this->requireAuth(['Admin', 'Receptionist']);

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $inquiryId = (int)($_POST['inquiry_id'] ?? 0);
            $staffId = (int)($_POST['staff_id'] ?? 0);

            if ($inquiryId > 0 && $staffId > 0) {
                Inquiry::assign($inquiryId, $staffId);
            }
        }

        $this->redirect('/support', "Inquiry assigned to staff.");
    }

    /**
     * Mark ticket as closed
     */
    public function close(): void {
        $this->requireAuth(['Admin', 'Receptionist']);

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $inquiryId = (int)($_POST['inquiry_id'] ?? 0);
            if ($inquiryId > 0) {
                Inquiry::updateStatus($inquiryId, 'Closed');
            }
        }

        $this->redirect('/support', "Support inquiry ticket has been marked Closed.");
    }
}