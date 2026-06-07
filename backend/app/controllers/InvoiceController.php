<?php
/**
 * CRSTMS - InvoiceController
 * Facade managing cost models, generated invoices, offline cash states, and printable views.
 */

namespace App\Controllers;

use App\Models\Invoice;
use App\Models\RepairTicket;
use Exception;

class InvoiceController extends BaseController {

    private Invoice $invoiceModel;
    private RepairTicket $ticketModel;

    public function __construct() {
        $this->invoiceModel = new Invoice();
        $this->ticketModel = new RepairTicket();
    }

    /**
     * Directory lists of all generated invoices.
     */
    public function index(): void {
        $this->requireAuth(['Admin', 'Receptionist', 'Customer']);

        $filters = [];
        if ($_SESSION['user_role'] === 'Customer') {
            $filters['customer_id'] = $_SESSION['user_id'];
        } else {
            $filters['payment_status'] = $_GET['payment_status'] ?? '';
        }

        $invoices = $this->invoiceModel->getHistory($filters);

        $this->render('invoices/index', [
            'invoices'   => $invoices,
            'filters'    => $filters,
            'page_title' => "Billing Logs & Statements"
        ]);
    }

    /**
     * Spawns / regenerates invoice from completed ticket details.
     */
    public function generate(): void {
        $this->requireAuth(['Admin', 'Receptionist']);

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $ticketId = (int)($_POST['ticket_id'] ?? 0);
            $serviceCost = (float)($_POST['service_cost'] ?? 0.00);
            $taxMultiplier = 1.15; // 15% Standard VAT

            try {
                $invoiceId = $this->invoiceModel->generateInvoice($ticketId, $serviceCost, $taxMultiplier);
                $this->redirect("/invoices/view?id=${invoiceId}", "Success: Invoice generated cleanly. Tracking index updated.");
            } catch (Exception $e) {
                $this->redirect("/tickets/view?id=${ticketId}", "Error generating statement: " . $e->getMessage());
            }
        }
    }

    /**
     * Printable layout view of a single invoice file.
     */
    public function view(): void {
        $this->requireAuth(['Admin', 'Receptionist', 'Customer']);

        $invoiceId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        $invoice = $this->invoiceModel->find($invoiceId);

        if (!$invoice) {
            $this->redirect('/invoices', "Information Error: Specified invoice row matched index null.");
        }

        // Customer scope limits
        if ($_SESSION['user_role'] === 'Customer' && $_SESSION['user_id'] !== $invoice['customer_id']) {
            $this->redirect('/dashboard', "Permission Interrupted: Security bounds prevent reading external billing files.");
        }

        $this->render('invoices/view', [
            'invoice'    => $invoice,
            'page_title' => "Invoice Receipt — REF-ID: #INV" . $invoiceId
        ]);
    }

    /**
     * Adjust payment parameters of invoices. Offline settlements only.
     */
    public function markPaid(): void {
        $this->requireAuth(['Admin', 'Receptionist']);

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $invoiceId = (int)($_POST['invoice_id'] ?? 0);
            $status = $_POST['payment_status'] ?? 'Paid';

            try {
                $this->invoiceModel->updatePaymentStatus($invoiceId, $status);
                $this->redirect("/invoices/view?id=${invoiceId}", "Success: Settlement status registered as '${status}'.");
            } catch (Exception $e) {
                $this->redirect("/invoices", "Error adjusting parameter: " . $e->getMessage());
            }
        }
    }
}