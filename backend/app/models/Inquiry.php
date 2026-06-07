<?php
/**
 * CRSTMS - Inquiry/Support System Model (OOP Layout)
 */

namespace App\Models;

use Config\Database;
use App\Models\SystemLog;
use PDO;

class Inquiry extends BaseModel {
    private int $id;
    private int $customer_id;
    private string $subject;
    private string $message;
    private ?int $assigned_staff_id;
    private string $status; // 'Open', 'In Progress', 'Responded', 'Escalated', 'Closed'
    private string $created_at;

    /**
     * Store new customer inquiry
     */
    public static function submit(int $customerId, string $subject, string $message): bool {
        $db = Database::getConnection();
        
        $stmt = $db->prepare("
            INSERT INTO inquiries (customer_id, subject, message, status)
            VALUES (?, ?, ?, 'Open')
        ");
        
        $result = $stmt->execute([$customerId, $subject, $message]);
        if ($result) {
            $inquiryId = $db->lastInsertId();
            SystemLog::log(
                "SUBMIT_INQUIRY", 
                "Inquiries", 
                (string)$inquiryId, 
                "Customer concern submitted: '{$subject}'", 
                $customerId
            );
            return true;
        }
        return false;
    }

    /**
     * Register a threaded reply statement
     */
    public static function reply(int $inquiryId, int $responderId, string $responseText, string $newStatus = 'Responded'): bool {
        $db = Database::getConnection();
        
        try {
            $db->beginTransaction();
            
            // Post threaded response text
            $stmt = $db->prepare("
                INSERT INTO inquiry_responses (inquiry_id, responder_id, response_text)
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$inquiryId, $responderId, $responseText]);

            // Adjust inquiry overarching status flags
            $update = $db->prepare("UPDATE inquiries SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $update->execute([$newStatus, $inquiryId]);

            $db->commit();
            
            SystemLog::log(
                "REPLY_INQUIRY", 
                "Inquiries", 
                (string)$inquiryId, 
                "Response dispatched. Overarching inquiry state raised to '{$newStatus}'", 
                $responderId
            );
            return true;
        } catch (\Exception $e) {
            $db->rollBack();
            return false;
        }
    }

    /**
     * Allocate tickets support representative
     */
    public static function assign(int $inquiryId, int $staffId): bool {
        $db = Database::getConnection();
        
        $stmt = $db->prepare("UPDATE inquiries SET assigned_staff_id = ?, status = 'In Progress' WHERE id = ?");
        $result = $stmt->execute([$staffId, $inquiryId]);
        if ($result) {
            SystemLog::log("ASSIGN_INQUIRY", "Inquiries", (string)$inquiryId, "Inquiry allocated to representative #{$staffId}", $_SESSION['user_id'] ?? null);
            return true;
        }
        return false;
    }

    /**
     * Terminate / Close inquiry
     */
    public static function updateStatus(int $inquiryId, string $status): bool {
        $db = Database::getConnection();
        
        $stmt = $db->prepare("UPDATE inquiries SET status = ? WHERE id = ?");
        $result = $stmt->execute([$status, $inquiryId]);
        if ($result) {
            SystemLog::log("CLOSE_INQUIRY", "Inquiries", (string)$inquiryId, "Support inquiry marked as '{$status}'", $_SESSION['user_id'] ?? null);
            return true;
        }
        return false;
    }

    /**
     * Find active inquiries structured in conversational format
     */
    public static function getInquiries(array $filters = []): array {
        $db = Database::getConnection();
        
        $sql = "
            SELECT i.*, 
                   u_cust.full_name as customer_name,
                   cust.email as customer_email,
                   u_staff.full_name as staff_name
            FROM inquiries i
            JOIN users u_cust ON i.customer_id = u_cust.id
            JOIN customers cust ON u_cust.id = cust.user_id
            LEFT JOIN users u_staff ON i.assigned_staff_id = u_staff.id
            WHERE 1=1
        ";
        $params = [];

        if (!empty($filters['customer_id'])) {
            $sql .= " AND i.customer_id = ?";
            $params[] = $filters['customer_id'];
        }

        if (!empty($filters['status'])) {
            $sql .= " AND i.status = ?";
            $params[] = $filters['status'];
        }

        $sql .= " ORDER BY i.created_at DESC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $inquiries = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch replies threaded under each matching ticket index
        foreach ($inquiries as &$inq) {
            $replyStmt = $db->prepare("
                SELECT ir.*, u_resp.full_name as responder_name, u_resp.role as responder_role
                FROM inquiry_responses ir
                JOIN users u_resp ON ir.responder_id = u_resp.id
                WHERE ir.inquiry_id = ?
                ORDER BY ir.created_at ASC
            ");
            $replyStmt->execute([$inq['id']]);
            $inq['replies'] = $replyStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        return $inquiries;
    }
}