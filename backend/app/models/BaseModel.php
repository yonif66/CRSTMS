<?php
/**
 * CRSTMS - Abstract Base Model
 * Establishes a database connection instance and transaction helper proxies.
 */

namespace App\Models;

use Config\Database;
use PDO;

abstract class BaseModel {
    protected PDO $db;

    public function __construct() {
        // Obtains the robust singleton PDO link
        $this->db = Database::getConnection();
    }

    /**
     * Helper to execute queries using prepared statements securely
     * Mitigates SQL injection vectors
     */
    protected function query(string $sql, array $params = []): \PDOStatement {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    /**
     * Begin an ACID transaction block
     */
    public function beginTransaction(): bool {
        return $this->db->beginTransaction();
    }

    /**
     * Commit changes permanently
     */
    public function commit(): bool {
        return $this->db->commit();
    }

    /**
     * Rollback atomic adjustments if any step triggers an error
     */
    public function rollBack(): bool {
        return $this->db->rollBack();
    }
}