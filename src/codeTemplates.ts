export interface CodeFile {
  name: string;
  path: string;
  language: string;
  code: string;
  explanation: string;
}

export const CODE_TEMPLATES: Record<string, CodeFile> = {
  dbConnection: {
    name: "Database.php",
    path: "/config/database.php",
    language: "php",
    explanation: "Standard OOP PDO Database Connector. Provides a singleton PDO database pointer, loads TLS/SSL flags if present, and forces standard UTF8MB4 parameters to prevent common character encoding vulnerabilities.",
    code: `<?php
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
}`
  },
  baseController: {
    name: "BaseController.php",
    path: "/app/controllers/BaseController.php",
    language: "php",
    explanation: "Abstract Base Controller for CRSTMS. Orchestrates view dispatching, variable binding, session access verification, CSRF checking, and provides clean layout binding macros.",
    code: `<?php
/**
 * CRSTMS - Base Controller
 * Implements core MVC dispatching, sanitization, and authorization helper methods.
 */

namespace App\\Controllers;

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
            throw new \\Exception("Requested view file '{$viewPath}' not found.");
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
}`
  },
  baseModel: {
    name: "BaseModel.php",
    path: "/app/models/BaseModel.php",
    language: "php",
    explanation: "Base Model class providing direct thread-safe access to our Database Connection pointer, and wraps execution inside PDO transactions to guarantee ACID operations when modifying records.",
    code: `<?php
/**
 * CRSTMS - Abstract Base Model
 * Establishes a database connection instance and transaction helper proxies.
 */

namespace App\\Models;

use Config\\Database;
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
    protected function query(string $sql, array $params = []): \\PDOStatement {
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
}`
  },
  authController: {
    name: "AuthController.php",
    path: "/app/controllers/AuthController.php",
    language: "php",
    explanation: "Handles Actor Authentication & State Management. Authenticates input usernames, evaluates modern secure hash credentials, starts configured session scopes, and terminates session lifecycles safely.",
    code: `<?php
/**
 * CRSTMS - AuthController
 * Coordinates login, cryptographic check, session instantiation, and authorization audits.
 */

namespace App\\Controllers;

use App\\Models\\User;

class AuthController extends BaseController {
    
    /**
     * Renders login UI view
     */
    public function showLogin(): void {
        if (isset($_SESSION['user_id'])) {
            $this->redirect('/dashboard');
        }
        $this->render('auth/login');
    }

    /**
     * Authenticates input parameters from the login posting
     */
    public function processLogin(): void {
        // Enforce CSRF token verification (Highly Secure)
        if ($_POST['csrf_token'] !== ($_SESSION['csrf_token'] ?? '')) {
            $this->redirect('/login', "Security validation expired. Please re-authenticate.");
        }

        $username = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';

        if (empty($username) || empty($password)) {
            $this->render('auth/login', ['error' => 'Username and password fields are mandatory.']);
            return;
        }

        // Initialize User Model
        $userModel = new User();
        $user = $userModel->findByUsername($username);

        // Verify password using safe argon2id verification
        if ($user && password_verify($password, $user['password_hash'])) {
            // Set secure session parameters
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_username'] = $user['username'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['user_fullname'] = $user['full_name'];
            
            // Regulate session time-to-live to prevent session hijacking
            $_SESSION['last_activity'] = time();

            // Redirect the user to their designated actor dashboard view
            switch ($user['role']) {
                case 'Admin':
                    $this->redirect('/admin/dashboard');
                    break;
                case 'Receptionist':
                    $this->redirect('/receptionist/dashboard');
                    break;
                case 'Technician':
                    $this->redirect('/technician/dashboard');
                    break;
                case 'Delivery':
                    $this->redirect('/delivery/dashboard');
                    break;
                default:
                    $this->redirect('/customer/dashboard');
                    break;
            }
        } else {
            $this->render('auth/login', ['error' => 'Invalid credentials supplied. Please verify entry.']);
        }
    }

    /**
     * Secure logout terminating and sweeping clean modern sessions
     */
    public function logout(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Destructive sweep of secure sessions
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
        
        header("Location: /login?loggedout=success");
        exit();
    }
}`
  },
  router: {
    name: "routes.php",
    path: "/routes.php",
    language: "php",
    explanation: "Standard MVC Router definition scheme. Declaratively registers relative URI patterns and HTTP actions mapping them directly to controller actions, preventing unmapped routing loopholes.",
    code: `<?php
/**
 * CRSTMS - Explicit URL Router Configuration
 * Maps matching client requests to direct controller actions.
 */

class Router {
    private array $routes = [];

    /**
     * Register a GET route
     */
    public function get(string $uri, string $controllerAction): void {
        $this->routes['GET'][$uri] = $controllerAction;
    }

    /**
     * Register a POST route
     */
    public function post(string $uri, string $controllerAction): void {
        $this->routes['POST'][$uri] = $controllerAction;
    }

    /**
     * Dispatches requests based on path and method queries
     */
    public function dispatch(string $uri, string $method): void {
        // Strip trailing query strings securely
        $path = parse_url($uri, PHP_URL_PATH);
        
        if (!isset($this->routes[$method][$path])) {
            // Render beautiful 404 views
            http_response_code(404);
            echo "<h1>404 Not Found</h1><p>Requested endpoint '{$path}' is not registered on this system.</p>";
            return;
        }

        $target = $this->routes[$method][$path];
        list($controllerClass, $action) = explode('@', $target);

        // Load targeted controller using class namespaces
        $controllerNamespace = "App\\\\Controllers\\\\" . $controllerClass;
        
        if (!class_exists($controllerNamespace)) {
            throw new \\Exception("Target Controller class '{$controllerNamespace}' is not defined.");
        }

        $controllerInstance = new $controllerNamespace();
        if (!method_exists($controllerInstance, $action)) {
            throw new \\Exception("Target Controller action '{$action}' is not present under '{$controllerClass}'.");
        }

        // Trigger action pipeline
        $controllerInstance->$action();
    }
}

// Instantiate and register application route rules
$router = new Router();

// Authentication Endpoints
$router->get('/login', 'AuthController@showLogin');
$router->post('/login', 'AuthController@processLogin');
$router->get('/logout', 'AuthController@logout');

// Core Diagnostics & Ticket Flow (Multi-Actor)
$router->get('/tickets', 'TicketController@index');
$router->get('/tickets/create', 'TicketController@showCreate');
$router->post('/tickets/create', 'TicketController@executeCreate');
$router->get('/tickets/view', 'TicketController@viewSingle');

// Technician Specialized Task Assignments
$router->get('/technician/dashboard', 'TicketController@listAssigned');
$router->post('/technician/ticket/update', 'TicketController@updateDiagnosticNotes');

// Parts and Stock Replenishment logs
$router->get('/inventory', 'InventoryController@index');
$router->post('/inventory/parts/add', 'InventoryController@addPartStock');

// Return router configuration pointer
return $router;`
  },
  frontController: {
    name: "index.php",
    path: "/public/index.php",
    language: "php",
    explanation: "Front Controller acting as the single entrance gateway to the system application. Handles request bootloading, forces PHP settings (strict session protection), and triggers dispatcher pipelines.",
    code: `<?php
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
    $relativeClass = str_replace('\\\\', '/', $class);
    $file = ROOT_PATH . '/' . llow_case($relativeClass) . '.php'; // Simplified auto-finder
    
    // Fallback search patterns
    $parts = explode('/', $relativeClass);
    $className = end($parts);
    
    if (strpos($class, 'Config\\\\') === 0) {
        $file = ROOT_PATH . '/config/' . $className . '.php';
    } elseif (strpos($class, 'App\\\\Controllers\\\\') === 0) {
        $file = ROOT_PATH . '/app/controllers/' . $className . '.php';
    } elseif (strpos($class, 'App\\\\Models\\\\') === 0) {
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
$router = include src_path("routes.php");

$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Securely dispatch requests
try {
    $router->dispatch($requestUri, $requestMethod);
} catch (\\Exception $e) {
    error_log("Critical Dispatched Failure: " . $e->getMessage());
    http_response_code(500);
    echo "<h1>Critical System Error</h1><p>A fatal framework error occurred during execution dispatch pipelines.</p>";
}`
  },
  authMiddleware: {
    name: "AuthMiddleware.php",
    path: "/app/middleware/AuthMiddleware.php",
    language: "php",
    explanation: "Handles secure session management, idle-duration checks (auto-timeout after 20 minutes of inactivity), cookie security, and processes role redirection checks.",
    code: `<?php
/**
 * CRSTMS - AuthMiddleware
 * Manages active session boundaries, idle session timeout, and role clearances.
 */

namespace App\\Middleware;

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
}`
  },
  loginView: {
    name: "login.php",
    path: "/app/views/auth/login.php",
    language: "php",
    explanation: "HTML5/CSS3 Login Panel featuring secure CSRF tokens, sanitised error messaging logs, responsive UI framing, and password verification info badges.",
    code: `<?php
/**
 * CRSTMS - Login Entrance View
 */
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CRSTMS Secure Access Portal</title>
    <link href="/assets/css/tailwind.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4">

    <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div class="text-center space-y-2">
            <h1 class="text-2xl font-bold tracking-tight text-white">CRSTMS Access Portal</h1>
            <p class="text-xs text-slate-400">Computer Repair Service Tracking & Management System</p>
        </div>

        <?php if (!empty($error)): ?>
            <div class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                <?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?>
            </div>
        <?php endif; ?>

        <?php if (!empty($_SESSION['flash_msg'])): ?>
            <div class="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
                <?= htmlspecialchars($_SESSION['flash_msg'], ENT_QUOTES, 'UTF-8') ?>
                <?php unset($_SESSION['flash_msg']); ?>
            </div>
        <?php endif; ?>

        <form action="/login" method="POST" class="space-y-4">
            <!-- CSRF Guard Token -->
            <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">

            <div class="space-y-1.5">
                <label for="username" class="text-xs font-semibold text-slate-400">System Username</label>
                <input type="text" name="username" id="username" placeholder="e.g. tech_johndoe" required
                       class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none">
            </div>

            <div class="space-y-1.5">
                <label for="password" class="text-xs font-semibold text-slate-400">Account Password</label>
                <input type="password" name="password" id="password" placeholder="••••••••" required
                       class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none">
            </div>

            <div class="flex items-center justify-between text-xs">
                <label class="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-white select-none sign-none">
                    <input type="checkbox" name="remember_me" class="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0">
                    <span>Remember logged-in actor</span>
                </label>
            </div>

            <button type="submit" class="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-sm transition-all shadow-md shadow-amber-500/10">
                Verify Credentials
            </button>
        </form>

        <div class="pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 space-y-2 font-sans font-medium">
            <p>Verified with server-side <code class="text-slate-400">password_verify()</code> Argon2id hashes.</p>
            <p class="text-slate-600">Enterprise Access Isolation Enforced.</p>
        </div>
    </div>

</body>
</html>`
  },
  adminDashboard: {
    name: "admin.php",
    path: "/app/views/dashboards/admin.php",
    language: "php",
    explanation: "Standard production admin control board displaying real repair count aggregates, client metrics, active technician availabilities, and automated low stock Alerts.",
    code: `<?php
/**
 * CRSTMS - Admin Operations Control Center
 */
?>
<div class="space-y-6">
    <div class="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
            <h1 class="text-2xl font-bold text-white">Admin Operations Panel</h1>
            <p class="text-xs text-slate-400">Ecosystem statistics and inventory safety levels.</p>
        </div>
        <span class="text-xs bg-slate-800 border border-slate-700 px-3 py-1 rounded text-amber-400 font-mono">Role: Enterprise Systems Admin</span>
    </div>

    <!-- Counters Analytics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Repair Tickets</div>
            <div class="text-2xl font-bold text-white mt-1"><?= $stats['total_tickets'] ?></div>
        </div>
        <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Customers</div>
            <div class="text-2xl font-bold text-white mt-1"><?= $stats['total_customers'] ?></div>
        </div>
        <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Available Technicians</div>
            <div class="text-2xl font-bold text-teal-400 mt-1"><?= $stats['total_techs'] ?> Available</div>
        </div>
        <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Low-Stock Warnings</div>
            <div class="text-2xl font-bold text-red-500 mt-1"><?= count($low_stock) ?> Triggered</div>
        </div>
    </div>

    <!-- Alerts if low stock -->
    <?php if (!empty($low_stock)): ?>
        <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <h3 class="text-sm font-bold text-red-400 mb-2">Automated Low Stock Safety Alerts!</h3>
            <div class="space-y-1.5 text-xs">
                <?php foreach ($low_stock as $part): ?>
                    <div class="flex gap-2 items-center text-slate-300">
                        <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        <span><strong><?= htmlspecialchars($part['part_name']) ?></strong> (SKU: <?= htmlspecialchars($part['serial_number']) ?>) only has <strong class="text-white"><?= $part['stock_quantity'] ?> units remaining</strong> (alert trigger threshold: <?= $part['low_stock_threshold'] ?>).</span>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    <?php endif; ?>

    <!-- Split view metrics & activities -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Inventory catalog -->
        <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 class="text-sm font-bold text-white">Parts Stock Inventory Catalog</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr class="bg-slate-950/50 border-b border-slate-800 text-slate-500">
                            <th class="p-2">Part Name / Serial</th>
                            <th class="p-2">Stock Level</th>
                            <th class="p-2">Unit Cost</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/80">
                        <?php foreach ($inventory as $part): ?>
                            <tr>
                                <td class="p-2">
                                    <div class="font-medium text-slate-200"><?= htmlspecialchars($part['part_name']) ?></div>
                                    <div class="text-[10px] text-slate-500 font-mono"><?= htmlspecialchars($part['serial_number']) ?></div>
                                </td>
                                <td class="p-2">
                                    <span class="font-mono text-xs <?= $part['stock_quantity'] < $part['low_stock_threshold'] ? 'text-red-400 font-bold' : 'text-slate-300' ?>">
                                        <?= $part['stock_quantity'] ?> left
                                    </span>
                                </td>
                                <td class="p-2 font-mono text-slate-400">$<?= number_format($part['unit_price'], 2) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Recent logging feeds -->
        <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 class="text-sm font-bold text-white">Real-Time Core Repair Activity Log</h3>
            <div class="space-y-3">
                <?php foreach ($recent_activities as $log): ?>
                    <div class="p-3 bg-slate-950 rounded-lg border border-slate-800/60 flex items-start gap-3">
                        <div class="text-[10px] text-slate-500 font-mono shrink-0 mt-0.5"><?= $log['time_label'] ?></div>
                        <div class="space-y-0.5">
                            <p class="text-xs text-slate-200"><?= htmlspecialchars($log['message']) ?></p>
                            <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-500 font-mono"><?= $log['actor_role'] ?>: <?= htmlspecialchars($log['actor_name']) ?></span>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>`
  },
  receptionistDashboard: {
    name: "receptionist.php",
    path: "/app/views/dashboards/receptionist.php",
    language: "php",
    explanation: "Intake officer panel allowing registrations of clients, spawning repair tickets, and generating final billing statements.",
    code: `<?php
/**
 * CRSTMS - Receptionist Panel
 */
?>
<div class="space-y-6">
    <div class="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
            <h1 class="text-2xl font-bold text-white">Desk Intake Board</h1>
            <p class="text-xs text-slate-400">Check-in devices, associate owners, and trigger workflows.</p>
        </div>
        <span class="text-xs bg-slate-800 border border-slate-700 px-3 py-1 rounded text-amber-400 font-mono font-bold">Counter Desk: 04</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- New Client -->
        <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 class="text-sm font-bold text-white">Register Customer</h3>
            <form action="/receptionist/customer/create" method="POST" class="space-y-3 text-xs">
                <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                <div class="space-y-1">
                    <label class="text-slate-400 font-semibold">Customer Full Name</label>
                    <input type="text" name="full_name" required placeholder="Emily Thorne" class="w-full bg-slate-950 border border-slate-800 rounded p-2 focus:border-amber-500 focus:outline-none text-slate-200">
                </div>
                <div class="space-y-1">
                    <label class="text-slate-400 font-semibold">Mobile Phone No.</label>
                    <input type="text" name="phone" required placeholder="0711928012" class="w-full bg-slate-950 border border-slate-800 rounded p-2 focus:border-amber-500 focus:outline-none text-slate-200">
                </div>
                <div class="space-y-1">
                    <label class="text-slate-400 font-semibold">Physical Address</label>
                    <input type="text" name="address" required placeholder="12 Baker St, London" class="w-full bg-slate-950 border border-slate-800 rounded p-2 focus:border-amber-500 focus:outline-none text-slate-200">
                </div>
                <button class="w-full py-2 bg-amber-500 hover:bg-amber-600 rounded text-slate-950 font-bold transition-all mt-2">
                    Create Customer File
                </button>
            </form>
        </div>

        <!-- New Ticket -->
        <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 class="text-sm font-bold text-white">Open Repair Ticket</h3>
            <form action="/receptionist/ticket/create" method="POST" class="space-y-3 text-xs">
                <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                <div class="space-y-1">
                    <label class="text-slate-400 font-semibold">Select Customer</label>
                    <select name="customer_id" class="w-full bg-slate-950 border border-slate-800 rounded p-2 focus:border-amber-500 focus:outline-none text-slate-200">
                        <?php foreach ($customers as $c): ?>
                            <option value="<?= $c['id'] ?>"><?= htmlspecialchars($c['full_name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-slate-400 font-semibold">Device Type & Model</label>
                    <input type="text" name="brand" placeholder="Apple MacBook Pro 14" class="w-full bg-slate-950 border border-slate-800 rounded p-2 focus:outline-none text-slate-200">
                </div>
                <div class="space-y-1">
                    <label class="text-slate-400 font-semibold">Issue Reported</label>
                    <textarea name="issue" placeholder="Liquid damage recovery" class="w-full h-16 bg-slate-950 border border-slate-800 rounded p-2 focus:outline-none text-slate-200"></textarea>
                </div>
                <button class="w-full py-2 bg-amber-500 hover:bg-amber-600 rounded text-slate-950 font-bold transition-all mt-2">
                    Open Ticket
                </button>
            </form>
        </div>

        <!-- Customer Inquiries -->
        <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 class="text-sm font-bold text-white">Active Customer Inquiries</h3>
            <div class="space-y-2 max-h-[300px] overflow-y-auto">
                <?php foreach ($inquiries as $inq): ?>
                    <div class="p-3 bg-slate-950 border border-slate-800/80 rounded-lg space-y-2">
                        <div class="flex justify-between items-center text-[10px]">
                            <strong class="text-slate-300"><?= htmlspecialchars($inq['client_name']) ?></strong>
                            <span class="bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded"><?= $inq['status'] ?></span>
                        </div>
                        <p class="text-xs text-slate-400 leading-normal italic">"<?= htmlspecialchars($inq['message_text']) ?>"</p>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>`
  },
  technicianDashboard: {
    name: "technician.php",
    path: "/app/views/dashboards/technician.php",
    language: "php",
    explanation: "Technician workboard showcasing assigned hardware tickets, diagnostics notepad interfaces, and tool logs for stock deduction.",
    code: `<?php
/**
 * CRSTMS - Technician Assignments Panel
 */
?>
<div class="space-y-6">
    <div class="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
            <h1 class="text-2xl font-bold text-white">Technician Diagnostics Board</h1>
            <p class="text-xs text-slate-400">Assigned repair queues, parts consumption records, and status updates.</p>
        </div>
        <span class="text-xs bg-slate-800 border border-slate-700 px-3 py-1 rounded text-amber-400 font-mono font-bold">Tech Speciality: Solder Work & Logic Boards</span>
    </div>

    <!-- Main Board Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Ticket Queue -->
        <div class="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 class="text-sm font-bold text-white">Enrolled Repair Tickets Queue</h3>
            <div class="space-y-3">
                <?php foreach ($tickets as $t): ?>
                    <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                        <div class="flex justify-between items-center text-xs">
                            <span class="font-mono text-amber-400 font-bold">Ticket ID: #<?= $t['id'] ?></span>
                            <span class="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20"><?= $t['status'] ?></span>
                        </div>
                        <div class="text-xs text-slate-300">
                            <strong>Owner Customer:</strong> <?= htmlspecialchars($t['customer_name']) ?> | <strong>Hardware:</strong> <?= htmlspecialchars($t['device_brand']) ?> (<?= htmlspecialchars($t['device_model']) ?>)
                        </div>
                        <p class="text-xs text-slate-400 italic">"<?= htmlspecialchars($t['issue_description']) ?>"</p>
                        
                        <!-- Internal Actions -->
                        <form action="/technician/ticket/update" method="POST" class="pt-3 border-t border-slate-800 flex items-center gap-3 flex-wrap text-xs">
                            <input type="hidden" name="ticket_id" value="<?= $t['id'] ?>">
                            <select name="status" class="bg-slate-900 border border-slate-800 rounded p-1.5 focus:outline-none text-slate-200">
                                <option value="In Progress">In Progress</option>
                                <option value="Waiting for Spare Parts">Waiting for Spare Parts</option>
                                <option value="Completed">Completed / Passed QA</option>
                            </select>
                            <input type="text" name="notes" placeholder="Diagnostic comments..." required class="flex-1 bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 focus:outline-none">
                            <button class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded font-bold transition-all">
                                Post Progress
                            </button>
                        </form>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Inventory consumption panel -->
        <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 class="text-sm font-bold text-white">Record Part Deduction</h3>
            <p class="text-xs text-slate-400">Deduct units physically used from inventory to trigger invoice calculations.</p>
            
            <form action="/technician/inventory/consume" method="POST" class="space-y-3 text-xs">
                <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                <div class="space-y-1">
                    <label class="text-slate-400 font-semibold">Reference Ticket ID</label>
                    <select name="ticket_id" class="w-full bg-slate-950 border border-slate-800 rounded p-2 focus:outline-none text-slate-200">
                        <?php foreach ($tickets as $t): ?>
                            <option value="<?= $t['id'] ?>">Ticket #<?= $t['id'] ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-slate-400 font-semibold">Part Used</label>
                    <select name="part_id" class="w-full bg-slate-950 border border-slate-800 rounded p-2 focus:outline-none text-slate-200">
                        <?php foreach ($inventory as $part): ?>
                            <option value="<?= $part['id'] ?>"><?= htmlspecialchars($part['part_name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <button class="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded transition-all mt-3">
                    Deduct & Record Usage
                </button>
            </form>
        </div>
    </div>
</div>`
  },
  customerDashboard: {
    name: "customer.php",
    path: "/app/views/dashboards/customer.php",
    language: "php",
    explanation: "Allows customers to track devices via live progress steps, download invoice receipts, and launch inquiries.",
    code: `<?php
/**
 * CRSTMS - Customer Tracking Hub
 */
?>
<div class="space-y-6">
    <div class="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
            <h1 class="text-2xl font-bold text-white">Client Repair Center</h1>
            <p class="text-xs text-slate-400">Monitor active repair pipelines, view billings, and summon assistance.</p>
        </div>
        <span class="text-xs bg-slate-800 border border-slate-700 px-3 py-1 rounded text-amber-500 font-mono font-bold">My Account Status: Registered Client</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Repair Tracker -->
        <div class="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 class="text-sm font-bold text-white">Live Hardware Status Tracking</h3>
            
            <?php if (empty($tickets)): ?>
                <p class="text-xs text-slate-500">No active repair tickets found registered under your customer profile.</p>
            <?php else: ?>
                <?php foreach ($tickets as $t): ?>
                    <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                        <div class="flex justify-between text-xs items-center">
                            <span class="font-mono text-slate-300">Ticket #<?= $t['id'] ?></span>
                            <span class="text-amber-400 font-bold font-mono">Status: <?= $t['status'] ?></span>
                        </div>

                        <!-- Step Tracker UI Visual -->
                        <div class="grid grid-cols-4 gap-2 text-center text-[10px]">
                            <div class="p-2 rounded <?= in_array($t['status'], ['Created', 'Assigned', 'In Progress', 'Completed']) ? 'bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20' : 'bg-slate-900 text-slate-600' ?>">Check-in</div>
                            <div class="p-2 rounded <?= in_array($t['status'], ['Assigned', 'In Progress', 'Completed']) ? 'bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20' : 'bg-slate-900 text-slate-600' ?>">Diagnosing</div>
                            <div class="p-2 rounded <?= in_array($t['status'], ['In Progress', 'Completed']) ? 'bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20' : 'bg-slate-900 text-slate-600' ?>">Repair Work</div>
                            <div class="p-2 rounded <?= $t['status'] === 'Completed' ? 'bg-teal-500/10 text-teal-400 font-bold border border-teal-500/20' : 'bg-slate-900 text-slate-600' ?>">Ready / Passed</div>
                        </div>

                        <p class="text-xs text-slate-400"><strong>Hardware model:</strong> <?= htmlspecialchars($t['device_brand']) ?> <?= htmlspecialchars($t['device_model']) ?></p>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>

        <!-- Inquiries / Billing -->
        <div class="space-y-4">
            <!-- Launch support inquiry -->
            <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                <h3 class="text-sm font-bold text-white">Inquire / Query Support</h3>
                <form action="/customer/inquiry/submit" method="POST" class="space-y-3 text-xs">
                    <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                    <div class="space-y-1">
                        <label class="text-slate-400 font-semibold">Message Detail</label>
                        <textarea name="message" required placeholder="Ask about ticket completion timeline or quotes..." class="w-full h-20 bg-slate-950 border border-slate-800 rounded p-2 focus:outline-none text-slate-200"></textarea>
                    </div>
                    <button class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold transition-all">
                        Submit Enquiry
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>`
  },
  deliveryDashboard: {
    name: "delivery.php",
    path: "/app/views/dashboards/delivery.php",
    language: "php",
    explanation: "Logistics specialist control pad supplying assigned delivery files, address routes, and recipient completion states.",
    code: `<?php
/**
 * CRSTMS - Delivery Personnel Logistics Panel
 */
?>
<div class="space-y-6">
    <div class="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
            <h1 class="text-2xl font-bold text-white">Logistics Delivery Board</h1>
            <p class="text-xs text-slate-400">Assigned dispatch packages, routes, and signoff forms.</p>
        </div>
        <span class="text-xs bg-slate-800 border border-slate-700 px-3 py-1 rounded text-amber-500 font-mono font-bold">Driver ID: Fleet 01</span>
    </div>

    <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <h3 class="text-sm font-bold text-white">My Active Transport Manifest</h3>
        
        <div class="space-y-3">
            <?php foreach ($deliveries as $d): ?>
                <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div class="space-y-1">
                        <span class="font-mono text-amber-400 text-xs font-bold">Manifest ID: #00<?= $d['id'] ?></span>
                        <div class="text-xs text-slate-300"><strong>Customer:</strong> <?= htmlspecialchars($d['customer_name']) ?></div>
                    </div>
                    <div class="text-xs text-slate-400">
                        <strong>Address:</strong> <?= htmlspecialchars($d['shipping_destination']) ?>
                    </div>
                    <div class="text-xs">
                        <strong class="text-slate-400">State:</strong> 
                        <span class="ml-1 px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300"><?= $d['status'] ?></span>
                    </div>
                    <form action="/delivery/update" method="POST" class="flex gap-2 justify-end text-xs">
                        <input type="hidden" name="delivery_id" value="<?= $d['id'] ?>">
                        <select name="status" class="bg-slate-900 border border-slate-800 rounded p-1 text-slate-300">
                            <option value="In Transit">In Transit</option>
                            <option value="Handed Over">Handed Over / Closed</option>
                        </select>
                        <button class="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1 rounded transition-all">
                            Save
                        </button>
                    </form>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>`
  },
  customerModel: {
    name: "Customer.php",
    path: "/app/models/Customer.php",
    language: "php",
    explanation: "Handles CRSTMS Customers domain interactions. Interacts with the 'customers' table linked in a strict 1:1 relationship with parent 'users' table profiles. Restricts duplicate emails, implements paginated lookups, and retrieves repair history logs with aggregated invoice sums securely using PDO prepared statements.",
    code: `<?php
/**
 * CRSTMS - Customer OOP Model
 */

namespace App\\Models;

use PDO;
use Exception;

class Customer extends BaseModel {

    /**
     * Finds customer profile and merges parent user credential details.
     */
    public function find(int $userId): ?array {
        $sql = "SELECT c.*, u.full_name, u.phone_number as primary_phone, u.role, u.created_at as registered_date 
                FROM customers c 
                JOIN users u ON c.user_id = u.id 
                WHERE c.user_id = :user_id LIMIT 1";
        
        $stmt = $this->query($sql, ['user_id' => $userId]);
        $result = $stmt->fetch();
        return $result ? $result : null;
    }

    /**
     * Prevents duplicate logins/customers with existing email addresses.
     */
    public function emailExists(string $email, ?int $excludeUserId = null): bool {
        $sql = "SELECT 1 FROM customers WHERE email = :email";
        $params = ['email' => $email];
        if ($excludeUserId !== null) {
            $sql .= " AND user_id != :exclude_id";
            $params['exclude_id'] = $excludeUserId;
        }
        $stmt = $this->query($sql, $params);
        return (bool)$stmt->fetchColumn();
    }

    /**
     * Creates a customer account inside user and customer registries transactional-ly.
     * Prevents half-baked data leaks by rolling back upon unexpected PDO failures.
     */
    public function registerCustomer(array $profile): int {
        if ($this->emailExists($profile['email'])) {
            throw new Exception("Registration conflict error: A customer with email '{$profile['email']}' is already registered.");
        }

        $this->beginTransaction();
        try {
            // 1. Create entry in users credentials table
            // Password is cryptographically salted using high-grade Argon2id hash protocols
            $hashedPassword = password_hash($profile['password'] ?? 'crstms_default123', PASSWORD_ARGON2ID);
            
            $sqlUser = "INSERT INTO users (username, password_hash, full_name, phone_number, role) 
                        VALUES (:username, :password, :full_name, :phone, 'Customer')";
            
            $username = $profile['username'] ?? strtolower(str_replace(' ', '_', $profile['full_name'])) . rand(10, 99);
            
            $this->query($sqlUser, [
                'username'  => $username,
                'password'  => $hashedPassword,
                'full_name' => $profile['full_name'],
                'phone'     => $profile['phone_number']
            ]);

            $userId = (int)$this->db->lastInsertId();

            // 2. Create corresponding client settings mapping Profile
            $sqlCustomer = "INSERT INTO customers (user_id, email, address, alternative_phone) 
                            VALUES (:user_id, :email, :address, :alt_phone)";
            
            $this->query($sqlCustomer, [
                'user_id'   => $userId,
                'email'     => $profile['email'],
                'address'   => $profile['address'],
                'alt_phone' => $profile['alternative_phone'] ?? null
            ]);

            $this->commit();
            return $userId;

        } catch (Exception $e) {
            $this->rollBack();
            throw new Exception("Operational Failure committing Customer creation transaction: " . $e->getMessage());
        }
    }

    /**
     * Updates customer and parent users profiles inside a secure transaction.
     */
    public function updateCustomer(int $userId, array $data): bool {
        if ($this->emailExists($data['email'], $userId)) {
            throw new Exception("Constraint Violation: Email '{$data['email']}' is already in use by another billing profile.");
        }

        $this->beginTransaction();
        try {
            // Update Base User Credentials Name & Primary Phone
            $sqlUser = "UPDATE users SET full_name = :full_name, phone_number = :phone WHERE id = :id";
            $this->query($sqlUser, [
                'full_name' => $data['full_name'],
                'phone'     => $data['phone_number'],
                'id'        => $userId
            ]);

            // Update Specific Contact and Billing Options
            $sqlCust = "UPDATE customers SET email = :email, address = :address, alternative_phone = :alt_phone WHERE user_id = :user_id";
            $this->query($sqlCust, [
                'email'     => $data['email'],
                'address'   => $data['address'],
                'alt_phone' => $data['alternative_phone'] ?? null,
                'user_id'   => $userId
            ]);

            $this->commit();
            return true;
        } catch (Exception $e) {
            $this->rollBack();
            throw new Exception("Failed to update customer transaction: " . $e->getMessage());
        }
    }

    /**
     * Safely deletes/deactivates a customer.
     */
    public function deleteCustomer(int $userId): bool {
        $this->beginTransaction();
        try {
            // Cascade rules will automatically delete customer metadata upon user master deletion
            $sql = "DELETE FROM users WHERE id = :id AND role = 'Customer'";
            $this->query($sql, ['id' => $userId]);
            $this->commit();
            return true;
        } catch (Exception $e) {
            $this->rollBack();
            throw new Exception("Cascaded delete transaction failed safely: " . $e->getMessage());
        }
    }

    /**
     * Searches customers based on full text elements with pagination constraints.
     */
    public function search(string $term, int $limit = 10, int $offset = 0): array {
        $sql = "SELECT c.*, u.full_name, u.phone_number as primary_phone, u.created_at as registered_date 
                FROM customers c 
                JOIN users u ON c.user_id = u.id";
        
        $params = [];
        if (!empty($term)) {
            $sql .= " WHERE u.full_name LIKE :term OR c.email LIKE :term OR u.phone_number LIKE :term";
            $params['term'] = "%{$term}%";
        }
        
        $sql .= " ORDER BY u.full_name ASC LIMIT :limit OFFSET :offset";
        
        // Manual binding necessary for integer variables in PDO strict environments
        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val, PDO::PARAM_STR);
        }
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }

    /**
     * Aggregates total customer count for pagination calculation.
     */
    public function getCount(string $term = ""): int {
        $sql = "SELECT COUNT(*) FROM customers c JOIN users u ON c.user_id = u.id";
        $params = [];
        if (!empty($term)) {
            $sql .= " WHERE u.full_name LIKE :term OR c.email LIKE :term";
            $params['term'] = "%{$term}%";
        }
        $stmt = $this->query($sql, $params);
        return (int)$stmt->fetchColumn();
    }

    /**
     * Retrieves all history of hardware repairs under this Customer ID.
     */
    public function getRepairHistory(int $userId): array {
        $sql = "SELECT t.*, d.brand, d.model, d.serial_number,
                       u.full_name as technician_name,
                       (SELECT SUM(unit_price) FROM spare_parts WHERE id IN (
                           SELECT part_id FROM inventory_logs WHERE notes LIKE CONCAT('%Ticket #', t.id, '%')
                       )) as part_costs
                FROM repair_tickets t
                JOIN devices d ON t.device_id = d.id
                LEFT JOIN users u ON t.technician_id = u.id
                WHERE t.customer_id = :user_id
                ORDER BY t.created_at DESC";
                
        return $this->query($sql, ['user_id' => $userId])->fetchAll();
    }
}
`
  },
  deviceModel: {
    name: "Device.php",
    path: "/app/models/Device.php",
    language: "php",
    explanation: "Models Client Devices in the CRSTMS repository. Tracks hardware identifiers (Serial Numbers) to check for manufacturing conflicts, links units to customer owners, and records checking-in device statuses.",
    code: `<?php
/**
 * CRSTMS - Device OOP Model
 */

namespace App\\Models;

use PDO;
use Exception;

class Device extends BaseModel {

    /**
     * Finds standard device details and corresponding owner file.
     */
    public function find(int $id): ?array {
        $sql = "SELECT d.*, u.full_name as owner_name, c.email as owner_email 
                FROM devices d
                JOIN customers c ON d.customer_id = c.user_id
                JOIN users u ON c.user_id = u.id
                WHERE d.id = :id LIMIT 1";
        return $this->query($sql, ['id' => $id])->fetch() ?: null;
    }

    /**
     * Prevents registering twin hardware components already tracked inside the system.
     */
    public function verifySerialNumber(string $serialNumber, ?int $excludeDeviceId = null): bool {
        $sql = "SELECT 1 FROM devices WHERE serial_number = :serial";
        $params = ['serial' => $serialNumber];
        if ($excludeDeviceId !== null) {
            $sql .= " AND id != :exclude_id";
            $params['exclude_id'] = $excludeDeviceId;
        }
        $stmt = $this->query($sql, $params);
        return (bool)$stmt->fetchColumn();
    }

    /**
     * Registers a device and bonds it to the customer.
     */
    public function registerDevice(array $deviceData): int {
        // Enforce strong uniqueness rules for hardware serial codes
        $serial = trim($deviceData['serial_number']);
        if ($this->verifySerialNumber($serial)) {
            throw new Exception("Operational conflict: Device Serial ID '{$serial}' is already registered under maintenance logs.");
        }

        $sql = "INSERT INTO devices (customer_id, device_type, brand, model, serial_number, issue_description) 
                VALUES (:customer_id, :device_type, :brand, :model, :serial, :issue)";
        
        $this->query($sql, [
            'customer_id'       => $deviceData['customer_id'],
            'device_type'       => $deviceData['device_type'],
            'brand'             => $deviceData['brand'],
            'model'             => $deviceData['model'],
            'serial'            => $serial,
            'issue'             => $deviceData['issue_description']
        ]);

        return (int)$this->db->lastInsertId();
    }

    /**
     * Updates device specifications in database.
     */
    public function updateDevice(int $id, array $data): bool {
        $serial = trim($data['serial_number']);
        if ($this->verifySerialNumber($serial, $id)) {
            throw new Exception("Database constraint violation: Serial Code '{$serial}' matches another system component asset.");
        }

        $sql = "UPDATE devices 
                SET device_type = :device_type, brand = :brand, model = :model, serial_number = :serial, issue_description = :issue 
                WHERE id = :id";
                
        $this->query($sql, [
            'device_type' => $data['device_type'],
            'brand'       => $data['brand'],
            'model'       => $data['model'],
            'serial'      => $serial,
            'issue'       => $data['issue_description'],
            'id'          => $id
        ]);

        return true;
    }

    /**
     * Links a list of registered units under a specific Customer.
     */
    public function getDevicesByCustomer(int $customerId): array {
        $sql = "SELECT d.*, 
                (SELECT COUNT(*) FROM repair_tickets WHERE device_id = d.id) as ticket_count
                FROM devices d 
                WHERE d.customer_id = :cust_id 
                ORDER BY d.created_at DESC";
        return $this->query($sql, ['cust_id' => $customerId])->fetchAll();
    }
}
`
  },
  customerController: {
    name: "CustomerController.php",
    path: "/app/controllers/CustomerController.php",
    language: "php",
    explanation: "Coordinates Customer Profiles, Device Registration, and Repair Invoices. Integrates strict form validation rules, duplicate entry prevention, pagination formulas, and joins device and ticket tables inside the database context cleanly.",
    code: `<?php
/**
 * CRSTMS - CustomerController
 * Coordinates Customer Profiles, History, and Device registrations
 */

namespace App\\Controllers;

use App\\Models\\Customer;
use App\\Models\\Device;
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
`
  },
  repairTicketModel: {
    name: "RepairTicket.php",
    path: "/app/models/RepairTicket.php",
    language: "php",
    explanation: "Models the core transactional repair tickets database schema. Implements secure prepared statements via PDO, strict role-based state transitional logic boundaries, dual-table activity auditing, and atomic spare parts inventory deduction transactions.",
    code: `<?php
/**
 * CRSTMS - RepairTicket Model
 * Core transactional model for repair service jobs, logging, and status transitions.
 */

namespace App\\Models;

use App\\Models\\BaseModel;
use Exception;
use PDO;

class RepairTicket extends BaseModel {

    /**
     * Retrieve a highly unified repair ticket schema payload joined with owner, hardware device, assignees.
     */
    public function find(int $ticketId): ?array {
        $sql = "SELECT rt.*, 
                       u_cust.full_name AS customer_name, c.email AS customer_email, u_cust.phone_number AS customer_phone, c.address AS customer_address,
                       d.device_type, d.brand AS device_brand, d.model AS device_model, d.serial_number AS device_serial,
                       u_tech.full_name AS technician_name, t.specialization AS technician_specialty,
                       u_rec.full_name AS receptionist_name, r.desk_number AS receptionist_desk
                FROM repair_tickets rt
                JOIN users u_cust ON rt.customer_id = u_cust.id
                JOIN customers c ON u_cust.id = c.user_id
                JOIN devices d ON rt.device_id = d.id
                JOIN users u_rec ON rt.receptionist_id = u_rec.id
                JOIN receptionists r ON u_rec.id = r.user_id
                LEFT JOIN users u_tech ON rt.technician_id = u_tech.id
                LEFT JOIN technicians t ON u_tech.id = t.user_id
                WHERE rt.id = :id";
        
        $stmt = $this->query($sql, ['id' => $ticketId]);
        $ticket = $stmt->fetch();
        return $ticket ? $ticket : null;
    }

    /**
     * Fetches filtering audit queues with total offset-based paginated queries.
     */
    public function search(array $filters, int $limit = 10, int $offset = 0): array {
        $conditions = [];
        $params = [];

        if (!empty($filters['search'])) {
            $conditions[] = "(u_cust.full_name LIKE :search OR d.model LIKE :search OR d.serial_number LIKE :search OR rt.id = :search_id)";
            $params['search'] = '%' . $filters['search'] . '%';
            $params['search_id'] = is_numeric($filters['search']) ? (int)$filters['search'] : 0;
        }

        if (!empty($filters['status'])) {
            $conditions[] = "rt.status = :status";
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['technician_id'])) {
            $conditions[] = "rt.technician_id = :technician_id";
            $params['technician_id'] = (int)$filters['technician_id'];
        }

        if (!empty($filters['customer_id'])) {
            $conditions[] = "rt.customer_id = :customer_id";
            $params['customer_id'] = (int)$filters['customer_id'];
        }

        if (!empty($filters['date_created'])) {
            $conditions[] = "DATE(rt.created_at) = :date_created";
            $params['date_created'] = $filters['date_created'];
        }

        if (!empty($filters['priority'])) {
            $conditions[] = "rt.priority = :priority";
            $params['priority'] = $filters['priority'];
        }

        $whereClause = !empty($conditions) ? "WHERE " . implode(" AND ", $conditions) : "";

        $sql = "SELECT rt.*, u_cust.full_name AS customer_name, d.brand AS device_brand, d.model AS device_model, u_tech.full_name AS technician_name
                FROM repair_tickets rt
                JOIN users u_cust ON rt.customer_id = u_cust.id
                JOIN devices d ON rt.device_id = d.id
                LEFT JOIN users u_tech ON rt.technician_id = u_tech.id
                \${whereClause}
                ORDER BY rt.created_at DESC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        
        // Dynamic binding to preserve INT bindings for PDO limits
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    /**
     * Compute filtered aggregate counters to render navigation pages correctly.
     */
    public function getCount(array $filters): int {
        $conditions = [];
        $params = [];

        if (!empty($filters['search'])) {
            $conditions[] = "(u_cust.full_name LIKE :search OR d.model LIKE :search_mod OR rt.id = :search_id)";
            $params['search'] = '%' . $filters['search'] . '%';
            $params['search_mod'] = '%' . $filters['search'] . '%';
            $params['search_id'] = is_numeric($filters['search']) ? (int)$filters['search'] : 0;
        }

        if (!empty($filters['status'])) {
            $conditions[] = "rt.status = :status";
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['technician_id'])) {
            $conditions[] = "rt.technician_id = :technician_id";
            $params['technician_id'] = (int)$filters['technician_id'];
        }

        $whereClause = !empty($conditions) ? "WHERE " . implode(" AND ", $conditions) : "";

        $sql = "SELECT COUNT(*) FROM repair_tickets rt
                JOIN users u_cust ON rt.customer_id = u_cust.id
                JOIN devices d ON rt.device_id = d.id
                \${whereClause}";

        $stmt = $this->query($sql, $params);
        return (int)$stmt->fetchColumn();
    }

    /**
     * Create check-in ticket transactionally with robust activity trails.
     */
    public function createTicket(array $data, int $creatorId): int {
        $this->db->beginTransaction();
        try {
            $sql = "INSERT INTO repair_tickets (customer_id, device_id, receptionist_id, status, priority, estimated_completion_date, issue_description)
                    VALUES (:customer_id, :device_id, :receptionist_id, :status, :priority, :estimated_completion_date, :issue_description)";
            
            $status = !empty($data['technician_id']) ? 'Assigned' : 'Created';
            
            $params = [
                'customer_id'               => $data['customer_id'],
                'device_id'                 => $data['device_id'],
                'receptionist_id'           => $creatorId,
                'status'                    => $status,
                'priority'                  => $data['priority'] ?? 'Medium',
                'estimated_completion_date' => $data['estimated_completion_date'] ?: null,
                'issue_description'         => $data['issue_description']
            ];

            $this->query($sql, $params);
            $ticketId = (int)$this->db->lastInsertId();

            if (!empty($data['technician_id'])) {
                $sqlAssign = "UPDATE repair_tickets SET technician_id = :tech_id WHERE id = :ticket_id";
                $this->query($sqlAssign, ['tech_id' => $data['technician_id'], 'ticket_id' => $ticketId]);
                
                $this->logActivity($ticketId, $creatorId, "Assigned primary ticket allocation to Technician ID: \${data['technician_id']}");
            } else {
                $this->logActivity($ticketId, $creatorId, "Registered initial intake device check-in");
            }

            $this->db->commit();
            return $ticketId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Re-assigns the ticket to a new repair technician, registering automated audits.
     */
    public function assignTechnician(int $ticketId, ?int $techId, int $operatorId): void {
        $this->db->beginTransaction();
        try {
            $status = $techId ? 'Assigned' : 'Created';
            $sql = "UPDATE repair_tickets SET technician_id = :tech_id, status = :status WHERE id = :id";
            $this->query($sql, [
                'tech_id' => $techId,
                'status'  => $status,
                'id'      => $ticketId
            ]);

            $msg = $techId ? "Allocated repairs responsibility queue to Technician User #\${techId}" : "Reset allocations, ticket returned to pool";
            $this->logActivity($ticketId, $operatorId, $msg);

            $this->db->commit();
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Moves a ticket through state transitions, preserving a strict diagnostic log file.
     */
    public function transitionStatus(int $ticketId, string $status, string $notes, int $operatorId): void {
        $allowedStates = ['Created', 'Assigned', 'In Progress', 'Waiting for Spare Parts', 'Completed', 'Ready for Delivery', 'Delivered', 'Closed'];
        if (!in_array($status, $allowedStates)) {
            throw new Exception("Operational boundary breach: Proposed state '\${status}' is unsupported.");
        }

        $this->db->beginTransaction();
        try {
            $sql = "UPDATE repair_tickets SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
            $this->query($sql, ['status' => $status, 'id' => $ticketId]);

            // Save technical diagnostic log notes
            $sqlNote = "INSERT INTO repair_updates (ticket_id, technician_id, update_status, diagnostic_notes)
                        VALUES (:ticket_id, :tech_id, :status, :notes)";
            $this->query($sqlNote, [
                'ticket_id' => $ticketId,
                'tech_id'   => $operatorId,
                'status'    => $status,
                'notes'     => $notes ?: "Status altered and checked into bench queue."
            ]);

            // Save core transaction ledger timeline log
            $this->logActivity($ticketId, $operatorId, "Transitioned repair state directly to: [\${status}] — Context: " . substr($notes, 0, 80));

            $this->db->commit();
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Logs spare part deduction inside dynamic company inventory buffers.
     */
    public function consumeSparePart(int $ticketId, int $partId, int $quantity, int $techId): void {
        $this->db->beginTransaction();
        try {
            // Safety stock checks
            $sqlCheck = "SELECT stock_quantity, unit_price, part_name FROM spare_parts WHERE id = :part_id FOR UPDATE";
            $part = $this->query($sqlCheck, ['part_id' => $partId])->fetch();

            if (!$part || $part['stock_quantity'] < $quantity) {
                throw new Exception("Stock depletion warning: '\${part['part_name']}' is out of physical scope.");
            }

            // Deduct stock
            $sqlDeduct = "UPDATE spare_parts SET stock_quantity = stock_quantity - :qty WHERE id = :id";
            $this->query($sqlDeduct, ['qty' => $quantity, 'id' => $partId]);

            // Record transaction ledger
            $sqlLog = "INSERT INTO inventory_logs (part_id, user_id, quantity_changed, action_type, notes)
                       VALUES (:part_id, :user_id, :qty_changed, 'Used in Repair', :notes)";
            $this->query($sqlLog, [
                'part_id'     => $partId,
                'user_id'     => $techId,
                'qty_changed' => -\${quantity},
                'notes'       => "Consumed under Ticket bench process #\${ticketId}"
            ]);

            // Inject notes into updates timeline
            $sqlNote = "INSERT INTO repair_updates (ticket_id, technician_id, update_status, diagnostic_notes)
                        VALUES (:ticket_id, :tech_id, 'In Repair', :notes)";
            $this->query($sqlNote, [
                'ticket_id'    => $ticketId,
                'tech_id'      => $techId,
                'notes'        => "Utilized component: \${part['part_name']} (Quantity: \${quantity})"
            ]);

            $this->logActivity($ticketId, $techId, "Subtracted 1x '\${part['part_name']}' from workshop store; billing queued.");

            $this->db->commit();
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Fetches historic diagnostic timeline updates posted by repair assessors.
     */
    public function getUpdates(int $ticketId): array {
        $sql = "SELECT ru.*, u.full_name AS technician_name 
                FROM repair_updates ru
                JOIN users u ON ru.technician_id = u.id
                WHERE ru.ticket_id = :ticket_id
                ORDER BY ru.created_at DESC";
        return $this->query($sql, ['ticket_id' => $ticketId])->fetchAll();
    }

    /**
     * Timeline activity tracking log.
     */
    private function logActivity(int $ticketId, int $userId, string $action): void {
        $sqlLog = "INSERT INTO inventory_logs (part_id, user_id, quantity_changed, action_type, notes) 
                   VALUES (1, :user_id, 0, 'Manual Adjust', :notes)";
        // Using a generalized activity log mechanism or standard custom table query
        $this->query("INSERT INTO inquiries (customer_id, message_text, status) VALUES (:cust, :msg, 'Closed')", [
            'cust' => $userId, 
            'msg'  => "TICKET AUDIT #\${ticketId}: " . $action
        ]);
    }
}
`,
  },
  ticketController: {
    name: "TicketController.php",
    path: "/app/controllers/TicketController.php",
    language: "php",
    explanation: "Coordinates ticket check-ins, technician operations, statuses tracking timeline loops, client handovers, and inventory deduct requests cleanly under strict OOP specifications.",
    code: `<?php
/**
 * CRSTMS - TicketController
 * Facilitates service tickets checking, assigning, updating, and technician workflows.
 */

namespace App\\Controllers;

use App\\Models\\RepairTicket;
use App\\Models\\Customer;
use App\\Models\\Device;
use Exception;

class TicketController extends BaseController {

    private RepairTicket $ticketModel;
    private Customer $customerModel;
    private Device $deviceModel;

    public function __construct() {
        $this->ticketModel = new RepairTicket();
        $this->customerModel = new Customer();
        $this->deviceModel = new Device();
    }

    /**
     * Displays searchable queues of existing service tickets with status and staff filters.
     */
    public function index(): void {
        $this->requireAuth(['Admin', 'Receptionist', 'Technician']);

        $filters = [
            'search'        => \$_GET['search'] ?? '',
            'status'        => \$_GET['status'] ?? '',
            'technician_id' => \$_GET['technician_id'] ?? '',
            'priority'      => \$_GET['priority'] ?? '',
            'date_created'  => \$_GET['date_created'] ?? ''
        ];

        $page = isset(\$_GET['page']) ? (int)\$_GET['page'] : 1;
        if (\$page < 1) \$page = 1;
        $limit = 10;
        $offset = (\$page - 1) * \$limit;

        \$totalRecords = \$this->ticketModel->getCount(\$filters);
        \$totalPages = ceil(\$totalRecords / \$limit) ?: 1;
        \$tickets = \$this->ticketModel->search(\$filters, \$limit, \$offset);

        // Fetch support listings for template dropdown lists
        \$technicians = \$this->customerModel->query("SELECT id, full_name DISTINCT FROM users WHERE role = 'Technician'")->fetchAll();

        \$this->render('tickets/index', [
            'tickets'      => \$tickets,
            'filters'      => \$filters,
            'technicians'  => \$technicians,
            'currentPage'  => \$page,
            'totalPages'   => \$totalPages,
            'totalRecords' => \$totalRecords,
            'page_title'   => "Active Service Tickets"
        ]);
    }

    /**
     * Check-in new hardware device and open service ticket records.
     */
    public function create(): void {
        $this->requireAuth(['Admin', 'Receptionist']);

        \$errors = [];
        \$input = [];

        if (\$_SERVER['REQUEST_METHOD'] === 'POST') {
            \$token = \$_POST['csrf_token'] ?? '';
            if (\$token !== (\$_SESSION['csrf_token'] ?? '')) {
                die("CSRF authenticity token mismatch. Session halted.");
            }

            \$input = [
                'customer_id'               => (int)(\$_POST['customer_id'] ?? 0),
                'device_id'                 => (int)(\$_POST['device_id'] ?? 0),
                'technician_id'             => !empty(\$_POST['technician_id']) ? (int)\$_POST['technician_id'] : null,
                'priority'                  => trim(\$_POST['priority'] ?? 'Medium'),
                'estimated_completion_date' => trim(\$_POST['estimated_completion_date'] ?? ''),
                'issue_description'         => trim(\$_POST['issue_description'] ?? '')
            ];

            if (empty(\$input['customer_id']) || empty(\$input['device_id']) || empty(\$input['issue_description'])) {
                \$errors[] = "Operation rejected: Direct customer, model identification asset, and reported fault are mandatory.";
            }

            if (empty(\$errors)) {
                try {
                    \$creatorId = \$_SESSION['user_id'];
                    \$ticketId = \$this->ticketModel->createTicket(\$input, \$creatorId);
                    \$this->redirect("/tickets/view?id=\${ticketId}", "Success: Repair service ticket opened securely under Ref #\${ticketId}!");
                } catch (Exception \$e) {
                    \$errors[] = "Database Transaction Interruption: " . \$e->getMessage();
                }
            }
        }

        // Gather clients and devices
        \$customers = \$this->customerModel->search('', 100, 0);
        \$devices = [];
        if (!empty(\$_GET['customer_id'])) {
            \$devices = \$this->deviceModel->getDevicesByCustomer((int)\$_GET['customer_id']);
        }

        \$technicians = \$this->customerModel->query("SELECT id, full_name FROM users WHERE role = 'Technician'")->fetchAll();

        \$this->render('tickets/create', [
            'errors'      => \$errors,
            'input'       => \$input,
            'customers'   => \$customers,
            'devices'     => \$devices,
            'technicians' => \$technicians,
            'page_title'  => "Initiate Repair Ticket"
        ]);
    }

    /**
     * Dispatches complete maintenance audits, timeline notes, logs, and billing.
     */
    public function view(): void {
        $this->requireAuth(['Admin', 'Receptionist', 'Technician', 'Customer']);

        \$ticketId = isset(\$_GET['id']) ? (int)\$_GET['id'] : 0;
        \$ticket = \$this->ticketModel->find(\$ticketId);

        if (!\$ticket) {
            \$this->redirect('/tickets', "Information Error: Specified service record matched index zero.");
        }

        // Authorization boundary checks for basic Client accounts
        if (\$_SESSION['user_role'] === 'Customer' && \$_SESSION['user_id'] !== \$ticket['customer_id']) {
            \$this->redirect('/dashboard', "Permission Interrupted: Security bounds prevent reading external data files.");
        }

        \$updates = \$this->ticketModel->getUpdates(\$ticketId);
        \$technicians = \$this->customerModel->query("SELECT id, full_name FROM users WHERE role = 'Technician'")->fetchAll();
        \$parts = \$this->customerModel->query("SELECT id, part_name, stock_quantity, unit_price FROM spare_parts")->fetchAll();

        \$this->render('tickets/view', [
            'ticket'      => \$ticket,
            'updates'     => \$updates,
            'technicians' => \$technicians,
            'parts'       => \$parts,
            'page_title'  => "Service Ticket Details — Ref #DB00" . \$ticketId
        ]);
    }

    /**
     * Processes re-assigning requests of device services to bench employees.
     */
    public function assign(): void {
        $this->requireAuth(['Admin', 'Receptionist']);

        if (\$_SERVER['REQUEST_METHOD'] === 'POST') {
            \$ticketId = (int)(\$_POST['ticket_id'] ?? 0);
            \$techId = !empty(\$_POST['technician_id']) ? (int)\$_POST['technician_id'] : null;

            try {
                \$this->ticketModel->assignTechnician(\$ticketId, \$techId, \$_SESSION['user_id']);
                \$this->redirect("/tickets/view?id=\${ticketId}", "Success: Bench technician assignment established.");
            } catch (Exception \$e) {
                \$this->redirect("/tickets/view?id=\${ticketId}", "Error: Persistent failure " . \$e->getMessage());
            }
        }
    }

    /**
     * Process updates of technicians bench notes or state transitions.
     */
    public function updateStatus(): void {
        $this->requireAuth(['Admin', 'Technician']);

        if (\$_SERVER['REQUEST_METHOD'] === 'POST') {
            \$ticketId = (int)(\$_POST['ticket_id'] ?? 0);
            \$status = trim(\$_POST['status'] ?? '');
            \$notes = trim(\$_POST['diagnostic_notes'] ?? '');

            \$ticket = \$this->ticketModel->find(\$ticketId);
            if (!\$ticket) {
                die("Access disrupted: Data row null.");
            }

            // Tech role can only adjust tickets designated directly to their name
            if (\$_SESSION['user_role'] === 'Technician' && \$ticket['technician_id'] !== \$_SESSION['user_id']) {
                \$this->redirect("/tickets/view?id=\${ticketId}", "Access Denied: Ticket is assigned to another technician.");
            }

            try {
                \$this->ticketModel->transitionStatus(\$ticketId, \$status, \$notes, \$_SESSION['user_id']);
                \$this->redirect("/tickets/view?id=\${ticketId}", "Success: System state transitioned securely to '\${status}'.");
            } catch (Exception \$e) {
                \$this->redirect("/tickets/view?id=\${ticketId}", "Error: Transition aborted " . \$e->getMessage());
            }
        }
    }

    /**
     * Records deduction of spare physical parts utilized during bench operations.
     */
    public function deductPart(): void {
        $this->requireAuth(['Admin', 'Technician']);

        if (\$_SERVER['REQUEST_METHOD'] === 'POST') {
            \$ticketId = (int)(\$_POST['ticket_id'] ?? 0);
            \$partId = (int)(\$_POST['part_id'] ?? 0);
            \$qty = (int)(\$_POST['quantity'] ?? 1);

            \$ticket = \$this->ticketModel->find(\$ticketId);
            if (\$_SESSION['user_role'] === 'Technician' && \$ticket['technician_id'] !== \$_SESSION['user_id']) {
                \$this->redirect("/tickets/view?id=\${ticketId}", "Permissions Error: Security bounds check failed.");
            }

            try {
                \$this->ticketModel->consumeSparePart(\$ticketId, \$partId, \$qty, \$_SESSION['user_id']);
                \$this->redirect("/tickets/view?id=\${ticketId}", "Success: Component consumed; safety counts adjusted.");
            } catch (Exception \$e) {
                \$this->redirect("/tickets/view?id=\${ticketId}", "Operational Block: " . \$e->getMessage());
            }
        }
    }
}
`,
  },
  ticketCreateView: {
    name: "create.php",
    path: "/app/views/tickets/create.php",
    language: "php",
    explanation: "Check-in service intake. Enables receptionist operators to validate customer credentials, pair hardware device types, define priority criteria, specify targeted completion dates, and log initially reported problem details.",
    code: `<?php 
/**
 * CRSTMS - Repair Ticket Intake View
 */
?>
<div class="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl text-left">
    <div class="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
            <h2 class="text-xl font-bold text-white font-display">New Repair service check-in</h2>
            <p class="text-xs text-slate-400">Validate hardware specifications, details, deadlines, and technician task allocations.</p>
        </div>
        <a href="/tickets" class="px-3 py-1.5 bg-slate-950 border border-slate-805 text-slate-300 hover:text-white rounded text-xs transition duration-150">&larr; Back to Listings</a>
    </div>

    <?php if (!empty(\$errors)): ?>
        <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3.5 my-4 text-xs text-red-400 font-medium">
            <strong class="block mb-1">Validation Failures:</strong>
            <ul class="list-disc pl-4 space-y-1">
                <?php foreach(\$errors as \$err): ?>
                    <li><?= h(\$err) ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>

    <form method="POST" action="/tickets/create" class="space-y-4 mt-4 text-xs">
        <input type="hidden" name="csrf_token" value="<?= \$_SESSION['csrf_token'] ?>" />

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
                <label class="text-slate-400 font-bold">Select Client customer *</label>
                <select name="customer_id" id="client_select" class="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-300" onchange="window.location.search = '?customer_id=' + this.value">
                    <option value="">-- Choose registered customer --</option>
                    <?php foreach (\$customers as \$c): ?>
                        <option value="<?= \$c['id'] ?>" <?= (\$input['customer_id'] ?? 0) === \$c['id'] ? 'selected' : '' ?>>
                            <?= h(\$c['full_name']) ?> (<?= h(\$c['email']) ?>)
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="space-y-1">
                <label class="text-slate-400 font-bold">Assigned Client Hardware Spec *</label>
                <select name="device_id" required class="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-300">
                    <option value="">-- Choose hardware device --</option>
                    <?php foreach (\$devices as \$d): ?>
                        <option value="<?= \$d['id'] ?>" <?= (\$input['device_id'] ?? 0) === \$d['id'] ? 'selected' : '' ?>>
                            <?= h(\$d['brand']) ?> <?= h(\$d['model']) ?> [SN: <?= h(\$d['serial_number']) ?>]
                        </option>
                    <?php endforeach; ?>
                </select>
                <?php if (empty(\$devices) && !empty(\$input['customer_id'])): ?>
                    <span class="text-amber-500 text-[10px] block mt-1 font-mono">No hardware linked. Register a device first!</span>
                <?php endif; ?>
            </div>

            <div class="space-y-1">
                <label class="text-slate-400 font-bold">Priority Level *</label>
                <select name="priority" required class="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-300 font-bold">
                    <option value="Low">Green Priority (Minor Faults)</option>
                    <option value="Medium" selected>Amber Priority (Average Queue)</option>
                    <option value="High">Red Priority (Immediate / Solder Diagnostic)</option>
                    <option value="Urgent">CRITICAL SLA (Business Crucial)</option>
                </select>
            </div>

            <div class="space-y-1">
                <label class="text-slate-400 font-bold">Estimated Handover / Target Completion</label>
                <input type="date" name="estimated_completion_date" class="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-300 font-mono" />
            </div>

            <div class="sm:col-span-2 space-y-1">
                <label class="text-slate-400 font-bold">Assigned Diagnostics bench Technician</label>
                <select name="technician_id" class="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-300">
                    <option value="">-- Keep in repair pool (Unassigned) --</option>
                    <?php foreach (\$technicians as \$t): ?>
                        <option value="<?= \$t['id'] ?>" <?= (\$input['technician_id'] ?? 0) === \$t['id'] ? 'selected' : '' ?>>
                            <?= h(\$t['full_name']) ?> — Specialized Bench Assessor
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="sm:col-span-2 space-y-1">
                <label class="text-slate-400 font-bold">Detailed Intake Symptoms & Fault Profile *</label>
                <textarea name="issue_description" required rows="4" placeholder="Case buckle, battery degrades, liquid exposure, solder diagnostics requested..." class="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-300 placeholder-slate-600 leading-relaxed"><?= h(\$input['issue_description'] ?? '') ?></textarea>
            </div>
        </div>

        <button type="submit" class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition duration-200 uppercase tracking-wider font-sans cursor-pointer text-center">
            Commit intake, spawn service tracking timeline
        </button>
    </form>
</div>
`,
  },
  ticketListView: {
    name: "index.php",
    path: "/app/views/tickets/index.php",
    language: "php",
    explanation: "Renders the list layout representing repair queues inside the company workspace database. Details search operations, filters, priority markers, color status indicators, and paginate structures.",
    code: `<?php 
/**
 * CRSTMS - Maintenance Tickets List view
 */
?>
<div class="space-y-6 text-left">
    <div class="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-3 gap-4">
        <div>
            <h2 class="text-xl font-bold text-white font-display">Service Tracking Directory</h2>
            <p class="text-xs text-slate-400">Search customer tickets, inspect assigned technicians, track queue priorities, and export audit sheets.</p>
        </div>
        <?php if (\$_SESSION['user_role'] !== 'Customer'): ?>
            <a href="/tickets/create" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition whitespace-nowrap">
                + intake hardware check-in
            </a>
        <?php endif; ?>
    </div>

    <!-- Filters -->
    <form method="GET" action="/tickets" class="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div class="space-y-1">
            <label class="text-slate-400 font-bold">Search Keywords</label>
            <input type="text" name="search" placeholder="Ref code, client, serial..." value="<?= h(\$filters['search']) ?>" class="w-full bg-slate-950 border border-slate-800 rounded p-2" />
        </div>

        <div class="space-y-1">
            <label class="text-slate-400 font-bold">Status Pipeline</label>
            <select name="status" class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300">
                <option value="">-- All Processes --</option>
                <option value="Created" <?= \$filters['status'] === 'Created' ? 'selected' : '' ?>>Created</option>
                <option value="Assigned" <?= \$filters['status'] === 'Assigned' ? 'selected' : '' ?>>Assigned</option>
                <option value="In Progress" <?= \$filters['status'] === 'In Progress' ? 'selected' : '' ?>>In Progress</option>
                <option value="Waiting for Spare Parts" <?= \$filters['status'] === 'Waiting for Spare Parts' ? 'selected' : '' ?>>Waiting for Spare Parts</option>
                <option value="Completed" <?= \$filters['status'] === 'Completed' ? 'selected' : '' ?>>Completed / Passed QA</option>
                <option value="Delivered" <?= \$filters['status'] === 'Delivered' ? 'selected' : '' ?>>Delivered</option>
                <option value="Closed" <?= \$filters['status'] === 'Closed' ? 'selected' : '' ?>>Closed</option>
            </select>
        </div>

        <div class="space-y-1">
            <label class="text-slate-400 font-bold">Priority Status</label>
            <select name="priority" class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-305">
                <option value="">-- All priorities --</option>
                <option value="Low" <?= \$filters['priority'] === 'Low' ? 'selected' : '' ?>>Minor Priority</option>
                <option value="Medium" <?= \$filters['priority'] === 'Medium' ? 'selected' : '' ?>>Average Priority</option>
                <option value="High" <?= \$filters['priority'] === 'High' ? 'selected' : '' ?>>High Priority</option>
                <option value="Urgent" <?= \$filters['priority'] === 'Urgent' ? 'selected' : '' ?>>CRITICAL SLA</option>
            </select>
        </div>

        <div class="flex items-end gap-1.5">
            <button type="submit" class="flex-1 py-2 bg-slate-950 border border-slate-800 hover:border-amber-500 rounded text-amber-500 hover:text-amber-400 font-bold font-sans transition whitespace-nowrap cursor-pointer text-center">
                Query DBMS
            </button>
            <a href="/tickets" class="px-3 py-2 bg-slate-950 border border-slate-800 text-slate-450 hover:text-white rounded font-sans cursor-pointer text-center whitespace-nowrap">
                Clear
            </a>
        </div>
    </form>

    <!-- Table -->
    <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 text-xs">
        <table class="w-full border-collapse">
            <thead>
                <tr class="bg-slate-905 border-b border-slate-800 text-slate-500 font-bold uppercase text-[9px] tracking-wider text-left">
                    <th class="py-3 px-4">Service REF ID</th>
                    <th class="py-3 px-4">Client Customer</th>
                    <th class="py-3 px-4">Hardware Specs</th>
                    <th class="py-3 px-4">Active Status</th>
                    <th class="py-3 px-4">Assignee</th>
                    <th class="py-3 px-4 text-right">Task Access</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/40">
                <?php if (empty(\$tickets)): ?>
                    <tr>
                        <td colSpan="6" class="py-6 text-center text-slate-550 italic">No repair cases logged matching querying metrics.</td>
                    </tr>
                <?php else: ?>
                    <?php foreach (\$tickets as \$t): ?>
                        <tr class="hover:bg-slate-950/20">
                            <td class="py-3.5 px-4 font-mono font-bold text-amber-505">#TRD<?= h(\$t['id']) ?></td>
                            <td class="py-3.5 px-4 font-medium text-slate-200"><?= h(\$t['customer_name']) ?></td>
                            <td class="py-3.5 px-4 text-slate-300">
                                <span class="font-bold"><?= h(\$t['device_brand']) ?></span> <?= h(\$t['device_model']) ?>
                            </td>
                            <td class="py-3.5 px-4">
                                <span class="inline-block px-2.5 py-0.5 rounded font-mono font-bold text-[9px] uppercase tracking-wide <?= 
                                    \$t['status'] === 'Completed' ? 'bg-[#0f2d24] text-teal-400 border border-teal-500/10' : 'bg-amber-500/10 text-amber-500 border border-amber-500/15'
                                ?>">
                                    <?= h(\$t['status']) ?>
                                </span>
                            </td>
                            <td class="py-3.5 px-4 text-slate-400">
                                <?= \$t['technician_name'] ? h(\$t['technician_name']) : '<em class="text-red-500/70">Unallocated POOL</em>' ?>
                            </td>
                            <td class="py-3.5 px-4 text-right">
                                <a href="/tickets/view?id=<?= \$t['id'] ?>" class="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-205 hover:text-amber-500 rounded font-semibold transition">
                                    Assess Case
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
`,
  },
  ticketDetailView: {
    name: "view.php",
    path: "/app/views/tickets/view.php",
    language: "php",
    explanation: "Main service tracking view. Embeds user profile credentials, hardware telemetry, problem descriptions, live updating feeds, assignee controls, and interactive spare parts billing subtraction selectors.",
    code: `<?php 
/**
 * CRSTMS - Service Ticket Detail & Workspace
 */
?>
<div class="space-y-6 text-left text-xs">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-slate-800 gap-4">
        <div>
            <h2 class="text-xl font-bold text-white font-display">Intake File: Ref #TRD<?= h(\$ticket['id']) ?></h2>
            <p class="text-xs text-slate-400 font-sans">Spawned: <?= date('d M Y H:i', strtotime(\$ticket['created_at'])) ?> | Last sync: <?= date('d M Y H:i', strtotime(\$ticket['updated_at'])) ?></p>
        </div>
        <a href="/tickets" class="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded text-xs">&larr; Queue Directory</a>
    </div>

    <!-- Details -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main details -->
        <div class="lg:col-span-2 space-y-4">
            <!-- Specs grid -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <h3 class="font-bold text-white uppercase text-[10px] tracking-wide border-b border-slate-800 pb-1">Client owner specifications</h3>
                    <p class="text-slate-303"><strong>Name:</strong> <?= h(\$ticket['customer_name']) ?></p>
                    <p class="text-slate-404"><strong>Email:</strong> <?= h(\$ticket['customer_email']) ?> | <strong>Phone:</strong> <?= h(\$ticket['customer_phone']) ?></p>
                </div>

                <div class="space-y-2">
                    <h3 class="font-bold text-white uppercase text-[10px] tracking-wide border-b border-slate-800 pb-1">Hardware specs</h3>
                    <p class="text-slate-202"><strong>Model:</strong> <?= h(\$ticket['device_brand']) ?> <?= h(\$ticket['device_model']) ?></p>
                    <p class="text-slate-405"><strong>Serial key:</strong> <code class="font-mono text-amber-500 bg-slate-950 px-1 py-0.5 rounded text-[10px]"><?= h(\$ticket['device_serial']) ?></code></p>
                </div>

                <div class="sm:col-span-2 p-3 bg-slate-950 rounded border border-slate-800">
                    <h4 class="font-bold text-white uppercase text-[9px] mb-1">Reported symptoms during intake check-in:</h4>
                    <p class="text-slate-305 italic leading-relaxed">&ldquo;<?= h(\$ticket['issue_description']) ?>&rdquo;</p>
                </div>
            </div>

            <!-- Diagnostics -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 class="font-bold text-white uppercase tracking-wider text-[10px]">Technical Assessment Logs Feed</h3>

                <?php if (empty(\$updates)): ?>
                    <p class="text-slate-505 italic">No diagnostic assessor notes posted yet. Diagnostic bench idle.</p>
                <?php else: ?>
                    <div class="space-y-3.5 pl-3 border-l-2 border-slate-800">
                        <?php foreach (\$updates as \$u): ?>
                            <div class="space-y-1 relative pl-3">
                                <span class="absolute w-2 h-2 rounded-full -left-[18px] top-1 bg-amber-500"></span>
                                <div class="flex justify-between text-[11px]">
                                    <strong class="text-slate-300"><?= h(\$u['technician_name']) ?> (Bench Assessor)</strong>
                                    <span class="font-mono text-slate-500"><?= date('d H:i', strtotime(\$u['created_at'])) ?></span>
                                </div>
                                <div class="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-amber-400 inline-block font-mono mb-1"><?= h(\$u['update_status']) ?></div>
                                <p class="text-slate-400 leading-normal bg-slate-950/20 p-2 border border-slate-800 rounded font-medium"><?= h(\$u['diagnostic_notes']) ?></p>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Forms -->
        <div class="space-y-4">
            <!-- Allocations form for Clerks / Admins -->
            <?php if (in_array(\$_SESSION['user_role'], ['Admin', 'Receptionist'])): ?>
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                    <h3 class="font-bold text-white uppercase text-[10px] tracking-wide">Bench Assignment Panel</h3>
                    <form method="POST" action="/tickets/assign" class="space-y-2.5">
                        <input type="hidden" name="ticket_id" value="<?= \$ticket['id'] ?>" />
                        <select name="technician_id" class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300">
                            <option value="">-- Release to Pool (Unassigned) --</option>
                            <?php foreach (\$technicians as \$tech): ?>
                                <option value="<?= \$tech['id'] ?>" <?= \$ticket['technician_id'] === \$tech['id'] ? 'selected' : '' ?>>
                                    <?= h(\$tech['full_name']) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <button type="submit" class="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded cursor-pointer transition text-center font-sans">
                            Confirm allocation
                        </button>
                    </form>
                </div>
            <?php endif; ?>

            <!-- Bench controls for Technician / Admin -->
            <?php if (in_array(\$_SESSION['user_role'], ['Admin', 'Technician'])): ?>
                <!-- Diagnostician Actions form -->
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                    <h3 class="font-bold text-white uppercase text-[10px] tracking-wide">ASSESSOR DIAGNOSTIC BOARD</h3>
                    <form method="POST" action="/tickets/update" class="space-y-2.5">
                        <input type="hidden" name="ticket_id" value="<?= \$ticket['id'] ?>" />
                        <div>
                            <label class="text-[10px] font-bold text-slate-450 block mb-1">State Transition</label>
                            <select name="status" class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300">
                                <option value="In Progress" <?= \$ticket['status'] === 'In Progress' ? 'selected' : '' ?>>In Progress / Diagnosing</option>
                                <option value="Waiting for Spare Parts" <?= \$ticket['status'] === 'Waiting for Spare Parts' ? 'selected' : '' ?>>Waiting for Spare Parts</option>
                                <option value="Completed" <?= \$ticket['status'] === 'Completed' ? 'selected' : '' ?>>Completed / Passed QA</option>
                                <option value="Delivered" <?= \$ticket['status'] === 'Delivered' ? 'selected' : '' ?>>Handovers / Delivered</option>
                                <option value="Closed" <?= \$ticket['status'] === 'Closed' ? 'selected' : '' ?>>Closed file</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-slate-450 block mb-1">Deducted notes of process details</label>
                            <textarea name="diagnostic_notes" rows="3" required placeholder="Cleaned thermal paste, verified dynamic rails, solder repair done..." class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 placeholder-slate-700"></textarea>
                        </div>
                        <button type="submit" class="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded cursor-pointer transition text-center font-sans shadow">
                            Save Diagnostics Feed entry
                        </button>
                    </form>
                </div>

                <!-- Part usage billing subtraction panel -->
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                    <h3 class="font-bold text-white uppercase text-[10px] tracking-wide">Record Workshop Material Usage</h3>
                    <form method="POST" action="/tickets/consume" class="grid grid-cols-3 gap-2 align-items-end">
                        <input type="hidden" name="ticket_id" value="<?= \$ticket['id'] ?>" />
                        <div class="col-span-2">
                            <label class="text-[10px] font-bold text-slate-450 block mb-1">Deducted spare part</label>
                            <select name="part_id" class="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200">
                                <?php foreach (\$parts as \$p): ?>
                                    <option value="<?= \$p['id'] ?>">
                                        <?= h(\$p['part_name']) ?> (<?= \$p['stock_quantity'] ?> left) — $<?= number_format(\$p['unit_price'], 2) ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-slate-450 block mb-1">Qty</label>
                            <input name="quantity" type="number" min="1" value="1" required class="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-200 font-mono text-center" />
                        </div>
                        <button type="submit" class="col-span-3 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-slate-950 border border-amber-500/15 font-bold rounded cursor-pointer transition text-center font-sans tracking-wide">
                            Consume Module Component
                        </button>
                    </form>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>
`,
  },
  sparePartModel: {
    name: "SparePart.php",
    path: "/app/models/SparePart.php",
    language: "php",
    explanation: "Models spare parts inventory database actions. Implements role-based safe adjustments, transactional audits, low stock alerting threshold rules, and search-based filtering catalogs.",
    code: `<?php
/**
 * CRSTMS - SparePart Model
 * Manages physical parts, reorder parameters, stock adjustments, and usage logs.
 */

namespace App\\Models;

use App\\Models\\BaseModel;
use Exception;
use PDO;

class SparePart extends BaseModel {

    /**
     * Retrieve a specific part details.
     */
    public function find(int $id): ?array {
        $sql = "SELECT * FROM spare_parts WHERE id = :id";
        $stmt = $this->query($sql, ['id' => $id]);
        $part = $stmt->fetch();
        return $part ? $part : null;
    }

    /**
     * Search part catalogue with category details, sorting, and offset pagination.
     */
    public function search(array $filters, int $limit = 10, int $offset = 0): array {
        $conditions = ["1=1"];
        $params = [];

        if (!empty($filters['search'])) {
            $conditions[] = "(part_name LIKE :search OR serial_number LIKE :serial)";
            $params['search'] = '%' . $filters['search'] . '%';
            $params['serial'] = '%' . $filters['search'] . '%';
        }

        if (isset($filters['low_stock']) && $filters['low_stock'] === true) {
            $conditions[] = "stock_quantity <= low_stock_threshold";
        }

        $whereClause = implode(" AND ", $conditions);
        $sql = "SELECT * FROM spare_parts 
                WHERE \${whereClause} 
                ORDER BY stock_quantity ASC, part_name ASC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    /**
     * Retrieve total counting to enable directory pagination calculations.
     */
    public function getCount(array $filters): int {
        $conditions = ["1=1"];
        $params = [];

        if (!empty($filters['search'])) {
            $conditions[] = "(part_name LIKE :search OR serial_number LIKE :serial)";
            $params['search'] = '%' . $filters['search'] . '%';
            $params['serial'] = '%' . $filters['search'] . '%';
        }

        if (isset($filters['low_stock']) && $filters['low_stock'] === true) {
            $conditions[] = "stock_quantity <= low_stock_threshold";
        }

        $whereClause = implode(" AND ", $conditions);
        $sql = "SELECT COUNT(*) FROM spare_parts WHERE \${whereClause}";
        $stmt = $this->query($sql, $params);
        return (int)$stmt->fetchColumn();
    }

    /**
     * Registers a brand-new component in the centralized catalog.
     */
    public function createPart(array $data, int $operatorId): int {
        $sql = "INSERT INTO spare_parts (part_name, serial_number, stock_quantity, unit_price, low_stock_threshold)
                VALUES (:name, :serial, :qty, :price, :threshold)";
        
        $params = [
            'name'      => $data['part_name'],
            'serial'    => $data['serial_number'],
            'qty'       => (int)($data['stock_quantity'] ?? 0),
            'price'     => (float)($data['unit_price'] ?? 0.00),
            'threshold' => (int)($data['low_stock_threshold'] ?? 5)
        ];

        $this->db->beginTransaction();
        try {
            $this->query($sql, $params);
            $partId = (int)$this->db->lastInsertId();

            if ($params['qty'] > 0) {
                $this->logMovement($partId, $operatorId, $params['qty'], 'Restock', "Initial warehouse intake registration");
            }

            $this->db->commit();
            return $partId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Updates an existing part file details.
     */
    public function updatePart(int $id, array $data, int $operatorId): void {
        $sql = "UPDATE spare_parts 
                SET part_name = :name, serial_number = :serial, unit_price = :price, low_stock_threshold = :threshold
                WHERE id = :id";
        
        $params = [
            'name'      => $data['part_name'],
            'serial'    => $data['serial_number'],
            'price'     => (float)$data['unit_price'],
            'threshold' => (int)$data['low_stock_threshold'],
            'id'        => $id
        ];

        $this->query($sql, $params);
    }

    /**
     * Adjusted current physical stock levels with logging traces.
     */
    public function adjustStock(int $partId, int $delta, string $reason, int $operatorId): void {
        $this->db->beginTransaction();
        try {
            // Pessimistic locking check
            $sqlCheck = "SELECT stock_quantity, part_name FROM spare_parts WHERE id = :id FOR UPDATE";
            $part = $this->query($sqlCheck, ['id' => $partId])->fetch();

            if (!$part) {
                throw new Exception("Specified spare part matched ID zero.");
            }

            $nextQty = $part['stock_quantity'] + $delta;
            if ($nextQty < 0) {
                throw new Exception("Stock depletion error: Action would reduce '\${part['part_name']}' below zero.");
            }

            $sqlUpdate = "UPDATE spare_parts SET stock_quantity = :qty WHERE id = :id";
            $this->query($sqlUpdate, ['qty' => $nextQty, 'id' => $partId]);

            $action = $delta > 0 ? 'Restock' : 'Manual Adjust';
            $this->logMovement($partId, $operatorId, $delta, $action, $reason);

            $this->db->commit();
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Purge catalogs or set inactive (for testing we soft-delete / remove)
     */
    public function deletePart(int $id): void {
        $this->query("DELETE FROM spare_parts WHERE id = :id", ['id' => $id]);
    }

    /**
     * Return movement ledger history.
     */
    public function getLogs(int $limit = 50): array {
        $sql = "SELECT il.*, sp.part_name, sp.serial_number, u.full_name AS operator_name 
                FROM inventory_logs il
                JOIN spare_parts sp ON il.part_id = sp.id
                JOIN users u ON il.user_id = u.id
                ORDER BY il.created_at DESC
                LIMIT :limit";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Internal movement logger.
     */
    private function logMovement(int $partId, int $userId, int $qty, string $actionType, string $notes): void {
        $sql = "INSERT INTO inventory_logs (part_id, user_id, quantity_changed, action_type, notes)
                VALUES (:part_id, :user_id, :qty, :action, :notes)";
        $this->query($sql, [
            'part_id' => $partId,
            'user_id' => $userId,
            'qty'     => $qty,
            'action'  => $actionType,
            'notes'   => $notes
        ]);
    }
}
`,
  },
  invoiceModel: {
    name: "Invoice.php",
    path: "/app/models/Invoice.php",
    language: "php",
    explanation: "Models billing invoices. Resolves cost accumulation calculations, processes tax configurations, registers payments, and links with related clients and devices.",
    code: `<?php
/**
 * CRSTMS - Invoice Model
 * Coordinates labor costs, material cost totals, VAT calculations, and billing reports.
 */

namespace App\\Models;

use App\\Models\\BaseModel;
use Exception;
use PDO;

class Invoice extends BaseModel {

    /**
     * Retrieve complete detailed payload for invoice files.
     */
    public function find(int $invoiceId): ?array {
        $sql = "SELECT i.*, rt.created_at AS ticket_created, rt.status AS ticket_status,
                       u_cust.full_name AS customer_name, c.email AS customer_email, u_cust.phone_number AS customer_phone, c.address AS customer_address,
                       d.brand AS device_brand, d.model AS device_model, d.serial_number AS device_serial, d.device_type,
                       u_tech.full_name AS technician_name
                FROM invoices i
                JOIN repair_tickets rt ON i.ticket_id = rt.id
                JOIN users u_cust ON rt.customer_id = u_cust.id
                JOIN customers c ON u_cust.id = c.user_id
                JOIN devices d ON rt.device_id = d.id
                LEFT JOIN users u_tech ON rt.technician_id = u_tech.id
                WHERE i.id = :id";
        
        $stmt = $this->query($sql, ['id' => $invoiceId]);
        $row = $stmt->fetch();
        return $row ? $row : null;
    }

    /**
     * Locates invoices referencing a ticket.
     */
    public function findByTicketId(int $ticketId): ?array {
        $sql = "SELECT id FROM invoices WHERE ticket_id = :ticket_id";
        $stmt = $this->query($sql, ['ticket_id' => $ticketId]);
        $row = $stmt->fetch();
        return $row ? $this->find((int)$row['id']) : null;
    }

    /**
     * Dynamic compile of aggregate material costs dynamically from ticket diagnostics updates.
     */
    public function calculateMaterialsCost(int $ticketId): float {
        // Query matching all consumed spare parts parsed during diagnostic update lines
        // For testing / compliance, we calculate the sum matching logs for that ticket
        $sql = "SELECT SUM(sp.unit_price * ABS(il.quantity_changed)) AS parts_total
                FROM inventory_logs il
                JOIN spare_parts sp ON il.part_id = sp.id
                WHERE il.notes LIKE :ticket_string";
        
        $stmt = $this->query($sql, ['ticket_string' => "%Ticket bench process #\${ticketId}%"]);
        $sum = $stmt->fetchColumn();
        return $sum ? (float)$sum : 0.00;
    }

    /**
     * Registers a new initialized static invoice in the database.
     */
    public function generateInvoice(int $ticketId, float $serviceCost, float $taxMultiplier): int {
        $this->db->beginTransaction();
        try {
            // Check if ticket exists
            $sqlTicket = "SELECT id, status FROM repair_tickets WHERE id = :id";
            $ticket = $this->query($sqlTicket, ['id' => $ticketId])->fetch();

            if (!$ticket) {
                throw new Exception("Operational halt: Hardware ticket matches index zero.");
            }

            // Calculate material cost
            $partsCost = $this->calculateMaterialsCost($ticketId);
            $total = ($serviceCost + $partsCost) * $taxMultiplier;

            // Inserts row (UPSERT if invoice already established for simple testing)
            $sqlCheck = "SELECT id FROM invoices WHERE ticket_id = :ticket_id";
            $exists = $this->query($sqlCheck, ['ticket_id' => $ticketId])->fetch();

            if ($exists) {
                $sqlInput = "UPDATE invoices 
                             SET service_cost = :service, spare_parts_cost = :parts, tax_multiplier = :tax, total_amount = :total, invoice_date = CURRENT_TIMESTAMP
                             WHERE ticket_id = :ticket_id";
                $this->query($sqlInput, [
                    'service'   => $serviceCost,
                    'parts'     => $partsCost,
                    'tax'       => $taxMultiplier,
                    'total'     => $total,
                    'ticket_id' => $ticketId
                ]);
                $invoiceId = (int)$exists['id'];
            } else {
                $sqlInput = "INSERT INTO invoices (ticket_id, service_cost, spare_parts_cost, tax_multiplier, total_amount, payment_status)
                             VALUES (:ticket_id, :service, :parts, :tax, :total, 'Unpaid')";
                $this->query($sqlInput, [
                    'ticket_id' => $ticketId,
                    'service'   => $serviceCost,
                    'parts'     => $partsCost,
                    'tax'       => $taxMultiplier,
                    'total'     => $total
                ]);
                $invoiceId = (int)$this->db->lastInsertId();
            }

            $this->db->commit();
            return $invoiceId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Mark paid / unpaid status. No online payment gateway connected.
     */
    public function updatePaymentStatus(int $invoiceId, string $status): void {
        if (!in_array($status, ['Paid', 'Unpaid'])) {
            throw new Exception("Safety Violation: Attempted to set corrupted payment parameters.");
        }
        $sql = "UPDATE invoices SET payment_status = :status WHERE id = :id";
        $this->query($sql, ['status' => $status, 'id' => $invoiceId]);
    }

    /**
     * Complete audits trail mapping invoices.
     */
    public function getHistory(array $filters = []): array {
        $conditions = ["1=1"];
        $params = [];

        if (!empty($filters['payment_status'])) {
            $conditions[] = "i.payment_status = :status";
            $params['status'] = $filters['payment_status'];
        }

        if (!empty($filters['customer_id'])) {
            $conditions[] = "rt.customer_id = :cust_id";
            $params['cust_id'] = (int)$filters['customer_id'];
        }

        $whereClause = implode(" AND ", $conditions);

        $sql = "SELECT i.*, u_cust.full_name AS customer_name, d.brand AS device_brand, d.model AS device_model 
                FROM invoices i
                JOIN repair_tickets rt ON i.ticket_id = rt.id
                JOIN users u_cust ON rt.customer_id = u_cust.id
                JOIN devices d ON rt.device_id = d.id
                WHERE \${whereClause}
                ORDER BY i.invoice_date DESC";
        
        return $this->query($sql, $params)->fetchAll();
    }
}
`,
  },
  inventoryController: {
    name: "InventoryController.php",
    path: "/app/controllers/InventoryController.php",
    language: "php",
    explanation: "Coordinates physical warehouse items. Facilitates register actions, threshold alerting monitors, stock replenishment, and tracing shrinkage histories.",
    code: `<?php
/**
 * CRSTMS - InventoryController
 * Controls physical warehouse buffers, safe levels, alerts, and histories.
 */

namespace App\\Controllers;

use App\\Models\\SparePart;
use Exception;

class InventoryController extends BaseController {

    private SparePart $inventoryModel;

    public function __construct() {
        $this->inventoryModel = new SparePart();
    }

    /**
     * Main dashboard displaying parts, stock counts, alerts, and log events.
     */
    public function index(): void {
        $this->requireAuth(['Admin', 'Receptionist', 'Technician']);

        $filters = [
            'search'    => \$_GET['search'] ?? '',
            'low_stock' => isset(\$_GET['low_stock'])
        ];

        \$parts = \$this->inventoryModel->search(\$filters, 100, 0);
        \$alertsCount = \$this->inventoryModel->getCount(['low_stock' => true]);
        \$logs = \$this->inventoryModel->getLogs(15);

        \$this->render('inventory/index', [
            'parts'       => \$parts,
            'filters'     => \$filters,
            'alertsCount' => \$alertsCount,
            'logs'        => \$logs,
            'page_title'  => "Workshop Inventory Control"
        ]);
    }

    /**
     * Action to register a brand new SKU into the workshop database.
     */
    public function create(): void {
        $this->requireAuth(['Admin']);

        \$errors = [];
        \$input = [];

        if (\$_SERVER['REQUEST_METHOD'] === 'POST') {
            \$token = \$_POST['csrf_token'] ?? '';
            if (\$token !== (\$_SESSION['csrf_token'] ?? '')) {
                die("CSRF Authenticity mismatch.");
            }

            \$input = [
                'part_name'           => trim(\$_POST['part_name'] ?? ''),
                'serial_number'       => trim(\$_POST['serial_number'] ?? ''),
                'stock_quantity'      => (int)(\$_POST['stock_quantity'] ?? 0),
                'unit_price'          => (float)(\$_POST['unit_price'] ?? 0.00),
                'low_stock_threshold' => (int)(\$_POST['low_stock_threshold'] ?? 5)
            ];

            if (empty(\$input['part_name']) || empty(\$input['serial_number'])) {
                \$errors[] = "Operation Rejected: Part catalog tag and manufacturer code are mandatory.";
            }
            if (\$input['unit_price'] <= 0) {
                \$errors[] = "Operation Rejected: Value cost must sit positive.";
            }

            if (empty(\$errors)) {
                try {
                    \$this->inventoryModel->createPart(\$input, \$_SESSION['user_id']);
                    \$this->redirect('/inventory', "Success: Part registered into workshop records successfully.");
                } catch (Exception \$e) {
                    \$errors[] = "Database insertion halt: " . \$e->getMessage();
                }
            }
        }

        \$this->render('inventory/add_part', [
            'errors'     => \$errors,
            'input'      => \$input,
            'page_title' => "Register New Catalog SKU"
        ]);
    }

    /**
     * Replenish or manually adjust quantity levels.
     */
    public function adjust(): void {
        $this->requireAuth(['Admin', 'Technician']);

        if (\$_SERVER['REQUEST_METHOD'] === 'POST') {
            \$partId = (int)(\$_POST['part_id'] ?? 0);
            \$qtyChange = (int)(\$_POST['quantity_changed'] ?? 0);
            \$reason = trim(\$_POST['reason'] ?? 'Manual stock level reconciliation');

            if (\$qtyChange === 0) {
                \$this->redirect('/inventory', "Error: Discrepancy delta matches zero. Adjustment skipped.");
            }

            try {
                \$this->inventoryModel->adjustStock(\$partId, \$qtyChange, \$reason, \$_SESSION['user_id']);
                \$this->redirect('/inventory', "Success: Warehouse stock counts updated successfully.");
            } catch (Exception \$e) {
                \$this->redirect('/inventory', "Operation Blocked: " . \$e->getMessage());
            }
        }
    }
}
`,
  },
  invoiceController: {
    name: "InvoiceController.php",
    path: "/app/controllers/InvoiceController.php",
    language: "php",
    explanation: "Coordinates billing operations. Gathers task diagnostic summaries, processes VAT calculations, and renders optimized printable receipts.",
    code: `<?php
/**
 * CRSTMS - InvoiceController
 * Facade managing cost models, generated invoices, offline cash states, and printable views.
 */

namespace App\\Controllers;

use App\\Models\\Invoice;
use App\\Models\\RepairTicket;
use Exception;

class InvoiceController extends BaseController {

    private Invoice \$invoiceModel;
    private RepairTicket \$ticketModel;

    public function __construct() {
        \$this->invoiceModel = new Invoice();
        \$this->ticketModel = new RepairTicket();
    }

    /**
     * Directory lists of all generated invoices.
     */
    public function index(): void {
        $this->requireAuth(['Admin', 'Receptionist', 'Customer']);

        \$filters = [];
        if (\$_SESSION['user_role'] === 'Customer') {
            \$filters['customer_id'] = \$_SESSION['user_id'];
        } else {
            \$filters['payment_status'] = \$_GET['payment_status'] ?? '';
        }

        \$invoices = \$this->invoiceModel->getHistory(\$filters);

        \$this->render('invoices/index', [
            'invoices'   => \$invoices,
            'filters'    => \$filters,
            'page_title' => "Billing Logs & Statements"
        ]);
    }

    /**
     * Spawns / regenerates invoice from completed ticket details.
     */
    public function generate(): void {
        $this->requireAuth(['Admin', 'Receptionist']);

        if (\$_SERVER['REQUEST_METHOD'] === 'POST') {
            \$ticketId = (int)(\$_POST['ticket_id'] ?? 0);
            \$serviceCost = (float)(\$_POST['service_cost'] ?? 0.00);
            \$taxMultiplier = 1.15; // 15% Standard VAT

            try {
                \$invoiceId = \$this->invoiceModel->generateInvoice(\$ticketId, \$serviceCost, \$taxMultiplier);
                \$this->redirect("/invoices/view?id=\${invoiceId}", "Success: Invoice generated cleanly. Tracking index updated.");
            } catch (Exception \$e) {
                \$this->redirect("/tickets/view?id=\${ticketId}", "Error generating statement: " . \$e->getMessage());
            }
        }
    }

    /**
     * Printable layout view of a single invoice file.
     */
    public function view(): void {
        $this->requireAuth(['Admin', 'Receptionist', 'Customer']);

        \$invoiceId = isset(\$_GET['id']) ? (int)\$_GET['id'] : 0;
        \$invoice = \$this->invoiceModel->find(\$invoiceId);

        if (!\$invoice) {
            \$this->redirect('/invoices', "Information Error: Specified invoice row matched index null.");
        }

        // Customer scope limits
        if (\$_SESSION['user_role'] === 'Customer' && \$_SESSION['user_id'] !== \$invoice['customer_id']) {
            \$this->redirect('/dashboard', "Permission Interrupted: Security bounds prevent reading external billing files.");
        }

        \$this->render('invoices/view', [
            'invoice'    => \$invoice,
            'page_title' => "Invoice Receipt — REF-ID: #INV" . \$invoiceId
        ]);
    }

    /**
     * Adjust payment parameters of invoices. Offline settlements only.
     */
    public function markPaid(): void {
        $this->requireAuth(['Admin', 'Receptionist']);

        if (\$_SERVER['REQUEST_METHOD'] === 'POST') {
            \$invoiceId = (int)(\$_POST['invoice_id'] ?? 0);
            \$status = \$_POST['payment_status'] ?? 'Paid';

            try {
                \$this->invoiceModel->updatePaymentStatus(\$invoiceId, \$status);
                \$this->redirect("/invoices/view?id=\${invoiceId}", "Success: Settlement status registered as '\${status}'.");
            } catch (Exception \$e) {
                \$this->redirect("/invoices", "Error adjusting parameter: " . \$e->getMessage());
            }
        }
    }
}
`,
  },
  inventoryIndexView: {
    name: "index.php",
    path: "/app/views/inventory/index.php",
    language: "php",
    explanation: "Displays catalog list representing physical hardware items stored inside the company workspace. Cues alarm indicators and adjusts volumes.",
    code: `<?php 
/**
 * CRSTMS - Inventory Control index
 */
?>
<div class="space-y-6 text-left">
    <div class="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-3 gap-4">
        <div>
            <h2 class="text-xl font-bold text-white font-display">Workshop Material Stock Catalog</h2>
            <p class="text-xs text-slate-400">Restock replacement parts, track safety bounds, prevent negative inventory margins, and view audit events.</p>
        </div>
        <?php if (\$_SESSION['user_role'] === 'Admin'): ?>
            <a href="/inventory/create" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition whitespace-nowrap">
                + Add Spare SKU
            </a>
        <?php endif; ?>
    </div>

    <!-- Alarm banners -->
    <?php if (\$alertsCount > 0): ?>
        <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400">
            <strong class="block mb-1.5 font-bold tracking-wide uppercase font-sans flex items-center gap-1.5">⚠️ SAFETY MONITOR: LOW PARTS IN WORKSPACE!</strong>
            <span>There are currently <?= \$alertsCount ?> items under critical stock replenishment levels. Immediate material restock orders are recommended.</span>
        </div>
    <?php endif; ?>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Stock items list -->
        <div class="lg:col-span-2 space-y-4">
            <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 text-xs">
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="bg-slate-955 border-b border-slate-800 text-slate-500 font-bold uppercase text-[9px] tracking-wider text-left">
                            <th class="py-3 px-4">SKU / Item Details</th>
                            <th class="py-3 px-4 text-center">Remaining Stock</th>
                            <th class="py-3 px-4 text-right">Cost Value</th>
                            <?php if (in_array(\$_SESSION['user_role'], ['Admin', 'Technician'])): ?>
                                <th class="py-3 px-4 text-right">Adjust Counts</th>
                            <?php endif; ?>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/40">
                        <?php if (empty(\$parts)): ?>
                            <tr>
                                <td colSpan="4" class="py-6 text-center text-slate-500 italic">No spare materials found matching catalogue records.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach (\$parts as \$p): ?>
                                <tr class="hover:bg-slate-950/20">
                                    <td class="py-3 px-4">
                                        <div class="font-bold text-slate-200"><?= h(\$p['part_name']) ?></div>
                                        <div class="font-mono text-[10px] text-slate-500"><?= h(\$p['serial_number']) ?></div>
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        <span class="inline-block px-2.5 py-0.5 rounded font-mono font-bold text-[9px] uppercase tracking-wide <?= 
                                            \$p['stock_quantity'] <= \$p['low_stock_threshold'] ? 'bg-red-500/10 text-red-400 border border-red-500/15' : 'bg-[#0f2d24] text-teal-400 border border-teal-500/15'
                                        ?>">
                                            <?= \$p['stock_quantity'] ?> Units remaining
                                        </span>
                                    </td>
                                    <td class="py-3 px-4 text-right font-mono text-slate-300 font-bold">$<?= number_format(\$p['unit_price'], 2) ?></td>
                                    
                                    <?php if (in_array(\$_SESSION['user_role'], ['Admin', 'Technician'])): ?>
                                        <td class="py-3 px-4 text-right">
                                            <form method="POST" action="/inventory/adjust" class="flex items-center justify-end gap-1.5">
                                                <input type="hidden" name="part_id" value="<?= \$p['id'] ?>" />
                                                <input type="number" name="quantity_changed" min="-50" max="100" placeholder="±Qty" required class="w-14 bg-slate-950 border border-slate-800 rounded p-1 text-center font-mono text-slate-200" />
                                                <button type="submit" class="p-1 px-2.5 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 border border-slate-800 rounded text-[10px] font-bold transition">Confirm</button>
                                            </form>
                                        </td>
                                    <?php endif; ?>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- System ledger history -->
        <div class="space-y-4">
            <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3.5">
                <h3 class="font-bold text-white uppercase tracking-wider text-[10px]">Material Adjustment Ledger</h3>
                <div class="space-y-3 pl-3 border-l border-slate-800 max-h-[420px] overflow-y-auto">
                    <?php if (empty(\$logs)): ?>
                        <p class="text-slate-500 italic text-[11px] py-2">No database material logs created yet.</p>
                    <?php else: ?>
                        <?php foreach (\$logs as \$l): ?>
                            <div class="space-y-1 relative pl-3.5 text-[10px]">
                                <span class="absolute w-1.5 h-1.5 rounded-full -left-[19.5px] top-1 <?= \$l['quantity_changed'] >= 0 ? 'bg-teal-500' : 'bg-red-400' ?>"></span>
                                <div class="flex justify-between">
                                    <strong class="text-slate-300"><?= h(\$l['part_name']) ?></strong>
                                    <span class="font-mono text-slate-500"><?= date('d M', strtotime(\$l['created_at'])) ?></span>
                                </div>
                                <div class="text-slate-400">
                                    Change: <strong class="<?= \$l['quantity_changed'] >= 0 ? 'text-teal-400' : 'text-red-400' ?>"><?= \$l['quantity_changed'] > 0 ? '+' : '' ?><?= \$l['quantity_changed'] ?> Units</strong> 
                                    (<?= h(\$l['action_type']) ?>)
                                </div>
                                <p class="text-slate-500 italic leading-snug">Context: <?= h(\$l['notes']) ?> — by <?= h(\$l['operator_name']) ?></p>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>
`,
  },
  inventoryAddPartView: {
    name: "add_part.php",
    path: "/app/views/inventory/add_part.php",
    language: "php",
    explanation: "Renders spare part registration form UI template.",
    code: `<?php 
/**
 * CRSTMS - Register Spare Part SKU View
 */
?>
<div class="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl text-left text-xs">
    <div class="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
            <h2 class="text-xl font-bold text-white font-display">Register Material SKU</h2>
            <p class="text-[11px] text-slate-400">Add physical inventory modules into the general computer repairs catalog database.</p>
        </div>
        <a href="/inventory" class="px-2.5 py-1.5 bg-slate-950 border border-slate-805 text-slate-300 hover:text-white rounded text-[11px]">&larr; Catalog Listings</a>
    </div>

    <?php if (!empty(\$errors)): ?>
        <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3 my-4 text-red-400">
            <strong>Errors occurred:</strong>
            <ul class="list-disc pl-4 mt-1">
                <?php foreach (\$errors as \$err): ?>
                    <li><?= h(\$err) ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>

    <form method="POST" action="/inventory/create" class="space-y-4 mt-4">
        <input type="hidden" name="csrf_token" value="<?= \$_SESSION['csrf_token'] ?>" />

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
                <label class="text-slate-400 font-bold block">Part Name / Title *</label>
                <input type="text" name="part_name" required placeholder="Kingston 16GB RAM module" class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
            </div>

            <div class="space-y-1">
                <label class="text-slate-400 font-bold block">Manufacturer Serial Code *</label>
                <input type="text" name="serial_number" required placeholder="KGN-DDR4-16G-M" class="w-full bg-slate-950 border border-slate-805 rounded p-2 text-slate-200 font-mono" />
            </div>

            <div class="space-y-1">
                <label class="text-slate-400 font-bold block">Initial Received Quantity</label>
                <input type="number" name="stock_quantity" min="0" value="10" class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono" />
            </div>

            <div class="space-y-1">
                <label class="text-slate-400 font-bold block">Unit Billing Cost ($) *</label>
                <input type="number" name="unit_price" step="0.01" min="0.01" value="45.00" class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono" />
            </div>

            <div class="col-span-2 space-y-1">
                <label class="text-slate-400 font-bold block">Safety Reorder Warning Threshold Level *</label>
                <input type="number" name="low_stock_threshold" min="1" value="5" class="w-full bg-slate-950 border border-slate-808 rounded p-2 text-slate-200 font-mono" />
                <span class="text-[10px] text-slate-500">Automated alarm alerts light up standard administrative headers if quantities sink to this volume.</span>
            </div>
        </div>

        <button type="submit" class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-905 font-bold rounded-lg transition uppercase tracking-wider font-sans cursor-pointer text-center">
            Register Material SKU
        </button>
    </form>
</div>
`,
  },
  invoiceIndexView: {
    name: "index.php",
    path: "/app/views/invoices/index.php",
    language: "php",
    explanation: "Lists available total invoices dynamically generated underneath completed diagnostics tickets.",
    code: `<?php
/**
 * CRSTMS - Invoice History index
 */
?>
<div class="space-y-6 text-left text-xs">
    <div class="border-b border-slate-800 pb-3">
        <h2 class="text-xl font-bold text-white font-display">Generated Billing Ledger</h2>
        <p class="text-slate-404">View registered invoice copies, check offline settlement logs, and generate printable invoice templates.</p>
    </div>

    <!-- Listings -->
    <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 text-xs text-left">
        <table class="w-full border-collapse">
            <thead>
                <tr class="bg-slate-958 border-b border-slate-800 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                    <th class="py-3 px-4">Invoice ID</th>
                    <th class="py-3 px-4">Completed Ticket ID</th>
                    <th class="py-3 px-4">Client User</th>
                    <th class="py-3 px-4 text-right">Sum Subtotals</th>
                    <th class="py-3 px-4 text-center">Settlement</th>
                    <th class="py-3 px-4 text-right">Receipt File</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/40">
                <?php if (empty(\$invoices)): ?>
                    <tr>
                        <td colSpan="6" class="py-8 text-center text-slate-550 italic">No invoicing statements created yet.</td>
                    </tr>
                <?php else: ?>
                    <?php foreach (\$invoices as \$inv): ?>
                        <tr class="hover:bg-slate-950/20">
                            <td class="py-3.5 px-4 font-mono font-bold text-slate-202">#INV-<?= h(\$inv['id']) ?></td>
                            <td class="py-3.5 px-4 font-mono text-amber-500 font-semibold">#TRD<?= h(\$inv['ticket_id']) ?></td>
                            <td class="py-3.5 px-4 font-semibold text-slate-300"><?= h(\$inv['customer_name']) ?></td>
                            <td class="py-3.5 px-4 text-right font-mono text-white font-bold">$<?= number_format(\$inv['total_amount'], 2) ?></td>
                            <td class="py-3.5 px-4 text-center">
                                <span class="inline-block px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase tracking-wide <?= 
                                    \$inv['payment_status'] === 'Paid' ? 'bg-[#0f2d24] text-teal-400 border border-teal-500/15' : 'bg-red-500/10 text-red-400 border border-red-500/10'
                                ?>">
                                    <?= h(\$inv['payment_status']) ?>
                                </span>
                            </td>
                            <td class="py-3.5 px-4 text-right">
                                <a href="/invoices/view?id=<?= \$inv['id'] ?>" class="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-304 hover:text-amber-500 rounded transition font-bold">
                                    Display Invoice
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
`,
  },
  invoiceDetailView: {
    name: "view.php",
    path: "/app/views/invoices/view.php",
    language: "php",
    explanation: "Printable receipt copy detailing diagnostics service cost, materials sum subtotal, VAT tax multiplier addition, and offline cash status update board.",
    code: `<?php
/**
 * CRSTMS - Printable Receipt View
 */
?>
<div class="space-y-6 text-left text-xs max-w-3xl mx-auto">
    <!-- Header Controls -->
    <div class="flex justify-between items-center pb-3 border-b border-slate-800 print:hidden">
        <a href="/invoices" class="px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded">&larr; Invoices Ledger</a>
        <button onclick="window.print()" class="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded flex items-center gap-1.5 transition cursor-pointer font-sans">
            🖨️ Print Statement Receipt
        </button>
    </div>

    <!-- Printable Invoice Sheet Area -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 print:bg-white print:text-black print:border-none">
        
        <!-- Header Info -->
        <div class="flex flex-col sm:flex-row justify-between pb-6 border-b border-slate-800/80 print:border-black gap-4">
            <div class="space-y-1.5">
                <h1 class="text-2xl font-bold font-mono tracking-wider text-amber-500 print:text-amber-605">CRSTMS LTD</h1>
                <p class="text-[10px] text-slate-400 font-medium font-sans print:text-black">100 MicroTech Boulevard, Laboratory Bench B-1</p>
                <p class="text-[10px] text-slate-505 print:text-black">Intranet Support Point: tech-labs@crstms.service.mobi</p>
            </div>
            <div class="sm:text-right space-y-1">
                <span class="inline-block px-3 py-1 font-mono font-bold uppercase rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 print:bg-white print:text-black print:border-black">
                    INVOICE FILE
                </span>
                <div class="text-[11px] font-bold text-slate-202 pt-1">No. INV-<?= h(\$invoice['id']) ?></div>
                <div class="text-[10px] text-slate-500 font-mono">Finalized: <?= date('d M Y H:i', strtotime(\$invoice['invoice_date'])) ?></div>
            </div>
        </div>

        <!-- Addresses meta -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-800/80 print:border-black text-[11px]">
            <div class="space-y-1.5">
                <h3 class="font-bold text-white uppercase text-[10px] tracking-wide print:text-black">DELIVERY / DEBTOR SOURCE:</h3>
                <p class="font-semibold text-slate-300 print:text-black">Debtor Name: <?= h(\$invoice['customer_name']) ?></p>
                <p class="text-slate-400 print:text-black">Email Link: <?= h(\$invoice['customer_email']) ?></p>
                <p class="text-slate-400 print:text-black">Mobile Callback: <?= h(\$invoice['customer_phone']) ?></p>
                <p class="text-slate-404 print:text-black">Shipping Coordinate: <?= h(\$invoice['customer_address']) ?></p>
            </div>
            <div class="space-y-1.5">
                <h3 class="font-bold text-white uppercase text-[10px] tracking-wide print:text-black">HARDWARE SPECIFICATION LOGS:</h3>
                <p class="font-semibold text-slate-300 print:text-black">Hardware Model: <?= h(\$invoice['device_brand']) ?> <?= h(\$invoice['device_model']) ?></p>
                <p class="text-slate-400 print:text-black">Physical Class: <?= h(\$invoice['device_type']) ?></p>
                <p class="text-[10px] text-slate-450 print:text-black">Manufacturer Serial: <code class="font-mono bg-slate-950 px-1 py-0.5 rounded text-amber-500 print:bg-white print:text-black print:border-black"><?= h(\$invoice['device_serial']) ?></code></p>
                <p class="text-slate-500 print:text-black">Assigned bench engineer: <?= \$invoice['technician_name'] ? h(\$invoice['technician_name']) : 'Centralized Pool' ?></p>
            </div>
        </div>

        <!-- Ledger breakdowns -->
        <div class="space-y-2 text-[11px]">
            <h3 class="font-bold text-white uppercase text-[10px] tracking-wide print:text-black">BILLABLE WORKSHOP SUBITEMS STATEMENT:</h3>
            <div class="border border-slate-800 rounded-lg overflow-hidden print:border-black">
                <div class="grid grid-cols-4 bg-slate-950 p-2.5 font-bold text-slate-400 border-b border-slate-800 print:bg-white print:text-black print:border-black text-[10px]">
                    <div class="col-span-2">Item / Diagnostic Bench Activity Description</div>
                    <div class="text-center">Tax / Multiplier Category</div>
                    <div class="text-right">Unification Total Fees</div>
                </div>
                <div class="divide-y divide-slate-800/50 print:divide-black">
                    <!-- Service/Labor fee row -->
                    <div class="grid grid-cols-4 p-3 hover:bg-slate-950/10 text-slate-350 print:text-black">
                        <div class="col-span-2">
                            <strong class="text-slate-200 print:text-black text-xs block">Assessor Lab Diagnostic Fee</strong>
                            <span class="text-[10px] text-slate-500 print:text-black">Solder tests, thermal paste replenishment, firmware diagnostic checking.</span>
                        </div>
                        <div class="text-center font-mono text-slate-400 self-center print:text-black">15.00% VAT</div>
                        <div class="text-right font-mono text-slate-300 font-bold self-center print:text-black">$<?= number_format(\$invoice['service_cost'], 2) ?></div>
                    </div>
                    <!-- Materials component total cost row -->
                    <div class="grid grid-cols-4 p-3 hover:bg-slate-950/10 text-slate-350 print:text-black">
                        <div class="col-span-2">
                            <strong class="text-slate-200 print:text-black text-xs block">Replaced Physical Spare Materials Total</strong>
                            <span class="text-[10px] text-slate-500 print:text-black">Calculated dynamically matching inventory logs for Ticket #<?= \$invoice['ticket_id'] ?>.</span>
                        </div>
                        <div class="text-center font-mono text-slate-400 self-center print:text-black">15.00% VAT</div>
                        <div class="text-right font-mono text-slate-300 font-bold self-center print:text-black">$<?= number_format(\$invoice['spare_parts_cost'], 2) ?></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Totals panel -->
        <div class="flex justify-end pt-4">
            <div class="w-72 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 print:bg-white print:text-black print:border-black text-[11px]">
                <div class="flex justify-between text-slate-400 print:text-black">
                    <span>Labor Subtotal:</span>
                    <span class="font-mono text-slate-300 print:text-black">$<?= number_format(\$invoice['service_cost'], 2) ?></span>
                </div>
                <div class="flex justify-between text-slate-400 print:text-black pb-2 border-b border-slate-800/80 print:border-black">
                    <span>Materials Subtotal:</span>
                    <span class="font-mono text-slate-300 print:text-black">$<?= number_format(\$invoice['spare_parts_cost'], 2) ?></span>
                </div>
                <div class="flex justify-between text-slate-400 print:text-black">
                    <span>Applicable VAT Taxes (15.00%):</span>
                    <span class="font-mono text-slate-300 print:text-black">
                        $<?= number_format((\$invoice['service_cost'] + \$invoice['spare_parts_cost']) * 0.15, 2) ?>
                    </span>
                </div>
                <div class="flex justify-between font-bold text-white text-sm pt-2 border-t border-slate-850/80 print:text-black print:border-black">
                    <span>Total Settled cost:</span>
                    <span class="font-mono text-amber-400 print:text-black">$<?= number_format(\$invoice['total_amount'], 2) ?></span>
                </div>
            </div>
        </div>

        <!-- Settlement registration controls for Operators / Admins -->
        <?php if (in_array(\$_SESSION['user_role'], ['Admin', 'Receptionist']) && \$invoice['payment_status'] === 'Unpaid'): ?>
            <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row justify-between items-center text-xs gap-4 print:hidden">
                <div class="space-y-0.5">
                    <strong class="text-amber-500 block">Pending Register Offline Settlement</strong>
                    <span class="text-slate-500">Record cash / bank transfer settlements of this hardware repair ticket task invoice.</span>
                </div>
                <form method="POST" action="/invoices/paid" class="flex gap-2">
                    <input type="hidden" name="invoice_id" value="<?= \$invoice['id'] ?>" />
                    <input type="hidden" name="payment_status" value="Paid" />
                    <button type="submit" class="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold font-sans rounded transition tracking-wide cursor-pointer text-center">
                        Confirm Offline Cash Received
                    </button>
                </form>
            </div>
        <?php endif; ?>
    </div>
</div>
`,
  },
  deliveryModel: {
    name: "Delivery.php",
    path: "/app/models/Delivery.php",
    language: "php",
    explanation: "Represents the active deliveries logistics mapper. Enforces relational schema, tracks delivery-roles, transitions through standard lifecycle states ('Pending' -> 'Assigned' -> 'Picked Up' -> 'In Transit' -> 'Delivered' -> 'Confirmed'), and logs handovers via SystemLog.",
    code: `<?php
/**
 * CRSTMS - Delivery Model (OOP PHP Layout)
 */

namespace App\\Models;

use Config\\Database;
use App\\Models\\SystemLog;
use PDO;

class Delivery extends BaseModel {
    private int $id;
    private int $ticket_id;
    private int $customer_id;
    private int $device_id;
    private ?int $delivery_personnel_id;
    private ?string $pickup_date;
    private ?string $delivery_date;
    private string $status; // 'Pending', 'Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Confirmed'
    private ?string $notes;

    /**
     * Create delivery record for a completed repair ticket
     */
    public static function create(int $ticketId, int $customerId, int $deviceId, ?string $notes = null): bool {
        $db = Database::getConnection();
        
        // Enforce data integrity
        $stmt = $db->prepare("
            INSERT INTO deliveries (ticket_id, customer_id, device_id, status, notes)
            VALUES (?, ?, ?, 'Pending', ?)
        ");
        
        $result = $stmt->execute([$ticketId, $customerId, $deviceId, $notes]);
        if ($result) {
            $deliveryId = $db->lastInsertId();
            SystemLog::log(
                "CREATE_DELIVERY", 
                "Deliveries", 
                (string)$deliveryId, 
                "Delivery order scheduled automatically for Ticket #{$ticketId}", 
                \$_SESSION['user_id'] ?? null
            );
            return true;
        }
        return false;
    }

    /**
     * Assign delivery personnel driver
     */
    public static function assign(int $deliveryId, int $personnelId): bool {
        $db = Database::getConnection();
        
        // Enforce driver verification
        $stmt = $db->prepare("
            UPDATE deliveries 
            SET delivery_personnel_id = ?, status = 'Assigned', pickup_date = NULL, delivery_date = NULL 
            WHERE id = ?
        ");
        
        $result = $stmt->execute([$personnelId, $deliveryId]);
        if ($result) {
            SystemLog::log(
                "ASSIGN_DELIVERY", 
                "Deliveries", 
                (string)$deliveryId, 
                "Assembled delivery coordinator personnel #{$personnelId} to order.", 
                \$_SESSION['user_id'] ?? null
            );
            return true;
        }
        return false;
    }

    /**
     * Update delivery progress and log handovers
     */
    public static function updateStatus(int $deliveryId, string $status, ?string $notes = null): bool {
        $db = Database::getConnection();
        
        $allowedStatuses = ['Pending', 'Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Confirmed'];
        if (!in_array($status, $allowedStatuses)) {
            return false;
        }

        $pickupField = "";
        $deliveryField = "";
        $params = [];

        if ($status === 'Picked Up') {
            $pickupField = ", pickup_date = CURRENT_TIMESTAMP";
        } elseif ($status === 'Delivered') {
            $deliveryField = ", delivery_date = CURRENT_TIMESTAMP";
        }

        $sql = "UPDATE deliveries SET status = ? {$pickupField} {$deliveryField}";
        $params[] = $status;

        if ($notes !== null) {
            $sql .= ", notes = ?";
            $params[] = $notes;
        }

        $sql .= " WHERE id = ?";
        $params[] = $deliveryId;

        $stmt = $db->prepare($sql);
        $result = $stmt->execute($params);

        if ($result) {
            // Log update
            SystemLog::log(
                "UPDATE_DELIVERY_STATUS", 
                "Deliveries", 
                (string)$deliveryId, 
                "Delivery status updated to '{$status}'. Notes: {$notes}", 
                \$_SESSION['user_id'] ?? null
            );
            return true;
        }
        return false;
    }

    /**
     * Fetch filtered delivery ledger records
     */
    public static function getDeliveries(array $filters = []): array {
        $db = Database::getConnection();
        
        $sql = "
            SELECT d.*, 
                   t.status as ticket_status,
                   u_driver.full_name as driver_name,
                   u_cust.full_name as customer_name,
                   cust.address as customer_address, 
                   cust.email as customer_email,
                   dev.brand as device_brand,
                   dev.model as device_model,
                   dev.device_type
            FROM deliveries d
            JOIN repair_tickets t ON d.ticket_id = t.id
            JOIN users u_cust ON d.customer_id = u_cust.id
            JOIN customers cust ON u_cust.id = cust.user_id
            JOIN devices dev ON d.device_id = dev.id
            LEFT JOIN users u_driver ON d.delivery_personnel_id = u_driver.id
            WHERE 1=1
        ";
        
        $params = [];

        if (!empty($filters['status'])) {
            $sql .= " AND d.status = ?";
            $params[] = $filters['status'];
        }

        if (!empty($filters['driver_id'])) {
            $sql .= " AND d.delivery_personnel_id = ?";
            $params[] = $filters['driver_id'];
        }

        if (!empty($filters['customer_id'])) {
            $sql .= " AND d.customer_id = ?";
            $params[] = $filters['customer_id'];
        }

        if (!empty($filters['search'])) {
            $sql .= " AND (u_cust.full_name LIKE ? OR dev.brand LIKE ? OR dev.model LIKE ?)";
            $searchTerm = "%" . $filters['search'] . "%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $sql .= " ORDER BY d.created_at DESC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
`
  },
  deliveryController: {
    name: "DeliveryController.php",
    path: "/app/controllers/DeliveryController.php",
    language: "php",
    explanation: "Handles routes relating to delivery allocations, status updates, and pickup logs, verifying that only authorized personas manage administrative status updates.",
    code: `<?php
/**
 * CRSTMS - Delivery Controller
 */

namespace App\\Controllers;

use App\\Models\\Delivery;
use App\\Models\\User;

class DeliveryController extends BaseController {
    
    /**
     * Renders logistics dashboard
     */
    public function index(): void {
        $this->requireAuth(['Admin', 'Receptionist', 'Delivery']);
        
        $filters = [
            'status' => $_GET['status'] ?? null,
            'driver_id' => $_GET['driver_id'] ?? null,
            'search' => $_GET['search'] ?? null
        ];

        // If active user is driving personnel, force-link context to self
        if (\$_SESSION['user_role'] === 'Delivery') {
            $filters['driver_id'] = \$_SESSION['user_id'];
        }

        $deliveries = Delivery::getDeliveries($filters);
        
        // Retrieve valid delivery runners for assignments
        $db = \\Config\\Database::getConnection();
        $driversQuery = $db->query("SELECT id, full_name FROM users WHERE role = 'Delivery' ORDER BY full_name ASC");
        $drivers = $driversQuery->fetchAll(\\PDO::FETCH_ASSOC);

        $this->render("deliveries/index", [
            'deliveries' => $deliveries,
            'drivers' => $drivers,
            'filters' => $filters
        ]);
    }

    /**
     * Dispatch driver assignment form posts
     */
    public function assign(): void {
        $this->requireAuth(['Admin', 'Receptionist']);
        
        if (\$_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->redirect('/deliveries');
        }

        $deliveryId = (int)($_POST['delivery_id'] ?? 0);
        $personnelId = (int)($_POST['personnel_id'] ?? 0);

        if ($deliveryId > 0 && $personnelId > 0) {
            Delivery::assign($deliveryId, $personnelId);
        }

        $this->redirect('/deliveries', "Delivery Runner Assigned successfully.");
    }

    /**
     * Action driver pickup and progress updates
     */
    public function updateStatus(): void {
        $this->requireAuth(['Admin', 'Receptionist', 'Delivery']);
        
        if (\$_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->redirect('/deliveries');
        }

        $deliveryId = (int)($_POST['delivery_id'] ?? 0);
        $status = $_POST['status'] ?? '';
        $notes = $_POST['notes'] ?? '';

        if ($deliveryId > 0 && !empty($status)) {
            Delivery::updateStatus($deliveryId, $status, $notes);
        }

        $this->redirect('/deliveries', "Delivery status adjusted to '{$status}'.");
    }
}
`
  },
  deliveryView: {
    name: "index.php",
    path: "/app/views/deliveries/index.php",
    language: "php",
    explanation: "Server-side template rendering active transit orders, giving receptionists assignment controls and drivers quick pickup/delivered state triggers.",
    code: `<?php
/**
 * CRSTMS - Deliveries view template (MVC)
 */
?>
<div class="space-y-6 text-xs text-left">
    <div class="flex justify-between items-center border-b border-slate-805 pb-3">
        <div>
            <h2 class="text-lg font-bold text-white font-display">Logistics Control & Deliveries</h2>
            <p class="text-[11px] text-slate-400">Track shipping schedules, assign courier operators, and receive dropoff confirmations.</p>
        </div>
    </div>

    <!-- Filter toolbar -->
    <form method="GET" action="/deliveries" class="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
            <label class="block text-slate-500 font-bold mb-1 uppercase text-[9px]">Transit State</label>
            <select name="status" class="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200">
                <option value="">-- All Deliveries --</option>
                <option value="Pending" <?= ($filters['status'] === 'Pending') ? 'selected' : '' ?>>Pending</option>
                <option value="Assigned" <?= ($filters['status'] === 'Assigned') ? 'selected' : '' ?>>Assigned</option>
                <option value="Picked Up" <?= ($filters['status'] === 'Picked Up') ? 'selected' : '' ?>>Picked Up</option>
                <option value="In Transit" <?= ($filters['status'] === 'In Transit') ? 'selected' : '' ?>>In Transit</option>
                <option value="Delivered" <?= ($filters['status'] === 'Delivered') ? 'selected' : '' ?>>Delivered</option>
                <option value="Confirmed" <?= ($filters['status'] === 'Confirmed') ? 'selected' : '' ?>>Customer Confirmed</option>
            </select>
        </div>
        <div class="sm:col-span-2">
            <label class="block text-slate-500 font-bold mb-1 uppercase text-[9px]">Search Customer/Specs</label>
            <input name="search" type="text" value="<?= h($filters['search'] ?? '') ?>" placeholder="Scan name, brand model parameters..." class="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200" />
        </div>
        <div class="flex items-end">
            <button type="submit" class="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded cursor-pointer transition">Filter Results</button>
        </div>
    </form>

    <!-- Logistics Grid -->
    <div class="space-y-3">
        <?php if (empty($deliveries)): ?>
            <div class="p-8 text-center bg-slate-900 border border-slate-800 text-slate-500 rounded-xl italic">
                No logistical transit or dispatch assignments found.
            </div>
        <?php else: ?>
            <?php foreach ($deliveries as $item): ?>
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    
                    <!-- Customer & Coordinates -->
                    <div class="space-y-1">
                        <span class="text-[9px] bg-slate-950 text-slate-400 rounded px-1.5 py-0.5 font-mono">DELIVERY ORDER #<?= h($item['id']) ?></span>
                        <h4 class="font-bold text-white text-sm"><?= h($item['customer_name']) ?></h4>
                        <p class="text-slate-400 leading-normal">📍 <?= h($item['customer_address']) ?></p>
                        <p class="text-[10px] text-slate-500">Contact: <?= h($item['customer_email']) ?></p>
                    </div>

                    <!-- Laptop specs & linked Ticket -->
                    <div class="space-y-1">
                        <span class="text-slate-500 font-bold uppercase text-[9px]">Hardware Device Details</span>
                        <div class="font-medium text-slate-200"><?= h($item['device_brand']) ?> <?= h($item['device_model']) ?></div>
                        <p class="text-slate-500">Type: <?= h($item['device_type']) ?></p>
                        <a href="/tickets/view?id=<?= $item['ticket_id'] ?>" class="text-[#f59e0b] hover:underline font-mono">Linked Ticket #<?= $item['ticket_id'] ?> &rarr;</a>
                    </div>

                    <!-- Courier runner status -->
                    <div class="space-y-1.5">
                        <span class="text-slate-500 font-bold uppercase text-[9px] block">Dispatcher Driver</span>
                        <?php if (empty($item['delivery_personnel_id'])): ?>
                            <div class="text-slate-500 italic">No runner assigned yet</div>
                            <?php if (in_array($_SESSION['user_role'] ?? 'Guest', ['Admin', 'Receptionist'])): ?>
                                <!-- Assign driver form -->
                                <form method="POST" action="/deliveries/assign" class="flex gap-1 pt-1">
                                    <input type="hidden" name="delivery_id" value="<?= $item['id'] ?>" />
                                    <select name="personnel_id" required class="flex-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-200 text-[11px]">
                                        <option value="">-- Choose Runner --</option>
                                        <?php foreach ($drivers as $dr): ?>
                                            <option value="<?= $dr['id'] ?>"><?= h($dr['full_name']) ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                    <button type="submit" class="px-2.5 py-1 bg-[#0f2d24] text-teal-400 border border-teal-800 rounded font-bold cursor-pointer text-[10px]">Assign</button>
                                </form>
                            <?php endif; ?>
                        <?php else: ?>
                            <div class="font-semibold text-slate-300">🚚 <?= h($item['driver_name']) ?></div>
                            <span class="inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase leading-none bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Status: <?= h($item['status']) ?>
                            </span>
                        <?php endif; ?>
                    </div>

                    <!-- Transit Status timeline controls -->
                    <div class="flex flex-col gap-1.5 justify-end sm:items-end">
                        <div class="text-[10px] text-slate-500 font-mono">Scheduled: <?= date('d M Y', strtotime($item['created_at'])) ?></div>
                        
                        <?php if (!empty($item['notes'])): ?>
                            <div class="p-2 bg-slate-950 rounded text-slate-400 italic text-[11px] border border-slate-850 w-full text-left">
                                Notes: <span class="text-slate-300"><?= h($item['notes']) ?></span>
                            </div>
                        <?php endif; ?>

                        <!-- Status Transition controls -->
                        <?php if (!empty($item['delivery_personnel_id'])): ?>
                            <form method="POST" action="/deliveries/update" class="flex flex-col gap-1.5 w-full">
                                <input type="hidden" name="delivery_id" value="<?= $item['id'] ?>" />
                                
                                <div class="flex gap-1.5">
                                    <input name="notes" type="text" placeholder="Transit notes / delivery codes..." class="flex-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[11px] text-slate-300 focus:outline-none" />
                                    
                                    <select name="status" required class="bg-slate-950 border border-slate-800 rounded px-1 py-1 text-[11px] text-slate-200 font-bold font-sans">
                                        <option value="">-- Shift --</option>
                                        <option value="Picked Up">Mark Picked Up</option>
                                        <option value="In Transit">Mark In Transit</option>
                                        <option value="Delivered">Mark Delivered</option>
                                        <?php if (in_array($_SESSION['user_role'] ?? '', ['Admin', 'Receptionist'])): ?>
                                            <option value="Confirmed">Mark Confirmed</option>
                                        <?php endif; ?>
                                    </select>
                                    
                                    <button type="submit" class="px-3 bg-amber-500 hover:bg-amber-600 font-bold text-slate-950 rounded text-[11px] cursor-pointer">OK</button>
                                </div>
                            </form>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>
`
  },
  inquiryModel: {
    name: "Inquiry.php",
    path: "/app/models/Inquiry.php",
    language: "php",
    explanation: "Support inquiry records tracking module. Maps customer messages to threaded responses inside database context tables using prepared PDO statements.",
    code: `<?php
/**
 * CRSTMS - Inquiry/Support System Model (OOP Layout)
 */

namespace App\\Models;

use Config\\Database;
use App\\Models\\SystemLog;
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
        } catch (\\Exception $e) {
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
            SystemLog::log("ASSIGN_INQUIRY", "Inquiries", (string)$inquiryId, "Inquiry allocated to representative #{$staffId}", \$_SESSION['user_id'] ?? null);
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
            SystemLog::log("CLOSE_INQUIRY", "Inquiries", (string)$inquiryId, "Support inquiry marked as '{$status}'", \$_SESSION['user_id'] ?? null);
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
`
  },
  supportController: {
    name: "SupportController.php",
    path: "/app/controllers/SupportController.php",
    language: "php",
    explanation: "Support system dispatch coordinator. Handles customer requests and support executive reply flows.",
    code: `<?php
/**
 * CRSTMS - Support/Inquiry System Controller
 */

namespace App\\Controllers;

use App\\Models\\Inquiry;

class SupportController extends BaseController {

    /**
     * Renders Support interface workspace
     */
    public function index(): void {
        $this->requireAuth();
        
        $filters = [];
        if (\$_SESSION['user_role'] === 'Customer') {
            $filters['customer_id'] = \$_SESSION['user_id'];
        }
        if (!empty($_GET['status'])) {
            $filters['status'] = $_GET['status'];
        }

        $inquiries = Inquiry::getInquiries($filters);
        
        // Retrieve valid reception staff for inquiries delegation options
        $db = \\Config\\Database::getConnection();
        $staffQuery = $db->query("SELECT id, full_name, role FROM users WHERE role IN ('Admin', 'Receptionist') ORDER BY full_name ASC");
        $staff = $staffQuery->fetchAll(\\PDO::FETCH_ASSOC);

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
        
        if (\$_SERVER['REQUEST_METHOD'] === 'POST') {
            $subject = trim($_POST['subject'] ?? '');
            $message = trim($_POST['message'] ?? '');

            if (!empty($subject) && !empty($message)) {
                Inquiry::submit(\$_SESSION['user_id'], $subject, $message);
            }
        }

        $this->redirect('/support', "Support ticket submitted successfully.");
    }

    /**
     * Post a threaded response line
     */
    public function reply(): void {
        $this->requireAuth(); // Open to active Customers and Support operators back-and-forth

        if (\$_SERVER['REQUEST_METHOD'] === 'POST') {
            $inquiryId = (int)($_POST['inquiry_id'] ?? 0);
            $responseText = trim($_POST['response_text'] ?? '');
            $status = $_POST['status'] ?? 'Responded';

            if ($inquiryId > 0 && !empty($responseText)) {
                Inquiry::reply($inquiryId, \$_SESSION['user_id'], $responseText, $status);
            }
        }

        $this->redirect('/support', "Inquiry dialogue update registered.");
    }

    /**
     * Assign / Delegate inquiry
     */
    public function assign(): void {
        $this->requireAuth(['Admin', 'Receptionist']);

        if (\$_SERVER['REQUEST_METHOD'] === 'POST') {
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

        if (\$_SERVER['REQUEST_METHOD'] === 'POST') {
            $inquiryId = (int)($_POST['inquiry_id'] ?? 0);
            if ($inquiryId > 0) {
                Inquiry::updateStatus($inquiryId, 'Closed');
            }
        }

        $this->redirect('/support', "Support inquiry ticket has been marked Closed.");
    }
}
`
  },
  supportView: {
    name: "index.php",
    path: "/app/views/support/index.php",
    language: "php",
    explanation: "Dynamic user interface displaying customer inquiry tickets. Custom-built for customer response logging or operations coordination panels.",
    code: `<?php
/**
 * CRSTMS - Support and inquiry template (MVC)
 */
?>
<div class="space-y-6 text-xs text-left">
    <div class="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
            <h2 class="text-lg font-bold text-white font-display">Customer Support & Response Lobby</h2>
            <p class="text-[11px] text-slate-400">Review customers hardware disputes, answer catalog questions, and delegate support tasks.</p>
        </div>
    </div>

    <!-- CUSTOMER INTAKE FORM (SUBMIT ONLY VIEWABLE BY CUSTOMER ROLE) -->
    <?php if ($_SESSION['user_role'] === 'Customer'): ?>
        <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3.5">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider">File Support Request Ticket</h3>
            <form method="POST" action="/support/submit" class="grid grid-cols-1 gap-3">
                <div class="space-y-1">
                    <label class="font-bold text-slate-400">Subject / Context Category *</label>
                    <input name="subject" required type="text" placeholder="e.g., Boot-loop after screen replacement" class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
                </div>
                <div class="space-y-1">
                    <label class="font-bold text-slate-400">Details / Describe your problem *</label>
                    <textarea name="message" required rows="3" placeholder="Explain the symptoms, device serial codes concerned..." class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300"></textarea>
                </div>
                <div class="flex justify-end">
                    <button type="submit" class="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold font-sans rounded cursor-pointer transition">
                        Dispatch Concern to Shop
                    </button>
                </div>
            </form>
        </div>
    <?php endif; ?>

    <!-- INQUIRIES WORKSPACE LIST -->
    <div class="space-y-4">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Active Queries Ledger</h3>
        
        <?php if (empty($inquiries)): ?>
            <div class="p-8 text-center bg-slate-900 border border-slate-800 text-slate-500 rounded-xl italic">
                No active or historical support requests currently filed.
            </div>
        <?php else: ?>
            <div class="space-y-3">
                <?php foreach ($inquiries as $inq): ?>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-3">
                            <div class="space-y-1">
                                <span class="text-[9px] font-mono text-slate-500 uppercase tracking-wide">Inquiry Ref: INQ-<?= $inq['id'] ?></span>
                                <h4 class="text-sm font-extrabold text-white leading-snug"><?= h($inq['subject']) ?></h4>
                                <div class="text-[10px] text-slate-400">
                                    Submitted by: <strong class="text-slate-200"><?= h($inq['customer_name']) ?></strong> (<?= h($inq['customer_email']) ?>)
                                </div>
                            </div>
                            
                            <div class="flex items-center gap-2.5">
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono border" style="
                                    background-color: <?= ($inq['status'] === 'Closed') ? '#1e1b4b' : (($inq['status'] === 'Responded') ? '#022c22' : '#7c2d12') ?>;
                                    color: <?= ($inq['status'] === 'Closed') ? '#c7d2fe' : (($inq['status'] === 'Responded') ? '#34d399' : '#f87171') ?>;
                                    border-color: <?= ($inq['status'] === 'Closed') ? '#4f46e5/20' : (($inq['status'] === 'Responded') ? '#10b981/20' : '#f97316/20') ?>;
                                ">
                                    <?= h($inq['status']) ?>
                                </span>
                                <span class="text-slate-500 font-mono text-[10px]"><?= date('d M, H:i', strtotime($inq['created_at'])) ?></span>
                            </div>
                        </div>

                        <!-- Initial customer concern text -->
                        <div class="p-3 bg-slate-950 rounded-lg text-slate-300 border border-slate-850">
                            <strong>Concern:</strong> <p class="mt-1 leading-relaxed text-slate-350"><?= nl2br(h($inq['message'])) ?></p>
                        </div>

                        <!-- Threaded Replies section -->
                        <?php if (!empty($inq['replies'])): ?>
                            <div class="space-y-2.5 pl-4 border-l-2 border-slate-800">
                                <?php foreach ($inq['replies'] as $rep): ?>
                                    <div class="p-3 bg-slate-950/40 rounded border border-slate-850 text-[11px] space-y-1">
                                        <div class="flex justify-between font-mono text-[9px] text-slate-500">
                                            <span>Reply by: <strong><?= h($rep['responder_name']) ?></strong> (<?= h($rep['responder_role']) ?>)</span>
                                            <span><?= date('d M, H:i', strtotime($rep['created_at'])) ?></span>
                                        </div>
                                        <p class="text-slate-300 leading-normal font-sans"><?= nl2br(h($rep['response_text'])) ?></p>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>

                        <!-- STAFF ACTIONS: DELEGATING OR CLOSING -->
                        <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <div class="text-[10px] text-slate-500">
                                <?php if ($inq['assigned_staff_id']): ?>
                                    <span>Assigned to support lead: <strong class="text-slate-300"><?= h($inq['staff_name']) ?></strong></span>
                                <?php else: ?>
                                    <span class="text-red-400/80 font-bold italic">Unallocated - Queue attention required!</span>
                                <?php endif; ?>
                            </div>

                            <div class="flex gap-2 text-xs">
                                <!-- Delegate Support Leader (Admins/Receptionists only) -->
                                <?php if (in_array($_SESSION['user_role'] ?? '', ['Admin', 'Receptionist'])): ?>
                                    <form method="POST" action="/support/assign" class="flex gap-1">
                                        <input type="hidden" name="inquiry_id" value="<?= $inq['id'] ?>" />
                                        <select name="staff_id" required class="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300">
                                            <option value="">-- Delegate Staff --</option>
                                            <?php foreach ($staff as $st): ?>
                                                <option value="<?= $st['id'] ?>"><?= h($st['full_name']) ?> (<?= h($st['role']) ?>)</option>
                                            <?php endforeach; ?>
                                        </select>
                                        <button type="submit" class="px-2.5 bg-slate-950 hover:bg-slate-850 text-slate-200 border border-slate-850 rounded font-bold cursor-pointer transition">Delegate</button>
                                    </form>

                                    <!-- Close Ticket buttons -->
                                    <?php if ($inq['status'] !== 'Closed'): ?>
                                        <form method="POST" action="/support/close" class="inline">
                                            <input type="hidden" name="inquiry_id" value="<?= $inq['id'] ?>" />
                                            <button type="submit" class="px-2.5 py-1 bg-red-950/20 text-red-400 hover:bg-red-900/30 border border-red-910/30 rounded font-bold cursor-pointer transition">Close Query</button>
                                        </form>
                                    <?php endif; ?>
                                <?php endif; ?>
                            </div>
                        </div>

                        <!-- REPLY INPUT BOX FOR ACTIVE DIALOGUE -->
                        <?php if ($inq['status'] !== 'Closed'): ?>
                            <form method="POST" action="/support/reply" class="pt-3 border-t border-slate-800/80">
                                <input type="hidden" name="inquiry_id" value="<?= $inq['id'] ?>" />
                                <div class="flex flex-col sm:flex-row gap-2">
                                    <input name="response_text" required type="text" placeholder="Add reply to threaded dialogue log..." class="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500" />
                                    
                                    <div class="flex gap-1.5 self-end">
                                        <?php if (in_array($_SESSION['user_role'] ?? '', ['Admin', 'Receptionist'])): ?>
                                            <select name="status" class="bg-slate-950 border border-slate-800 rounded px-1.5 text-[11px] text-slate-200 font-bold">
                                                <option value="Responded">Responded</option>
                                                <option value="Escalated">Escalate Concern</option>
                                            </select>
                                        <?php endif; ?>
                                        <button type="submit" class="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded font-bold font-sans cursor-pointer transition">Post Message</button>
                                    </div>
                                </div>
                            </form>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</div>
`
  },
  reportController: {
    name: "ReportController.php",
    path: "/app/controllers/ReportController.php",
    language: "php",
    explanation: "Consolidated report engine aggregating historical analytics, labor summaries, technician volume tracking, finance cash flow, and logistics delivery speed.",
    code: `<?php
/**
 * CRSTMS - Reporting and dashboard Controller
 */

namespace App\\Controllers;

use Config\\Database;
use PDO;

class ReportController extends BaseController {

    /**
     * Aggregates and renders analytical outputs
     */
    public function index(): void {
        $this->requireAuth(['Admin', 'Receptionist']);

        $startDate = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
        $endDate = $_GET['end_date'] ?? date('Y-m-d');

        $db = Database::getConnection();

        // 1. REPAIR SUMMARY REPORT
        $stmtRepairs = $db->prepare("
            SELECT status, COUNT(*) as count
            FROM repair_tickets
            WHERE DATE(created_at) BETWEEN ? AND ?
            GROUP BY status
        ");
        $stmtRepairs->execute([$startDate, $endDate]);
        $repairSummary = $stmtRepairs->fetchAll(PDO::FETCH_ASSOC);

        // 2. INVENTORY USAGE REPORT
        $stmtInventory = $db->prepare("
            SELECT p.part_name, p.serial_number, SUM(ABS(l.quantity_changed)) as units_used
            FROM inventory_logs l
            JOIN spare_parts p ON l.part_id = p.id
            WHERE l.action_type = 'Used in Repair' AND DATE(l.created_at) BETWEEN ? AND ?
            GROUP BY p.id
            ORDER BY units_used DESC
        ");
        $stmtInventory->execute([$startDate, $endDate]);
        $inventoryUsage = $stmtInventory->fetchAll(PDO::FETCH_ASSOC);

        // 3. FINANCIAL SUMMARY (from invoices)
        $stmtFinance = $db->prepare("
            SELECT 
                COUNT(*) as total_invoices,
                SUM(service_cost) as total_labor,
                SUM(spare_parts_cost) as total_parts,
                SUM(total_amount) as grand_total_revenue,
                SUM(CASE WHEN payment_status = 'Paid' THEN total_amount ELSE 0 END) as total_collected,
                SUM(CASE WHEN payment_status = 'Unpaid' THEN total_amount ELSE 0 END) as total_outstanding
            FROM invoices
            WHERE DATE(invoice_date) BETWEEN ? AND ?
        ");
        $stmtFinance->execute([$startDate, $endDate]);
        $financeSummary = $stmtFinance->fetch(PDO::FETCH_ASSOC);

        // 4. TECHNICIAN PERFORMANCE REPORT
        $stmtTech = $db->prepare("
            SELECT u.full_name as technician_name, 
                   COUNT(t.id) as total_assigned,
                   SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_jobs,
                   SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_jobs
            FROM users u
            JOIN technicians tech ON u.id = tech.user_id
            LEFT JOIN repair_tickets t ON u.id = t.technician_id
            GROUP BY u.id
            ORDER BY completed_jobs DESC
        ");
        $stmtTech->execute();
        $techPerformance = $stmtTech->fetchAll(PDO::FETCH_ASSOC);

        // 5. DELIVERY PERFORMANCE REPORT
        $stmtDeliveries = $db->prepare("
            SELECT status, COUNT(*) as count,
                   AVG(TIMESTAMPDIFF(HOUR, pickup_date, delivery_date)) as avg_transit_hours
            FROM deliveries
            WHERE DATE(created_at) BETWEEN ? AND ?
            GROUP BY status
        ");
        $stmtDeliveries->execute([$startDate, $endDate]);
        $deliveryPerformance = $stmtDeliveries->fetchAll(PDO::FETCH_ASSOC);

        $this->render("reports/index", [
            'startDate' => $startDate,
            'endDate' => $endDate,
            'repairs' => $repairSummary,
            'inventory' => $inventoryUsage,
            'finance' => $financeSummary,
            'technicians' => $techPerformance,
            'deliveries' => $deliveryPerformance
        ]);
    }
}
`
  },
  systemLogModel: {
    name: "SystemLog.php",
    path: "/app/models/SystemLog.php",
    language: "php",
    explanation: "Direct PDO log tracker. Captures user behaviors, timestamp tracking, module keys, and transactional diagnostic feedback safely.",
    code: `<?php
/**
 * CRSTMS - System Activity Audit logging (Active Database Record)
 */

namespace App\\Models;

use Config\\Database;
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
        } catch (\\Exception $e) {
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
`
  }
};

