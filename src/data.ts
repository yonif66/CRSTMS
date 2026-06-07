export interface FileNode {
  name: string;
  type: "file" | "directory";
  children?: FileNode[];
  description?: string;
}

export interface TableColumn {
  name: string;
  type: string;
  constraints: string;
  description: string;
}

export interface DBTable {
  name: string;
  description: string;
  columns: TableColumn[];
  foreignKeys?: string[];
  sql: string;
}

export const ARCHITECTURE_EXPLANATION = {
  overview: `The Computer Repair Service Tracking and Management System (CRSTMS) uses a highly secure, high-performance MVC (Model-View-Controller) Architectural Pattern designed with standard OOP PHP practices. To ensure high maintainability, low coupling, and scalability for multi-business operations, the architecture strictly decouples the database, application logic, and modern responsive user interfaces.`,
  layers: [
    {
      name: "Presentation Layer (V)",
      description: "Serves standard mobile-responsive view templates with server-side sanitized variables. This layer uses modern HTML5, Tailwind CSS, and custom vanilla JavaScript for asynchronous (AJAX) interactions with the backend endpoints (e.g., updating repair ticket status without reloading the page)."
    },
    {
      name: "Application Layer (C)",
      description: "Controls request handling, session state management, security boundaries, authentication, and routing rules. Controller objects extract sanitised parameters from HTTPS requests and coordinate tasks between the database Models."
    },
    {
      name: "Data & Domain Layer (M)",
      description: "Encapsulates business domains (Users, Tickets, Invoices, Delivery, Spare Parts). Strict OOP methods handle validating boundaries, performing calculations, and checking authorization policies. Database queries are exclusively triggered utilizing PHP Data Objects (PDO) with prepared statements to guarantee SQL Injection prevention."
    }
  ],
  scalabilityDesign: `To future-proof the system for multi-branch or SaaS business models, every entity is structurally separated beneath a 'companies' or 'branches' scope. In this phase, we design modular tables scoped securely by 'branch_id' and 'user_id' fields with solid foreign key cascades. This guarantees complete multi-tenant isolation where data leakage between different maintenance shops is mathematically impossible.`,
};

