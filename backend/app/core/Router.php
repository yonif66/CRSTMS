<?php
namespace App\Core;

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
        $controllerNamespace = "App\\Controllers\\" . $controllerClass;
        
        if (!class_exists($controllerNamespace)) {
            throw new \Exception("Target Controller class '{$controllerNamespace}' is not defined.");
        }

        $controllerInstance = new $controllerNamespace();
        if (!method_exists($controllerInstance, $action)) {
            throw new \Exception("Target Controller action '{$action}' is not present under '{$controllerClass}'.");
        }

        // Trigger action pipeline
        $controllerInstance->$action();
    }
}