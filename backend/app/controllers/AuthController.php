<?php
/**
 * CRSTMS - AuthController
 * Coordinates login, cryptographic check, session instantiation, and authorization audits.
 */

namespace App\Controllers;

use App\Models\User;

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
}