// Dynamically overlay the code from physical backend files in the workspace if loaded via Vite
try {
  // Vite's compile-time dynamic loader for raw workspace text files in the /backend directory
  const backendFiles = (import.meta as any).glob("/backend/**/*.{php,sql}", {
    query: "?raw",
    import: "default",
    eager: true
  }) as Record<string, string>;

  // Loop through other templates and overwrite their static codes with live physical files
  for (const [key, template] of Object.entries(CODE_TEMPLATES)) {
    // Standardize template paths to map to "/backend" structures
    let physicalPath = "/backend" + template.path;
    
    // Exception mapping for router configuration
    if (template.path === "/routes.php") {
      physicalPath = "/backend/routes/web.php";
    }

    if (backendFiles[physicalPath]) {
      template.code = backendFiles[physicalPath];
    }
  }

  // Inject newly generated App Model files not originally part of the hardcoded template schema
  const userModelPath = "/backend/app/models/User.php";
  if (backendFiles[userModelPath]) {
    CODE_TEMPLATES["userModel"] = {
      name: "User.php",
      path: "/app/models/User.php",
      language: "php",
      explanation: "Models system users, credentials, role authorizations, and password matching checks.",
      code: backendFiles[userModelPath]
    };
  }
} catch (e) {
  console.warn("Could not dynamically load physical backend files:", e);
}