export const FOLDER_STRUCTURE: FileNode = {
  name: "crstms-core",
  type: "directory",
  description: "Root of the MVC application.",
  children: [
    {
      name: "app",
      type: "directory",
      description: "Core application logic.",
      children: [
        {
          name: "controllers",
          type: "directory",
          description: "Controllers coordinating model state and rendering client views.",
          children: [
            { name: "BaseController.php", type: "file", description: "Parent class with helper methods for redirecting, layout injection, and authorization audits." },
            { name: "AuthController.php", type: "file", description: "Processes secure user logins, sessions, role verification, and password hashes." },
            { name: "TicketController.php", type: "file", description: "Creates, updates, and assigns technicians to Repair Tickets." },
            { name: "CustomerController.php", type: "file", description: "Handles customer profile registrations and customer history audits." },
            { name: "InventoryController.php", type: "file", description: "Manages spare parts replenishment, stock quantities, and low stock warnings." },
            { name: "InvoiceController.php", type: "file", description: "Calculates total costs and generates printable invoice templates." }
          ]
        },
        {
          name: "models",
          type: "directory",
          description: "Active Record or Data Mapper Class representations of database tables.",
          children: [
            { name: "BaseModel.php", type: "file", description: "Abstract parent providing query boundaries, active database instances, and transaction control wrapper." },
            { name: "User.php", type: "file", description: "Models generic system users, credentials, password cryptography (Argon2id), and dynamic permissions." },
            { name: "Customer.php", type: "file", description: "Handles customer-specific tables and histories." },
            { name: "Device.php", type: "file", description: "Information structure representing customer hardware units." },
            { name: "RepairTicket.php", type: "file", description: "Implements state transition rules (Created -> Assigned -> In Progress -> Completed)." },
            { name: "SparePart.php", type: "file", description: "Handles stock adjustments, logging inventory usage, and catalog updates." },
            { name: "Invoice.php", type: "file", description: "Calculates spare part and labor sums, validating payment statuses." }
          ]
        },
        {
          name: "middleware",
          type: "directory",
          description: "Session checkers and boundary restrictions.",
          children: [
            { name: "AuthMiddleware.php", type: "file", description: "Verifies session context, idle duration timers, and enforces role redirection hooks." }
          ]
        },
        {
          name: "views",
          type: "directory",
          description: "Clean layout-driven PHP files containing HTML interface views sanitised with h().",
          children: [
            {
              name: "dashboards",
              type: "directory",
              description: "Interactive workspace panels custom-built for specific system roles.",
              children: [
                { name: "admin.php", type: "file", description: "Admin operations control center with real-time stock alert trackers." },
                { name: "receptionist.php", type: "file", description: "Intake work-pad, registration of devices, and invoicing." },
                { name: "technician.php", type: "file", description: "Task boards, diagnoser and spare parts deducer." },
                { name: "customer.php", type: "file", description: "Repair trajectory logs, invoices, and messaging." },
                { name: "delivery.php", type: "file", description: "Logistics tracking, status and recipient signature." }
              ]
            },
            {
              name: "layouts",
              type: "directory",
              description: "Persistent structural page frameworks (headers, sidebars based on actor roles).",
              children: [
                { name: "header.php", type: "file" },
                { name: "footer.php", type: "file" },
                { name: "sidebar.php", type: "file" }
              ]
            },
            {
              name: "auth",
              type: "directory",
              children: [
                { name: "login.php", type: "file", description: "Beautiful user entrance portal." }
              ]
            },
            {
              name: "tickets",
              type: "directory",
              children: [
                { name: "create.php", type: "file" },
                { name: "index.php", type: "file" },
                { name: "view.php", type: "file" }
              ]
            },
            {
              name: "inventory",
              type: "directory",
              children: [
                { name: "index.php", type: "file" },
                { name: "add_part.php", type: "file" }
              ]
            },
            {
              name: "invoices",
              type: "directory",
              children: [
                { name: "index.php", type: "file", description: "All generated invoicing statements." },
                { name: "view.php", type: "file", description: "Printable receipt invoice view." }
              ]
            },
            {
              name: "deliveries",
              type: "directory",
              children: [
                { name: "index.php", type: "file", description: "Deliveries dashboard index view." },
                { name: "view.php", type: "file", description: "Detailed transit and pickup logs view." }
              ]
            },
            {
              name: "support",
              type: "directory",
              children: [
                { name: "index.php", type: "file", description: "Inquiry workspace and customer support interface." },
                { name: "view.php", type: "file", description: "Threaded inquiry dialog view." }
              ]
            },
            {
              name: "reports",
              type: "directory",
              children: [
                { name: "index.php", type: "file", description: "Reports filters and visual metrics view." },
                { name: "print.php", type: "file", description: "Clean printable tabular layout report wrapper." }
              ]
            },
            {
              name: "logs",
              type: "directory",
              children: [
                { name: "index.php", type: "file", description: "System audit logs overview index." }
              ]
            }
          ]
        }
      ]
    },
    {
      name: "config",
      type: "directory",
      description: "System configuration parameters.",
      children: [
        { name: "database.php", type: "file", description: "Returns secure PDO configuration credentials, SSL keys, and driver flags." },
        { name: "app.php", type: "file", description: "Hosts global routes, company context parameters, and app timezone configurations." }
      ]
    },
    {
      name: "database",
      type: "directory",
      description: "Migration scripts, seeds, and initial SQL blueprints.",
      children: [
        { name: "schema.sql", type: "file", description: "Full logical MySQL table definitions complete with referential integrity constraints." },
        { name: "seeds.sql", type: "file", description: "Populates mock records for testing Actor logins immediately (Admin, Receptionist, Technician, Customer, Delivery)." }
      ]
    },
    {
      name: "public",
      type: "directory",
      description: "The ONLY directory open to web servers. Hosts the main index controller file.",
      children: [
        { name: "index.php", type: "file", description: "The Front Controller. Boots the system, sets secure cookies, resolves routing, and triggers controller pipelines." },
        { name: ".htaccess", type: "file", description: "URL rewriting directives routing all requests securely to index.php." },
        {
          name: "assets",
          type: "directory",
          description: "Static content.",
          children: [
            { name: "css", type: "directory", children: [{ name: "tailwind.css", type: "file" }] },
            { name: "js", type: "directory", children: [{ name: "main.js", type: "file" }, { name: "auth.js", type: "file" }] }
          ]
        }
      ]
    },
    { name: "routes.php", type: "file", description: "Declares URI routes mapping string patterns explicitly to controllers and actions." }
  ]
};

