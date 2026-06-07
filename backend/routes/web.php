<?php
/**
 * CRSTMS - Explicit URL Router Configuration
 */

use App\Core\Router;

$router = new Router();

// Instantiate and register application route rules


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
return $router;