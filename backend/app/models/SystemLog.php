<?php
/**
 * CRSTMS - System Activity Audit logging (Active Database Record)
 */

namespace App\Models;

use Config\Database;
use PDO;

class SystemLog {

    /**
     * Dispatch an activity audit entry securely via prepared PDO statements
     */
    public static function log(string $actionType, string $module, ?string $refId, string $details, ?int $userId = null): bool {
        try {
            $db = Database::getConnection();
            
            $stmt = $db->prepare("
                INSERT INTO system_logs (user_id, action_type, affected_module, reference_id, details)
                VALUES (?, ?, ?, ?, ?)
            ");
            
            return $stmt->execute([$userId, $actionType, $module, $refId, $details]);
        } catch (\Exception $e) {
            // Write to system error log so security leaks never occur on failure
            error_log("Logging Exception Occurred: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Fetch recent activity log records with user linkages
     */
    public static function getRecentLogs(int $limit = 50): array {
        $db = Database::getConnection();
        
        $stmt = $db->prepare("
            SELECT l.*, u.full_name, u.role
            FROM system_logs l
            LEFT JOIN users u ON l.user_id = u.id
            ORDER BY l.created_at DESC
            LIMIT ?
        ");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}