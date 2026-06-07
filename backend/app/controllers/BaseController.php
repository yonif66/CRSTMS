<?php
/**
 * CRSTMS - Base Controller
 * Implements core MVC dispatching, sanitization, and authorization helper methods.
 */

namespace App\Controllers;

abstract class BaseController {
    
    /**
     * Renders a layout-wrapped PHP view safely
     * 
     * @param string $viewPath Relative path under app/views
     * @param array $data Variables to extract into context
     */
    protected function render(string $viewPath, array $data = []): void {
        // Extract variables to localized scope safely
        extract($this->sanitize($data));

        $viewFile = src_path("app/views/" . $viewPath . ".php");
        if (!file_exists($viewFile)) {
            throw new \Exception("Requested view file '{$viewPath}' not found.");
        }

        // Output Buffering to inject content into layout template securely
        ob_start();
        include $viewFile;
        $content = ob_get_clean();

        // Include global layouts containing header, footer and active navigation
        include src_path("app/views/layouts/header.php");
        echo $content;
        include src_path("app/views/layouts/footer.php");
    }

    /**
     * Sanitize output data array to mitigate Cross-Site Scripting (XSS)
     */
    protected function sanitize(array $data): array {
        $sanitized = [];
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $sanitized[$key] = $this->sanitize($value);
            } elseif (is_string($value)) {
                $sanitized[$key] = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
            } else {
                $sanitized[$key] = $value;
            }
        }
        return $sanitized;
    }

    /**
     * Verifies that the active authenticated session matches specific expected actor roles
     * 
     * @param array $allowedRoles List of valid actor strings (e.g., ['Admin', 'Technician'])
     */
    protected function requireAuth(array $allowedRoles = []): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['user_id'])) {
            $this->redirect('/login', "Authentication Required");
        }

        $userRole = $_SESSION['user_role'] ?? '';
        if (!empty($allowedRoles) && !in_array($userRole, $allowedRoles)) {
            $this->redirect('/dashboard', "Unauthorized Access Profile DETECTED.");
        }
    }

    /**
     * Clean helper method to trigger a secure client redirect
     */
    protected function redirect(string $url, string $flashMessage = null): void {
        if ($flashMessage) {
            $_SESSION['flash_msg'] = $flashMessage;
        }
        header("Location: " . $url);
        exit();
    }
}