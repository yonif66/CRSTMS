<?php
/**
 * CRSTMS - AuthMiddleware
 * Manages active session boundaries, idle session timeout, and role clearances.
 */

namespace App\Middleware;

class AuthMiddleware {
    private const SESSION_TIMEOUT = 1200; // 20 minutes in seconds

    /**
     * Core handler checking and validating the authentic session instance
     */
    public static function checkSession(array $allowedRoles = []): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // 1. Verify existence of authenticated indicator
        if (!isset($_SESSION['user_id'])) {
            self::handleUnauthorized("Authentication required. Please login.");
        }

        // 2. High-security check: IP address and User Agent validation to mitigate session hijacking
        if (isset($_SESSION['user_ip']) && $_SESSION['user_ip'] !== $_SERVER['REMOTE_ADDR']) {
            self::destroyAndRedirect("Session anomaly detected. Please re-authenticate.");
        }
        if (isset($_SESSION['user_agent']) && $_SESSION['user_agent'] !== $_SERVER['HTTP_USER_AGENT']) {
            self::destroyAndRedirect("Session browser anomaly detected. Please re-authenticate.");
        }

        // 3. Prevent idle inactivity leaks (In-activity Timer Check)
        if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > self::SESSION_TIMEOUT)) {
            self::destroyAndRedirect("Session expired due to 20 minutes of inactivity. Please login again.");
        }
        $_SESSION['last_activity'] = time(); // Refresh activity point

        // 4. Role Authorization validation
        $userRole = $_SESSION['user_role'] ?? '';
        if (!empty($allowedRoles) && !in_array($userRole, $allowedRoles)) {
            http_response_code(403);
            echo "<h1>403 Forbidden</h1><p>Your account role ({$userRole}) lacks credentials to access this component.</p>";
            exit();
        }
    }

    /**
     * Direct redirect wrapper for unauthorized logins
     */
    private static function handleUnauthorized(string $message): void {
        $_SESSION['flash_msg'] = $message;
        header("Location: /login");
        exit();
    }

    /**
     * Fully purge sessions on compromise of browser matching identifiers
     */
    private static function destroyAndRedirect(string $message): void {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
        
        session_start();
        $_SESSION['flash_msg'] = $message;
        header("Location: /login?timeout=true");
        exit();
    }
}