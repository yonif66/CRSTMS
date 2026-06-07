# Computer Repair Service Tracking & Management System (CRSTMS)

### Addis Ababa University  
### College of Natural and Computational Sciences  
### Department of Computer Science  
### Software Engineering Capstone Project  

---

> [!IMPORTANT]  
> **System login credentials for all user roles are available in SYSTEM_CREDENTIALS.txt**  
> Please consult that file first to log in under different roles (Admin, Receptionist, Technician, Delivery, or Customer) and test the respective features of the platform.

---

## 📌 Project Overview
The **Computer Repair Service Tracking & Management System (CRSTMS)** is a full-stack web application designed to automate and streamline the day-to-day operations of modern computer repair centers in Ethiopia. 

Historically, repair workshops in Addis Ababa (especially around Bole, Megenagna, CMC, and Gerji) have relied on manual ticketing, paper invoices, and informal telephone conversations. This lack of centralized tracking often leads to lost repair histories, poor inventory management, delayed delivery schedules, and disputes regarding pricing and spare parts.

CRSTMS solves these core operational bottlenecks by organizing repair intakes, tracking component inventory, computing service costs with mandatory Ethiopian VAT (15%), managing dispatch couriers, and offering a interactive portal where customers can monitor their repair tickets and submit service requests.

---

## 🚀 Key Features

* **Role-Based Access Control (RBAC):** High-security routing and restricted interface views for five distinct organizational roles.
* **Customer Management:** Registration and management of repair clients mapped directly to Ethio Telecom contact shapes (Phone format: `+2519` / `09` / `07`).
* **Repair Ticket Management:** Complete lifecycle tracking from device check-in, diagnosis, progress updating, parts deduction, invoicing, and handover.
* **Device Tracking:** Unique hardware specifications profiling incorporating serial numbers, manufacturer types, and hardware categories.
* **Technician Assignment:** Workflow distribution manager allowing receptionists and admins to prompt assigned technicians to handle tasks.
* **Inventory Management:** Live tracking of spare parts (e.g., SSDs, laptop displays, RAM sticks) with safety threshold alert limits and restock alarms.
* **Billing & Invoicing:** Automatic calculation of parts cost + service labor fees, including a 15% Ethiopian VAT calculation check.
* **Receipt Upload & Verification:** Customer portal utility allowing clients to upload payment bank transfers and check slip files for administrative approval.
* **Delivery & Logistics Manifest:** Scheduled home pickups and courier dispatches with status trackers (Pend, Dispatched, Handed Over).
* **Reports & Analytics:** Performance dashboards showing cumulative monthly revenue, repair completion success rates, and stock alerts.
* **System Operations Logs:** Detailed tracking of every user login, parts update, ticket progress modification, and administrative action.
* **Responsive Day/Night Theme:** High-contrast user interface modes designed to reduce eye fatigue during long hours of operation at repair desks.

---

## 👥 User Roles & Permissions

1. **Administrator (Admin):**  
   * Full access to system diagnostics, financial analytics, system settings, inventory management, registration databases, and auditing logs.
2. **Receptionist:**  
   * Registers incoming customers, checks in devices, spawns repair tickets, processes billing invoices, handles incoming customer inquiries, and manages delivery dispatches.
3. **Technician:**  
   * Accesses a customized workspace showing only assigned tickets, logs repair actions, marks components consumed during diagnostics, and advances ticket status.
4. **Delivery Personnel:**  
   * Monitors active logistics schedules, views delivery destination locations, and marks deliveries as handed over with electronic receipt confirmations.
5. **Customer (Client Portal):**  
   * Requests remote repair services, inputs hardware profiles, tracks the physical progress of active tickets, views invoices, uploads banks transfer screenshots, and submits inquiries to the helpdesk.

---

## 🛠️ Technology Stack

### Frontend Client
* **React 19 + TypeScript:** Strong, scalable typescript-safe component trees.
* **Tailwind CSS:** Fully responsive mobile-friendly dashboard styling.
* **Lucide React:** Minimalist, consistent iconography.
* **Motion Library:** Smooth, fluid page changes and tab route animations.

### Backend Routing (Academic Design Model)
* **PHP 8 OOP MVC Architecture:** Custom Object-Oriented PHP controllers, models, and middlewares ensuring proper request-response cycles, data validation, and controller logic isolation.

### Database Layer
* **MySQL / SQLite:** Relational schema enforcing standard foreign key constraints, index lookups, and transactional data integrity matching requirements engineering matrices.

### Development Tools
* **Vite:** Next-generation fast frontend building tool.
* **Git & GitHub:** Full revision histories and modular branch workflows.

---

## 📁 Project Folder Structure

```txt
├── backend/                  # PHP OOP MVC Backend implementation files
│   ├── app/
│   │   ├── controllers/      # Handles business logic and request parameters
│   │   ├── core/             # Base MVC classes (App, Controller, Database)
│   │   ├── middleware/       # Role-based validation guard sessions
│   │   ├── models/           # Encapsulated SQL database queries
│   │   └── views/            # Academic PHP template views
│   ├── config/               # Database properties and parameters
│   └── database/             # Raw SQL migration templates and seeds
├── src/                      # Modern React Single-Page-Application Frontend
│   ├── components/           # Extracted modular React interface panels
│   ├── App.tsx               # Primary app controller managing simulation buffers
│   ├── silentQATests.ts      # Unit tests performing regression verification
│   ├── types.ts              # Common TypeScript Interfaces & Enums
│   ├── data.ts               # Localized Ethiopian metadata variables
│   └── main.tsx              # React mounting root
└── index.html                # Main template entrypoint URL
```

---

## ⚙️ Installation & Setup

Please follow the detailed step-by-step instructions inside **INSTALLATION_GUIDE.txt** to run this project in both development and server staging environments.

For information regarding schema layout and importing the required tables, consult **DATABASE_SETUP.txt**.

---

## 🔑 Default Accounts & Testing
The system comes pre-configured with active demonstration accounts for evaluation purposes. 

Please view **SYSTEM_CREDENTIALS.txt** to retrieve the correct usernames and passwords for testing different viewpoints (Admins, reception staff, repair technicians, couriers, and customers).

---

## 📸 System Interface Preview

Below are the primary views mapped out for system defense:
* **Login Module:** Tabbed interface separating Staff and Customer login screens.
* **Dashboard Panel:** Revenue telemetry charts, active ticket rates, and stock status listings.
* **Ticket Manager Desk:** Status dropdown updates, parts deduction logs, and technician assignments.
* **Inventory Catalog:** Safe buffer threshold triggers, serial records, and unit price cards.
* **Reports Sheet:** Financial breakdown reports with aggregated 15% VAT calculations.

---

## 🔮 Future Enhancements
* **SMS Integration:** Automated updates to customer phone numbers via Ethio Telecom SMS APIs.
* **Extended Diagnostics:** Automatic retrieval of system specifications via downloadable desktop agent scripts.
* **Advanced Reports Mapping:** Exporting financial billing statements straight to regional Ethiopian Revenue Authority formats.

---

## 🎓 Academic Notice
This system has been successfully developed as a **Software Engineering Capstone Project** demonstrating practical adherence to standard software lifecycle requirements: requirements gathering, relational entity modeling, layered architectural design (MVC), secure role separation, test documentation, and responsive interface compilation. 

Developed by a Software Engineering student team in Ethiopia.
