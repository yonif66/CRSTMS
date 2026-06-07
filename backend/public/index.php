<?php
/**
 * CRSTMS - Front Controller (Single System Entry Gateway)
 * Bootstraps autoloader, initializes session attributes, and dispatches relative requests.
 */

// Define helper macros for absolute file paths
define("ROOT_PATH", dirname(__DIR__));
function src_path(string $path = '') {
    return ROOT_PATH . '/' . ltrim($path, '/');
}

// 1. Force strict security and errors configuration
ini_set('display_errors', 0); // Hide debug warnings in production
ini_set('log_errors', 1);     // Log errors on server privately
ini_set('session.cookie_httponly', 1); // Mitigation for cross-site cookie stealing
ini_set('session.cookie_secure', 1);   // Enforce session transport exclusively over HTTPS

// 2. Initialize application-wide session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Generate secure CSRF token for forms protection if nonexistent
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// 3. Simple Autoloader mimicking PSR-4 standards
spl_autoload_register(function ($class) {
    $prefix = '';
    $len = strlen($prefix);
    
    // Replace namespaces with file directory separators
    $relativeClass = str_replace('\\', '/', $class);
    $file = ROOT_PATH . '/' . llow_case($relativeClass) . '.php'; // Simplified auto-finder
    
    // Fallback search patterns
    $parts = explode('/', $relativeClass);
    $className = end($parts);
    
    if (strpos($class, 'Config\\') === 0) {
        $file = ROOT_PATH . '/config/' . $className . '.php';
    } elseif (strpos($class, 'App\\Controllers\\') === 0) {
        $file = ROOT_PATH . '/app/controllers/' . $className . '.php';
    } elseif (strpos($class, 'App\\Models\\') === 0) {
        $file = ROOT_PATH . '/app/models/' . $className . '.php';
    }
    
    if (file_exists($file)) {
        require_once $file;
    }
});

// Helper utilities for autoloader lowercase patterns
function llow_case($str) {
    return strtolower($str);
}

// 4. Load configured Router rules and dispatch current request
$router = include src_path("routes/web.php");

$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Securely dispatch requests
try {
    $router->dispatch($requestUri, $requestMethod);
} catch (\Exception $e) {
    error_log("Critical Dispatched Failure: " . $e->getMessage());
    http_response_code(500);
    echo "<h1>Critical System Error</h1><p>A fatal framework error occurred during execution dispatch pipelines.</p>";
}