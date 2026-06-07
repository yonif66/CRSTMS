<?php
/**
 * CRSTMS - Computer Repair Service Tracking and Management System
 * Database Connection Class (OOP Singleton Pattern)
 */

namespace Config;

use PDO;
use PDOException;

class Database {
    private static ?PDO $instance = null;

    /**
     * Private constructor to prevent direct instantiation
     */
    private function __construct() {}

    /**
     * Retrieve a thread-safe singleton PDO connection instance
     * 
     * @return PDO
     * @throws PDOException
     */
    public static function getConnection(): PDO {
        if (self::$instance === null) {
            try {
                // Config values would typically be loaded via parse_ini_file or getenv
                $host = $_ENV['DB_HOST'] ?? '127.0.0.1';
                $port = $_ENV['DB_PORT'] ?? '3306';
                $dbname = $_ENV['DB_DATABASE'] ?? 'crstms_db';
                $username = $_ENV['DB_USERNAME'] ?? 'crstms_user';
                $password = $_ENV['DB_PASSWORD'] ?? 'secure_password';
                
                $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
                
                $options = [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false, // Enforce real prepared statements
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                ];

                self::$instance = new PDO($dsn, $username, $password, $options);
            } catch (PDOException $e) {
                // Log exception details securely on server; reject leaking credentials to browser
                error_log("Database Connection Failure: " . $e->getMessage());
                throw new PDOException("Database service is currently unavailable. Please verify connection credentials.");
            }
        }
        return self::$instance;
    }

    /**
     * Prevent cloning of the singleton instance
     */
    private function __clone() {}
}