export const DB_SCHEMA: DBTable[] = [
  {
    name: "users",
    description: "Centralized credential and access table for all human actors inside the ecosystem. Promotes single-point login.",
    columns: [
      { name: "id", type: "INT AUTO_INCREMENT", constraints: "PRIMARY KEY", description: "Unique database identifier for the user." },
      { name: "username", type: "VARCHAR(50)", constraints: "UNIQUE, NOT NULL", description: "Shorthand handle used to authenticate." },
      { name: "password_hash", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Securely hashed string created with password_hash(..., PASSWORD_ARGON2ID)." },
      { name: "full_name", type: "VARCHAR(100)", constraints: "NOT NULL", description: "Formal human display name." },
      { name: "phone_number", type: "VARCHAR(20)", constraints: "NOT NULL", description: "Primary callback phone." },
      { name: "role", type: "ENUM", constraints: "NOT NULL, DEFAULT 'Customer'", description: "Access boundary key: 'Admin', 'Receptionist', 'Technician', 'Customer', 'Delivery'." },
      { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP", description: "Record tracking point." },
      { name: "updated_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP", description: "Automatic synchronization tracking point." }
    ],
    sql: `CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  role ENUM('Admin', 'Receptionist', 'Technician', 'Customer', 'Delivery') NOT NULL DEFAULT 'Customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    name: "admins",
    description: "Extends users table to hold specialized administrative flags and global access configuration rules.",
    columns: [
      { name: "user_id", type: "INT", constraints: "PRIMARY KEY, FOREIGN KEY REFERENCES users(id)", description: "Links directly to user credentials table." },
      { name: "access_level", type: "INT", constraints: "NOT NULL DEFAULT 1", description: "Granular administrative control integer (e.g. 1-Super Admin, 2-Manager)." }
    ],
    sql: `CREATE TABLE admins (
  user_id INT PRIMARY KEY,
  access_level INT NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  {
    name: "customers",
    description: "Contains additional data fields necessary to manage direct repairs, shipping destinations, and notes for individual customers.",
    columns: [
      { name: "user_id", type: "INT", constraints: "PRIMARY KEY, FOREIGN KEY REFERENCES users(id)", description: "User record linkage." },
      { name: "email", type: "VARCHAR(100)", constraints: "UNIQUE, NOT NULL", description: "Validated contact email address." },
      { name: "address", type: "TEXT", constraints: "NOT NULL", description: "Primary delivery of repaired device target." },
      { name: "alternative_phone", type: "VARCHAR(20)", constraints: "NULL", description: "Secondary point of contact." }
    ],
    sql: `CREATE TABLE customers (
  user_id INT PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  address TEXT NOT NULL,
  alternative_phone VARCHAR(20) NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  {
    name: "technicians",
    description: "Holds professional specialization fields and active availability tracking identifiers for computer repair agents.",
    columns: [
      { name: "user_id", type: "INT", constraints: "PRIMARY KEY, FOREIGN KEY REFERENCES users(id)", description: "User linkage with technician role." },
      { name: "specialization", type: "VARCHAR(100)", constraints: "NOT NULL", description: "Expertise focus, e.g. 'Apple Hardware', 'Solder Work', 'Software Recovery'." },
      { name: "availability_status", type: "ENUM", constraints: "NOT NULL DEFAULT 'Available'", description: "Availability flags: 'Available', 'In Repair', 'On Leave'." }
    ],
    sql: `CREATE TABLE technicians (
  user_id INT PRIMARY KEY,
  specialization VARCHAR(100) NOT NULL,
  availability_status ENUM('Available', 'In Repair', 'On Leave') NOT NULL DEFAULT 'Available',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  {
    name: "receptionists",
    description: "Registers Receptionist physical desk coordinates to enable quick handover audit logs.",
    columns: [
      { name: "user_id", type: "INT", constraints: "PRIMARY KEY, FOREIGN KEY REFERENCES users(id)", description: "Recenptionist linkage." },
      { name: "desk_number", type: "VARCHAR(20)", constraints: "NOT NULL", description: "Identifies receptionist's physical service counters or desk location." }
    ],
    sql: `CREATE TABLE receptionists (
  user_id INT PRIMARY KEY,
  desk_number VARCHAR(20) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  {
    name: "delivery_personnel",
    description: "Holds fleet information and compliance license keys for staff delivering equipment.",
    columns: [
      { name: "user_id", type: "INT", constraints: "PRIMARY KEY, FOREIGN KEY REFERENCES users(id)", description: "Delivery driver user linkage." },
      { name: "vehicle_type", type: "VARCHAR(50)", constraints: "NOT NULL", description: "E.g. 'Motorcycle', 'Van', 'Foot Delivery'." },
      { name: "license_number", type: "VARCHAR(50)", constraints: "UNIQUE, NOT NULL", description: "Commercial driver license identification." }
    ],
    sql: `CREATE TABLE delivery_personnel (
  user_id INT PRIMARY KEY,
  vehicle_type VARCHAR(50) NOT NULL,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  {
    name: "devices",
    description: "Client hardware devices brought into the workshop. Relates strictly to a unique customer owner.",
    columns: [
      { name: "id", type: "INT AUTO_INCREMENT", constraints: "PRIMARY KEY", description: "Internal identifier code." },
      { name: "customer_id", type: "INT", constraints: "NOT NULL, FOREIGN KEY REFERENCES customers(user_id)", description: "Represents the client owner of the hardware." },
      { name: "device_type", type: "VARCHAR(50)", constraints: "NOT NULL", description: "Classification: 'Laptop', 'Desktop', 'Tablet', 'All-In-One'." },
      { name: "brand", type: "VARCHAR(50)", constraints: "NOT NULL", description: "E.g. 'Dell', 'Lenovo', 'Apple', 'HP'." },
      { name: "model", type: "VARCHAR(50)", constraints: "NOT NULL", description: "Design model name or part number." },
      { name: "serial_number", type: "VARCHAR(100)", constraints: "NOT NULL", description: "Manufacturer serial key to verify distinct tracking." },
      { name: "issue_description", type: "TEXT", constraints: "NOT NULL", description: "Customer reported problems during register step." },
      { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP", description: "Date/Time registered." }
    ],
    sql: `CREATE TABLE devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  device_type VARCHAR(50) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  serial_number VARCHAR(100) NOT NULL,
  issue_description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  {
    name: "repair_tickets",
    description: "The core transactional workflow log of the CRSTMS. Orchestrates state, allocation, and diagnostics.",
    columns: [
      { name: "id", type: "INT AUTO_INCREMENT", constraints: "PRIMARY KEY", description: "Unique system Ticket ID." },
      { name: "customer_id", type: "INT", constraints: "NOT NULL, FOREIGN KEY", description: "Represents the customer requesting service." },
      { name: "device_id", type: "INT", constraints: "NOT NULL, FOREIGN KEY", description: "Specific hardware unit being repaired." },
      { name: "receptionist_id", type: "INT", constraints: "NOT NULL, FOREIGN KEY", description: "Who received and checked in the device." },
      { name: "technician_id", type: "INT", constraints: "NULL, FOREIGN KEY", description: "Assigned primary technician." },
      { name: "status", type: "ENUM", constraints: "NOT NULL, DEFAULT 'Created'", description: "Ticket status timeline: 'Created', 'Assigned', 'In Progress', 'Waiting for Spare Parts', 'Completed', 'Ready for Delivery', 'Delivered', 'Closed'." },
      { name: "estimated_completion_date", type: "DATE", constraints: "NULL", description: "Target deadline scheduled by receptionist or technician." },
      { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP", description: "Initial check-in point." },
      { name: "updated_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP", description: "Last state transition marker." }
    ],
    sql: `CREATE TABLE repair_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  device_id INT NOT NULL,
  receptionist_id INT NOT NULL,
  technician_id INT NULL,
  status ENUM('Created', 'Assigned', 'In Progress', 'Waiting for Spare Parts', 'Completed', 'Ready for Delivery', 'Delivered', 'Closed') NOT NULL DEFAULT 'Created',
  estimated_completion_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(user_id) ON DELETE RESTRICT,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  FOREIGN KEY (receptionist_id) REFERENCES receptionists(user_id) ON DELETE RESTRICT,
  FOREIGN KEY (technician_id) REFERENCES technicians(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  {
    name: "repair_updates",
    description: "Saves a detailed audit timeline of technician progress logs, comments, and internal diagnostic updates.",
    columns: [
      { name: "id", type: "INT AUTO_INCREMENT", constraints: "PRIMARY KEY", description: "Timeline update identifier." },
      { name: "ticket_id", type: "INT", constraints: "NOT NULL, FOREIGN KEY", description: "Related active ticket." },
      { name: "technician_id", type: "INT", constraints: "NOT NULL, FOREIGN KEY", description: "Staff member supplying notes." },
      { name: "update_status", type: "VARCHAR(50)", constraints: "NOT NULL", description: "E.g. 'Repairing Motherboard', 'Cleaned CPU Fan'." },
      { name: "diagnostic_notes", type: "TEXT", constraints: "NOT NULL", description: "Technical feedback and description of hardware action." },
      { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP", description: "Time update was posted." }
    ],
    sql: `CREATE TABLE repair_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  technician_id INT NOT NULL,
  update_status VARCHAR(50) NOT NULL,
  diagnostic_notes TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES repair_tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (technician_id) REFERENCES technicians(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  {
    name: "spare_parts",
    description: "Represents physical inventory catalog, tracking unit costs and triggering low-stock indicators.",
    columns: [
      { name: "id", type: "INT AUTO_INCREMENT", constraints: "PRIMARY KEY", description: "Item code designation." },
      { name: "part_name", type: "VARCHAR(100)", constraints: "NOT NULL", description: "E.g. 'Kingston 16GB DDR4 RAM', 'Crucial 500GB SSD'." },
      { name: "serial_number", type: "VARCHAR(100)", constraints: "UNIQUE, NOT NULL", description: "Manufacturer part identifier to cross-correlate items." },
      { name: "stock_quantity", type: "INT", constraints: "NOT NULL DEFAULT 0", description: "Remaining units physically in the workshop." },
      { name: "unit_price", type: "DECIMAL(10,2)", constraints: "NOT NULL", description: "Billing cost per single item unit." },
      { name: "low_stock_threshold", type: "INT", constraints: "NOT NULL DEFAULT 5", description: "Quantity ceiling triggering immediate dashboard warnings." },
      { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP", description: "Entry date." }
    ],
    sql: `CREATE TABLE spare_parts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  part_name VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100) UNIQUE NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  unit_price DECIMAL(10,2) NOT NULL,
  low_stock_threshold INT NOT NULL DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  {
    name: "inventory_logs",
    description: "Saves record adjustments and tracks physical part deductions. Crucial for tracing potential shrinkage.",
    columns: [
      { name: "id", type: "INT AUTO_INCREMENT", constraints: "PRIMARY KEY", description: "Adjustment tracking index." },
      { name: "part_id", type: "INT", constraints: "NOT NULL, FOREIGN KEY", description: "Related spare part." },
      { name: "user_id", type: "INT", constraints: "NOT NULL, FOREIGN KEY", description: "Employee performing replenishment or deduction." },
      { name: "quantity_changed", type: "INT", constraints: "NOT NULL", description: "Negative integers represent parts deducts, positive indicates rests." },
      { name: "action_type", type: "ENUM", constraints: "NOT NULL", description: "Action triggers: 'Restock', 'Used in Repair', 'Manual Adjust'." },
      { name: "notes", type: "TEXT", constraints: "NULL", description: "References Repair Ticket ID if item was used." },
      { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP", description: "Date of ledger action." }
    ],
    sql: `CREATE TABLE inventory_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  part_id INT NOT NULL,
  user_id INT NOT NULL,
  quantity_changed INT NOT NULL,
  action_type ENUM('Restock', 'Used in Repair', 'Manual Adjust') NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES spare_parts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  {
    name: "invoices",
    description: "Stores total labor and parts billing calculations. Formulates printable invoices (Offline Payments only).",
    columns: [
      { name: "id", type: "INT AUTO_INCREMENT", constraints: "PRIMARY KEY", description: "System invoice tag identifier." },
      { name: "ticket_id", type: "INT", constraints: "UNIQUE, NOT NULL, FOREIGN KEY", description: "Associated completed repair ticket." },
      { name: "service_cost", type: "DECIMAL(10,2)", constraints: "NOT NULL DEFAULT 0.00", description: "Labor and diagnostic fees designated." },
      { name: "spare_parts_cost", type: "DECIMAL(10,2)", constraints: "NOT NULL DEFAULT 0.00", description: "Total calculated cost of deducted parts." },
      { name: "tax_multiplier", type: "DECIMAL(5,2)", constraints: "NOT NULL DEFAULT 1.15", description: "E.g. standard 15% VAT." },
      { name: "total_amount", type: "DECIMAL(10,2)", constraints: "NOT NULL", description: "(service_cost + spare_parts_cost) * tax_multiplier." },
      { name: "payment_status", type: "ENUM", constraints: "NOT NULL DEFAULT 'Unpaid'", description: "Current status: 'Unpaid', 'Paid'." },
      { name: "invoice_date", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP", description: "Date billing statement was finalized." }
    ],
    sql: `CREATE TABLE invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT UNIQUE NOT NULL,
  service_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  spare_parts_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.15,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status ENUM('Unpaid', 'Paid') NOT NULL DEFAULT 'Unpaid',
  invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES repair_tickets(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  {
    name: "deliveries",
    description: "Tracks driver logs and status during device pickup and dropoffs back to clients.",
    columns: [
      { name: "id", type: "INT AUTO_INCREMENT", constraints: "PRIMARY KEY", description: "Unique tracking barcode key." },
      { name: "ticket_id", type: "INT", constraints: "NOT NULL, FOREIGN KEY REFERENCES repair_tickets(id)", description: "Active related repair ticket." },
      { name: "customer_id", type: "INT", constraints: "NOT NULL, FOREIGN KEY REFERENCES customers(user_id)", description: "Destination customer record." },
      { name: "device_id", type: "INT", constraints: "NOT NULL, FOREIGN KEY REFERENCES devices(id)", description: "System hardware object identifier." },
      { name: "delivery_personnel_id", type: "INT", constraints: "NULL, FOREIGN KEY REFERENCES delivery_personnel(user_id)", description: "Assigned delivery driver." },
      { name: "pickup_date", type: "DATETIME", constraints: "NULL", description: "Date device was collected from home or depot." },
      { name: "delivery_date", type: "DATETIME", constraints: "NULL", description: "Date unit reached destination." },
      { name: "status", type: "ENUM", constraints: "NOT NULL DEFAULT 'Pending'", description: "Transit status: 'Pending', 'Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Confirmed'." },
      { name: "notes", type: "TEXT", constraints: "NULL", description: "Driver logs, customer notes, or hand-over feedback codes." },
      { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP", description: "Timestamp." }
    ],
    sql: `CREATE TABLE deliveries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  customer_id INT NOT NULL,
  device_id INT NOT NULL,
  delivery_personnel_id INT NULL,
  pickup_date DATETIME NULL,
  delivery_date DATETIME NULL,
  status ENUM('Pending', 'Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Confirmed') NOT NULL DEFAULT 'Pending',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES repair_tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(user_id) ON DELETE CASCADE,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  FOREIGN KEY (delivery_personnel_id) REFERENCES delivery_personnel(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  {
    name: "inquiries",
    description: "Customer feedback and interaction queries, allowing customers to communicate with support staff.",
    columns: [
      { name: "id", type: "INT AUTO_INCREMENT", constraints: "PRIMARY KEY", description: "Inquiry ID." },
      { name: "customer_id", type: "INT", constraints: "NOT NULL, FOREIGN KEY REFERENCES customers(user_id)", description: "Submitting client." },
      { name: "subject", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Headline subject of customer concern." },
      { name: "message", type: "TEXT", constraints: "NOT NULL", description: "Customer inquiry or detail queries." },
      { name: "assigned_staff_id", type: "INT", constraints: "NULL, FOREIGN KEY REFERENCES users(id)", description: "Staff member allocated to inquiry." },
      { name: "status", type: "ENUM", constraints: "NOT NULL DEFAULT 'Open'", description: "State: 'Open', 'In Progress', 'Responded', 'Escalated', 'Closed'." },
      { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP", description: "Date submitted." },
      { name: "updated_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP", description: "Date responsive update occurred." }
    ],
    sql: `CREATE TABLE inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  assigned_staff_id INT NULL,
  status ENUM('Open', 'In Progress', 'Responded', 'Escalated', 'Closed') NOT NULL DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(user_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_staff_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  {
    name: "inquiry_responses",
    description: "Threaded conversations attached to inquiries for highly interactive client-employee communication tracking.",
    columns: [
      { name: "id", type: "INT AUTO_INCREMENT", constraints: "PRIMARY KEY", description: "Unique response ID." },
      { name: "inquiry_id", type: "INT", constraints: "NOT NULL, FOREIGN KEY REFERENCES inquiries(id)", description: "Parent inquiry record." },
      { name: "responder_id", type: "INT", constraints: "NOT NULL, FOREIGN KEY REFERENCES users(id)", description: "Active employee or customer replying." },
      { name: "response_text", type: "TEXT", constraints: "NOT NULL", description: "Message payload content." },
      { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP", description: "Post timestamp." }
    ],
    sql: `CREATE TABLE inquiry_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inquiry_id INT NOT NULL,
  responder_id INT NOT NULL,
  response_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE,
  FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  {
    name: "system_logs",
    description: "System transaction logs generated automatically upon all state updates, login audits, or stock adjust sequences.",
    columns: [
      { name: "id", type: "INT AUTO_INCREMENT", constraints: "PRIMARY KEY", description: "Increment check record." },
      { name: "user_id", type: "INT", constraints: "NULL, FOREIGN KEY REFERENCES users(id)", description: "Authenticated action triggers source." },
      { name: "action_type", type: "VARCHAR(100)", constraints: "NOT NULL", description: "Action key e.g. 'LOGIN', 'LOGOUT', 'CREATE_TICKET', 'UPDATE_DELIVERY'." },
      { name: "affected_module", type: "VARCHAR(100)", constraints: "NOT NULL", description: "E.g. 'Deliveries', 'Billing', 'Tickets', 'Inventory', 'Inquiries'." },
      { name: "reference_id", type: "VARCHAR(50)", constraints: "NULL", description: "Linked record primary key (e.g. ticket_id, delivery_id, invoice_id)." },
      { name: "details", type: "TEXT", constraints: "NOT NULL", description: "Verbose descriptive log string." },
      { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP", description: "Chronological point." }
    ],
    sql: `CREATE TABLE system_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action_type VARCHAR(100) NOT NULL,
  affected_module VARCHAR(100) NOT NULL,
  reference_id VARCHAR(50) NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  }
];
