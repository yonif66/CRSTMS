import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Cpu,
  Users,
  Package,
  Truck,
  Receipt,
  Mail,
  BarChart2,
  Shield,
  Settings,
  LogOut,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  Plus,
  Sun,
  Moon
} from "lucide-react";

import { User, Customer, Device, RepairTicket, SparePart, Delivery, Invoice, Inquiry, SystemLog, Technician, ReceiptUpload } from "./types";
import {
  INITIAL_CUSTOMERS,
  INITIAL_DEVICES,
  INITIAL_TICKETS,
  INITIAL_INVENTORY,
  INITIAL_DELIVERIES,
  INITIAL_INVOICES,
  INITIAL_INQUIRIES,
  INITIAL_LOGS,
  INITIAL_TECHNICIANS,
  INITIAL_RECEIPT_UPLOADS
} from "./initialData";

import { useTheme } from "./components/ThemeContext";
import { runSilentQATests } from "./silentQATests";
import LoginScreen from "./components/LoginScreen";
import DashboardView from "./components/DashboardView";
import TicketsView from "./components/TicketsView";
import CustomersView from "./components/CustomersView";
import InventoryView from "./components/InventoryView";
import InvoicesView from "./components/InvoicesView";
import DeliveriesView from "./components/DeliveriesView";
import SupportView from "./components/SupportView";
import ReportsView from "./components/ReportsView";
import AuditingView from "./components/AuditingView";
import TechniciansView from "./components/TechniciansView";
import SettingsView from "./components/SettingsView";
import CustomerPortalView from "./components/CustomerPortalView";

// Flush old local storage keys if seed version changed to reload clean Ethiopian sample data
const SEED_VERSION = "v4_ethiopian_100";
if (typeof window !== "undefined") {
  const currentVer = localStorage.getItem("crstms_seed_version");
  if (currentVer !== SEED_VERSION) {
    localStorage.removeItem("crstms_customers");
    localStorage.removeItem("crstms_devices");
    localStorage.removeItem("crstms_tickets");
    localStorage.removeItem("crstms_inventory");
    localStorage.removeItem("crstms_deliveries");
    localStorage.removeItem("crstms_invoices");
    localStorage.removeItem("crstms_inquiries");
    localStorage.removeItem("crstms_logs");
    localStorage.removeItem("crstms_technicians");
    localStorage.removeItem("crstms_registered_users");
    localStorage.removeItem("crstms_receipt_uploads");
    localStorage.removeItem("crstms_user_passwords");
    localStorage.removeItem("crstms_user"); // Reset logged-in session to align roles
    localStorage.setItem("crstms_seed_version", SEED_VERSION);
  }
}

export default function App() {
  
  const { theme, toggleTheme } = useTheme();

  // App auth states
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // List of registered accounts
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("crstms_registered_users");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const staff: User[] = [
      { id: 1, username: "girma@crstms.com", fullName: "Girma Hailu", role: "Admin" },
      { id: 2, username: "simret@crstms.com", fullName: "Simret Ayele", role: "Receptionist", desk: "Intake Station 01" },
      { id: 3, username: "abebe@crstms.com", fullName: "Abebe Chala", role: "Technician", speciality: "MicroSolder Repairs Specialists" },
      { id: 290, username: "dawit@crstms.com", fullName: "Dawit Alemu", role: "Technician", speciality: "Systems & Network Architectures" },
      { id: 291, username: "henok@crstms.com", fullName: "Henok Tadesse", role: "Technician", speciality: "Demographics & Intake Diagnostics" },
      { id: 5, username: "kaleab@crstms.com", fullName: "Kaleab Birhanu", role: "Delivery" }
    ];
    const customerUsers: User[] = INITIAL_CUSTOMERS.map(cust => ({
      id: 1000 + cust.id,
      username: cust.email,
      fullName: cust.full_name,
      role: "Customer"
    }));
    return [...staff, ...customerUsers];
  });

  const handleRemoteCustomerRegister = (fullName: string, email: string, phone: string, address: string, password_hash: string): boolean => {
    const normEmail = email.trim().toLowerCase();
    if (customers.some(c => c.email.toLowerCase() === normEmail) || registeredUsers.some(u => u.username.toLowerCase() === normEmail)) {
      alert(`Constraint violation: Account or email '${email}' already registered.`);
      return false;
    }

    const nextUserId = registeredUsers.length > 0 ? Math.max(...registeredUsers.map(u => u.id)) + 1 : 10;
    const newUser: User = {
      id: nextUserId,
      username: normEmail,
      fullName: fullName,
      role: "Customer"
    };

    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem("crstms_registered_users", JSON.stringify(updatedUsers));

    const nextCustId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 10;
    const newCustomer: Customer = {
      id: nextCustId,
      full_name: fullName,
      email: normEmail,
      phone: phone,
      address: address,
      active: true
    };
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);

    // Save passwords to mock databases
    const savedCredentials = localStorage.getItem("crstms_user_passwords");
    const credentials = savedCredentials ? JSON.parse(savedCredentials) : {
      "girma@crstms.com": "Admin123",
      "simret@crstms.com": "Reception123",
      "abebe@crstms.com": "Tech123",
      "hana@crstms.com": "Customer123",
      "kaleab@crstms.com": "Delivery123"
    };
    credentials[normEmail] = password_hash;
    localStorage.setItem("crstms_user_passwords", JSON.stringify(credentials));

    // Save entry in system log
    const nextLogId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    const regLog: SystemLog = {
      id: nextLogId,
      user_id: nextUserId,
      userName: fullName,
      action_type: "REGISTER",
      affected_module: "Customers",
      reference_id: String(nextCustId),
      details: `Customer registered account remotely: ${fullName} (${email}).`,
      created_at: new Date().toISOString()
    };
    setLogs([regLog, ...logs]);

    return true;
  };

  const handleRegisterRemoteTicket = (
    brand: string,
    model: string,
    deviceType: string,
    serialNumber: string,
    issueDescription: string,
    pickupRequired: boolean,
    altPhone: string,
    altAddress: string,
    deviceImg?: string
  ) => {
    const custEmail = loggedInUser?.username || "";
    const custProfile = customers.find(c => c.email.toLowerCase() === custEmail.toLowerCase());
    
    let custId = custProfile?.id || 4;
    let custName = loggedInUser?.fullName || "Hana Gebremedhin";

    // Create a new device record
    const nextDevId = devices.length > 0 ? Math.max(...devices.map(d => d.id)) + 1 : 1;
    const newDevice: Device = {
      id: nextDevId,
      customer_id: custId,
      device_type: deviceType,
      brand,
      model,
      serial_number: serialNumber || "SN-PENDING",
      issue_description: issueDescription,
      created_at: new Date().toISOString()
    };
    setDevices([newDevice, ...devices]);

    // Create a new repair ticket
    const nextTicketId = tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 101;
    const newTicket: RepairTicket = {
      id: nextTicketId,
      customer_id: custId,
      customer_name: custName,
      device_id: nextDevId,
      device_brand: brand,
      device_model: model,
      status: "Created",
      issue_description: issueDescription,
      logs: ["Remote repair request registered by client via customer portal.", `Delivery Method: ${pickupRequired ? "Request courier pickup" : "Bring device physically"}`],
      remote_request: true,
      pickup_required: pickupRequired,
      customer_address: altAddress || custProfile?.address || "Addis Ababa",
      contact_phone: altPhone || custProfile?.phone || "+251911000000",
      delivery_tracking_status: pickupRequired ? "Pending Pickup" : "None",
      request_source: "Remote Request",
      device_image: deviceImg
    };
    setTickets([newTicket, ...tickets]);

    // Create a delivery entry if the customer requested home pickup
    if (pickupRequired) {
      const nextDelivId = deliveries.length > 0 ? Math.max(...deliveries.map(d => d.id)) + 1 : 501;
      const newDelivery: Delivery = {
        id: nextDelivId,
        ticket_id: nextTicketId,
        customer_name: custName,
        shipping_destination: altAddress || custProfile?.address || "Addis Ababa",
        status: "In Transit", 
        courier: "Kaleab Birhanu",
        notes: `Remote customer pickup requisition. Contact Phone: ${altPhone || custProfile?.phone || "+251911000000"}`
      };
      setDeliveries([newDelivery, ...deliveries]);
    }

    // Save transaction in logs
    const nextLogId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    const reqLog: SystemLog = {
      id: nextLogId,
      user_id: loggedInUser?.id || 4,
      userName: custName,
      action_type: "REMOTE_REQUISITION",
      affected_module: "Tickets",
      reference_id: String(nextTicketId),
      details: `Client submitted remote ticket #${nextTicketId} for ${brand} ${model} (Pickup required: ${pickupRequired ? "Yes" : "No"}).`,
      created_at: new Date().toISOString()
    };
    setLogs([reqLog, ...logs]);

    alert("Success: Your remote computer repair request was dispatched successfully. Our technicians and delivery couriers have been notified!");
  };

  // State arrays keeping data locally
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem("crstms_customers");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_CUSTOMERS;
  });
  const [devices, setDevices] = useState<Device[]>(() => {
    const saved = localStorage.getItem("crstms_devices");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_DEVICES;
  });
  const [tickets, setTickets] = useState<RepairTicket[]>(() => {
    const saved = localStorage.getItem("crstms_tickets");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_TICKETS;
  });
  const [inventory, setInventory] = useState<SparePart[]>(() => {
    const saved = localStorage.getItem("crstms_inventory");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_INVENTORY;
  });
  const [deliveries, setDeliveries] = useState<Delivery[]>(() => {
    const saved = localStorage.getItem("crstms_deliveries");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_DELIVERIES;
  });
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem("crstms_invoices");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_INVOICES;
  });
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem("crstms_inquiries");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_INQUIRIES;
  });
  const [logs, setLogs] = useState<SystemLog[]>(() => {
    const saved = localStorage.getItem("crstms_logs");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_LOGS;
  });
  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem("crstms_technicians");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_TECHNICIANS;
  });

  const [receiptUploads, setReceiptUploads] = useState<ReceiptUpload[]>(() => {
    const saved = localStorage.getItem("crstms_receipt_uploads");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_RECEIPT_UPLOADS;
  });

  // Effects to persist to localStorage
  useEffect(() => {
    localStorage.setItem("crstms_receipt_uploads", JSON.stringify(receiptUploads));
  }, [receiptUploads]);
  useEffect(() => {
    localStorage.setItem("crstms_customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("crstms_devices", JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem("crstms_tickets", JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem("crstms_inventory", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("crstms_deliveries", JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem("crstms_invoices", JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem("crstms_inquiries", JSON.stringify(inquiries));
  }, [inquiries]);

  useEffect(() => {
    localStorage.setItem("crstms_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("crstms_technicians", JSON.stringify(technicians));
  }, [technicians]);

  // Run background verification checks on start (used for capstone evaluation tests)
  useEffect(() => {
    const qaReport = runSilentQATests();
    
    setLogs(prevLogs => {
      const alreadyLogged = prevLogs.some(l => l.action_type === "SYSTEM_VALIDATION");
      if (alreadyLogged) return prevLogs;

      const nextId = prevLogs.length > 0 ? Math.max(...prevLogs.map(l => l.id)) + 1 : 1;
      const validationAudit: SystemLog = {
        id: nextId,
        user_id: 0,
        userName: "SYSTEM DEFAULT",
        action_type: "SYSTEM_VALIDATION",
        affected_module: "UAT QA Runner",
        reference_id: "QA-UAT-VALIDATION",
        details: `Ran testing suite: Total tests: ${qaReport.stats.totalTests}, Passed: ${qaReport.stats.passed}, Failed: ${qaReport.stats.failed}. Success rate: ${qaReport.stats.successRate}. Ready for final project defense inspection.`,
        created_at: new Date().toISOString()
      };
      return [validationAudit, ...prevLogs];
    });
  }, []);

  // Restore logged in user session if page refreshed
  useEffect(() => {
    const savedUser = localStorage.getItem("crstms_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as User;
        setLoggedInUser(parsed);
        adjustRootTab(parsed);
      } catch (e) {
        localStorage.removeItem("crstms_user");
      }
    }
  }, []);

  const adjustRootTab = (user: User) => {
    if (user.role === "Technician") {
      setActiveTab("tickets");
    } else if (user.role === "Customer") {
      setActiveTab("support");
    } else if (user.role === "Delivery") {
      setActiveTab("deliveries");
    } else {
      setActiveTab("dashboard");
    }
  };

  const handleLogin = (user: User) => {
    setLoggedInUser(user);
    localStorage.setItem("crstms_user", JSON.stringify(user));
    adjustRootTab(user);
    
    // Add logging statement for user sign-in
    const newId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    const loginLog: SystemLog = {
      id: newId,
      user_id: user.id,
      userName: user.fullName,
      action_type: "LOGIN",
      affected_module: "Authentication",
      reference_id: String(user.id),
      details: `User ${user.fullName} (${user.role}) logged in.`,
      created_at: new Date().toISOString()
    };
    setLogs([loginLog, ...logs]);
  };

  const handleLogout = () => {
    if (loggedInUser) {
      const newId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
      const logoutLog: SystemLog = {
        id: newId,
        user_id: loggedInUser.id,
        userName: loggedInUser.fullName,
        action_type: "LOGOUT",
        affected_module: "Authentication",
        reference_id: String(loggedInUser.id),
        details: `User ${loggedInUser.fullName} logged out.`,
        created_at: new Date().toISOString()
      };
      setLogs([logoutLog, ...logs]);
    }
    setLoggedInUser(null);
    localStorage.removeItem("crstms_user");
  };

  // Add a new customer record
  const handleRegisterCustomer = (fullName: string, email: string, phone: string, address: string, altPhone?: string): boolean => {
    if (customers.some(c => c.email.toLowerCase() === email.toLowerCase())) {
      alert(`Error: A customer profile already exists with email '${email}'.`);
      return false;
    }

    const nextId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
    const newCustomer: Customer = {
      id: nextId,
      full_name: fullName,
      email,
      phone,
      address,
      alt_phone: altPhone,
      active: true
    };

    setCustomers([...customers, newCustomer]);

    // Save logs
    const logId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    const audit: SystemLog = {
      id: logId,
      user_id: loggedInUser?.id || 0,
      userName: loggedInUser?.fullName || "System Admin",
      action_type: "CREATE_CUSTOMER",
      affected_module: "Customers",
      reference_id: String(nextId),
      details: `Created customer profile for ${fullName} with ID ${nextId}.`,
      created_at: new Date().toISOString()
    };
    setLogs([audit, ...logs]);
    return true;
  };

  // Update repair ticket status
  const handleUpdateTicket = (ticketId: number, nextStatus: string, appendLog: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: nextStatus as any,
          logs: [...t.logs, `${loggedInUser?.fullName || "Operator"}: ${appendLog} [Status: ${nextStatus}]`]
        };
      }
      return t;
    }));

    // Add logging statement
    const logId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    const audit: SystemLog = {
      id: logId,
      user_id: loggedInUser?.id || 0,
      userName: loggedInUser?.fullName || "Technician",
      action_type: "UPDATE_TICKET",
      affected_module: "Tickets",
      reference_id: String(ticketId),
      details: `Updated Ticket #${ticketId} status to ${nextStatus}. Notes: ${appendLog}`,
      created_at: new Date().toISOString()
    };
    setLogs([audit, ...logs]);
  };

  // Create device and repair ticket at the intake desk
  const handleCreateTicketAndDevice = (custId: number, dType: string, brand: string, model: string, sn: string, issue: string) => {
    const customer = customers.find(c => c.id === custId);
    if (!customer) return;

    // Create device
    const devId = devices.length > 0 ? Math.max(...devices.map(d => d.id)) + 1 : 1;
    const newDevice: Device = {
      id: devId,
      customer_id: custId,
      device_type: dType,
      brand,
      model,
      serial_number: sn,
      issue_description: issue,
      created_at: new Date().toISOString()
    };
    setDevices([...devices, newDevice]);

    // Create ticket
    const ticketId = tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 101;
    const newTicket: RepairTicket = {
      id: ticketId,
      customer_id: custId,
      customer_name: customer.full_name,
      device_id: devId,
      device_brand: brand,
      device_model: model,
      status: "Created",
      issue_description: issue,
      logs: [`Opened Ticket By Intake operator, hardware SN asset logged: ${sn}`]
    };
    setTickets([...tickets, newTicket]);

    // Log ticket creator action
    const logId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    const audit: SystemLog = {
      id: logId,
      user_id: loggedInUser?.id || 0,
      userName: loggedInUser?.fullName || "Clerk",
      action_type: "CREATE_TICKET",
      affected_module: "Tickets",
      reference_id: String(ticketId),
      details: `Registered device and created ticket #${ticketId} for customer ${customer.full_name}.`,
      created_at: new Date().toISOString()
    };
    setLogs([audit, ...logs]);
  };

  // Assign a technician to a repair ticket
  const handleAssignTechnician = (ticketId: number, techName: string) => {
    // 1. Update matching repair ticket
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        if (t.technician_name === techName) return t;
        const newLogs = [...t.logs, `Assigned to technician "${techName}" by ${loggedInUser?.fullName || "Operator"}`];
        return { ...t, technician_name: techName, logs: newLogs };
      }
      return t;
    }));

    // 2. Adjust counter specs if mapped correctly
    setTechnicians(prev => prev.map(tech => {
      if (tech.name === techName) {
        return { ...tech, assignedTicketsCount: tech.assignedTicketsCount + 1 };
      }
      return tech;
    }));

    // 3. Log technician assignment event
    const logId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    const audit: SystemLog = {
      id: logId,
      user_id: loggedInUser?.id || 0,
      userName: loggedInUser?.fullName || "System Admin",
      action_type: "ASSIGN_TECHNICIAN",
      affected_module: "Tickets",
      reference_id: String(ticketId),
      details: `Assigned technician ${techName} to Repair Ticket #${ticketId}.`,
      created_at: new Date().toISOString()
    };
    setLogs([audit, ...logs]);
  };

  // Modifies spare part count in stock
  const handleModifyStock = (partId: number, adjustment: number) => {
    let affectedPartName = "";
    setInventory(prev => prev.map(p => {
      if (p.id === partId) {
        affectedPartName = p.part_name;
         const targetQty = Math.max(0, p.stock_quantity + adjustment);
        return { ...p, stock_quantity: targetQty };
      }
      return p;
    }));

    // Log stock level updates
    const logId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    const audit: SystemLog = {
      id: logId,
      user_id: loggedInUser?.id || 0,
      userName: loggedInUser?.fullName || "Inventory Manager",
      action_type: adjustment > 0 ? "ADD_STOCK" : "DEDUCT_PART",
      affected_module: "Inventory",
      reference_id: String(partId),
      details: `Adjusted stock for ${affectedPartName} (ID: ${partId}) by ${adjustment}.`,
      created_at: new Date().toISOString()
    };
    setLogs([audit, ...logs]);
  };

  // Add new spare part category
  const handleRegisterPart = (partName: string, sn: string, initialQty: number, price: number, threshold: number): boolean => {
    if (inventory.some(p => p.serial_number.toLowerCase() === sn.toLowerCase())) {
      alert(`Constraint violation: Stock component already registered beneath SKU '${sn}'.`);
      return false;
    }

    const nextId = inventory.length > 0 ? Math.max(...inventory.map(p => p.id)) + 1 : 1;
    const newPart: SparePart = {
      id: nextId,
      part_name: partName,
      serial_number: sn,
      stock_quantity: initialQty,
      unit_price: price,
      low_stock_threshold: threshold
    };
    setInventory([...inventory, newPart]);

    // Log item creation
    const logId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    const audit: SystemLog = {
      id: logId,
      user_id: loggedInUser?.id || 0,
      userName: loggedInUser?.fullName || "Inventory Clerk",
      action_type: "CREATE_PART",
      affected_module: "Inventory",
      reference_id: String(nextId),
      details: `Added new spare part ${partName} with barcode SKU: ${sn}.`,
      created_at: new Date().toISOString()
    };
    setLogs([audit, ...logs]);
    return true;
  };

  // Toggle payment status of invoice between paid and unpaid
  const handleTogglePayment = (invoiceId: number) => {
    let nextState = "";
    setInvoices(prev => prev.map(i => {
      if (i.id === invoiceId) {
        nextState = i.payment_status === "Paid" ? "Unpaid" : "Paid";
        return { ...i, payment_status: nextState as any };
      }
      return i;
    }));

    // Log billing update
    const logId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    const audit: SystemLog = {
      id: logId,
      user_id: loggedInUser?.id || 0,
      userName: loggedInUser?.fullName || "Billing Admin",
      action_type: "PAY_INVOICE",
      affected_module: "Invoices",
      reference_id: String(invoiceId),
      details: `Set payment status for invoice #${invoiceId} to ${nextState}.`,
      created_at: new Date().toISOString()
    };
    setLogs([audit, ...logs]);
  };

  // Approve or reject uploaded payment slips
  const handleVerifyReceipt = (uploadId: number, status: "Approved" | "Rejected", notes: string) => {
    setReceiptUploads(prev => prev.map(up => {
      if (up.id === uploadId) {
        if (status === "Approved") {
          setInvoices(prevInv => prevInv.map(inv => {
            if (inv.id === up.invoice_id) {
              return { ...inv, payment_status: "Paid" };
            }
            return inv;
          }));
        }
        return {
          ...up,
          status,
          approved_by: loggedInUser?.fullName || "Staff",
          approval_notes: notes
        };
      }
      return up;
    }));

    // Log verification status
    const targetUpload = receiptUploads.find(u => u.id === uploadId);
    if (targetUpload) {
      const nextLogId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
      const decLog: SystemLog = {
        id: nextLogId,
        user_id: loggedInUser?.id || 0,
        userName: loggedInUser?.fullName || "Staff",
        action_type: status === "Approved" ? "APPROVE_RECEIPT" : "REJECT_RECEIPT",
        affected_module: "Invoices",
        reference_id: String(targetUpload.invoice_id),
        details: `${status === "Approved" ? "Approved" : "Rejected"} payment receipt verification for: '${targetUpload.uploaded_filename}' on Invoice #${targetUpload.invoice_id}. Notes: ${notes}`,
        created_at: new Date().toISOString()
      };
      setLogs(prevLogs => [decLog, ...prevLogs]);
    }
  };

  // Generate invoice bill based on service fee and parts consumed
  const handleGenerateInvoice = (ticketId: number, serviceCost: number): boolean => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return false;

    const customer = customers.find(c => c.id === ticket.customer_id);
    const device = devices.find(d => d.id === ticket.device_id);
    if (!customer) return false;

    // Accumulate total cost of spare parts used in repair
    const partsUsed = ticket.logs
      .filter(l => l.includes("Part Consumed:"))
      .map(l => {
        const name = l.replace("Part Consumed: -1x ", "").trim();
        return inventory.find(i => i.part_name === name);
      })
      .filter(Boolean);
    const partsSum = partsUsed.reduce((acc, p) => acc + (p?.unit_price || 0), 0);

    const subTotal = serviceCost + partsSum;
    const grandTotal = subTotal * 1.15; // 15% VAT

    const nextId = invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 801;
    const newInvoice: Invoice = {
      id: nextId,
      ticket_id: ticketId,
      customer_id: customer.id,
      customer_name: customer.full_name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      customer_address: customer.address,
      device_brand: ticket.device_brand,
      device_model: ticket.device_model,
      device_type: device?.device_type || "Laptop",
      device_serial: device?.serial_number || "SN-UNKNOWN",
      technician_name: loggedInUser?.fullName || "Abebe Chala",
      service_cost: serviceCost,
      spare_parts_cost: partsSum,
      tax_multiplier: 1.15,
      total_amount: grandTotal,
      payment_status: "Unpaid",
      invoice_date: new Date().toISOString()
    };

    setInvoices([...invoices, newInvoice]);

    // Log invoice generation bill
    const logId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    const audit: SystemLog = {
      id: logId,
      user_id: loggedInUser?.id || 0,
      userName: loggedInUser?.fullName || "Billing Admin",
      action_type: "GENERATE_INVOICE",
      affected_module: "Invoices",
      reference_id: String(nextId),
      details: `Generated invoice #${nextId} for repair ticket #${ticketId} with total ${grandTotal.toFixed(2)} Br.`,
      created_at: new Date().toISOString()
    };
    setLogs([audit, ...logs]);
    return true;
  };

  // Courier dispatcher setup
  const handleDispatchDelivery = (ticketId: number, dest: string, courier: string, notes: string): boolean => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return false;

    const nextId = deliveries.length > 0 ? Math.max(...deliveries.map(d => d.id)) + 1 : 501;
    const newDelivery: Delivery = {
      id: nextId,
      ticket_id: ticketId,
      customer_name: ticket.customer_name,
      shipping_destination: dest,
      status: "In Transit",
      courier,
      notes
    };

    setDeliveries([...deliveries, newDelivery]);

    // Log delivery schedule dispatch
    const logId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    const audit: SystemLog = {
      id: logId,
      user_id: loggedInUser?.id || 0,
      userName: loggedInUser?.fullName || "Logistics Dispatcher",
      action_type: "DISPATCH_DELIVERY",
      affected_module: "Deliveries",
      reference_id: String(nextId),
      details: `Delivery dispatched for ticket #${ticketId} with courier ${courier} to ${ticket.customer_name}.`,
      created_at: new Date().toISOString()
    };
    setLogs([audit, ...logs]);
    return true;
  };

  // Update transit task status to Handed Over
  const handleToggleDeliveryStatus = (deliveryId: number) => {
    setDeliveries(prev => prev.map(d => {
      if (d.id === deliveryId) {
        return { ...d, status: "Handed Over" };
      }
      return d;
    }));

    // Log delivery update
    const logId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    const audit: SystemLog = {
      id: logId,
      user_id: loggedInUser?.id || 0,
      userName: loggedInUser?.fullName || "Logistics Driver",
      action_type: "UPDATE_DELIVERY",
      affected_module: "Deliveries",
      reference_id: String(deliveryId),
      details: `Delivery #${deliveryId} marked as handed over.`,
      created_at: new Date().toISOString()
    };
    setLogs([audit, ...logs]);
  };

  // Reply to client support messages
  const handleAnswerInquiry = (inqId: number, response: string) => {
    setInquiries(prev => prev.map(i => {
      if (i.id === inqId) {
        return { ...i, responseText: response, status: "Responded" };
      }
      return i;
    }));

    // Log inquiry reply
    const logId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    const audit: SystemLog = {
      id: logId,
      user_id: loggedInUser?.id || 0,
      userName: loggedInUser?.fullName || "Support Assistant",
      action_type: "ANSWER_INQUIRY",
      affected_module: "Inquiries",
      reference_id: String(inqId),
      details: `Replied to inquiry #${inqId} and updated status to Responded.`,
      created_at: new Date().toISOString()
    };
    setLogs([audit, ...logs]);
  };

  // Let client submit a support inquiry message
  const handleClientSubmitInquiry = (msg: string) => {
    if (!loggedInUser || !msg.trim()) return;

    const nextId = inquiries.length > 0 ? Math.max(...inquiries.map(i => i.id)) + 1 : 1;
    const newInq: Inquiry = {
      id: nextId,
      customerId: loggedInUser.id,
      clientName: loggedInUser.fullName,
      messageText: msg,
      responseText: "",
      status: "Received"
    };

    setInquiries([...inquiries, newInq]);

    // Log client support message submission
    const logId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    const audit: SystemLog = {
      id: logId,
      user_id: loggedInUser.id,
      userName: loggedInUser.fullName,
      action_type: "SUBMIT_INQUIRY",
      affected_module: "Inquiries",
      reference_id: String(nextId),
      details: `Customer ${loggedInUser.fullName} submitted support inquiry.`,
      created_at: new Date().toISOString()
    };
    setLogs([audit, ...logs]);
    alert("Inquiry sent directly to our staff! Replies will appear below.");
  };

  // Login filter redirection check
  if (!loggedInUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        customUsers={registeredUsers}
        onRegisterCustomer={handleRemoteCustomerRegister}
      />
    );
  }

  // Filtered menus lists based on operator role permissions
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "Receptionist"] },
    { id: "tickets", label: "Repair Tickets", icon: Cpu, roles: ["Admin", "Receptionist", "Technician"] },
    { id: "customers", label: "Customers", icon: Users, roles: ["Admin", "Receptionist"] },
    { id: "inventory", label: "Parts & Inventory", icon: Package, roles: ["Admin", "Receptionist"] },
    { id: "technicians", label: "Technicians", icon: Users, roles: ["Admin", "Receptionist"] },
    { id: "deliveries", label: "Deliveries & Logistics", icon: Truck, roles: ["Admin", "Receptionist", "Delivery"] },
    { id: "invoices", label: "Invoices & Billing", icon: Receipt, roles: ["Admin", "Receptionist"] },
    { id: "support", label: "Customer Support", icon: Mail, roles: ["Admin", "Receptionist", "Customer"] },
    { id: "reports", label: "Reports & Analytics", icon: BarChart2, roles: ["Admin", "Receptionist"] },
    { id: "logs", label: "Operations Logs", icon: Shield, roles: ["Admin", "Receptionist"] },
    { id: "settings", label: "System Settings", icon: Settings, roles: ["Admin"] }
  ];

  const allowedMenus = menuItems.filter(item => item.roles.includes(loggedInUser.role));

  return (
    <div className="min-h-screen bg-[#0d1017] text-slate-300 font-sans flex text-xs select-none">
      
      {/* MOBILE HEADER BUTTONS */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-12 bg-slate-900 border-b border-slate-800 z-50 flex items-center justify-between px-4">
        <span className="font-bold text-amber-500 font-display">CRSTMS</span>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded border border-slate-700 cursor-pointer flex items-center justify-center transition"
            title={theme === "light" ? "Switch to Night Mode" : "Switch to Day Mode"}
          >
            {theme === "light" ? <Moon size={14} className="text-amber-500" /> : <Sun size={14} className="text-amber-400" />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* LEFT NAVIGATION SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 bg-slate-900 border-r border-slate-800/80 w-64 z-40 transform transition-transform duration-250 ease-in-out md:translate-x-0 md:static ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } flex flex-col pt-12 md:pt-0 shrink-0`}>
        
        {/* Title branding logo details */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/45 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-bold text-slate-950">
              <Cpu size={16} />
            </div>
            <div className="space-y-0.5 text-left">
              <h1 className="text-sm font-extrabold tracking-tight text-white font-display">CRSTMS Ethiopia</h1>
              <p className="text-[10px] text-slate-500 font-mono">v1.0.0 - Capstone</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-1.5 bg-slate-950/40 hover:bg-slate-850/80 text-slate-400 hover:text-white rounded border border-slate-800/80 cursor-pointer flex items-center justify-center transition"
            title={theme === "light" ? "Switch to Night Mode" : "Switch to Day Mode"}
          >
            {theme === "light" ? <Moon size={14} className="text-amber-500" /> : <Sun size={14} className="text-amber-400" />}
          </button>
        </div>

        {/* Profile drawer miniature */}
        <div className="p-4 border-b border-slate-850 bg-slate-950/20 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold flex items-center justify-center text-sm shrink-0">
              {loggedInUser.fullName.charAt(0)}
            </div>
            <div className="space-y-0.5 min-w-0">
              <h2 className="text-xs font-bold text-white font-sans truncate" title={loggedInUser.fullName}>{loggedInUser.fullName}</h2>
              <span className="text-[9px] font-mono leading-none font-bold text-slate-500 border border-slate-800 rounded px-1.5 py-0.5 bg-slate-900 uppercase">
                {loggedInUser.role} Portal
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic menus lists items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 hover:scrollbar-thin text-left">
          {allowedMenus.map(menu => {
            const IconComp = menu.icon;
            const isActive = activeTab === menu.id;
            return (
              <button
                key={menu.id}
                onClick={() => { setActiveTab(menu.id); setSidebarOpen(false); }}
                className={`w-full px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-3 cursor-pointer transition-all ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/5"
                    : "text-slate-400 hover:text-white hover:bg-slate-850/80"
                }`}
              >
                <IconComp size={15} />
                <span>{menu.label}</span>
              </button>
            );
          })}
        </div>

        {/* Logout session buttons */}
        <div className="p-4 border-t border-slate-850 bg-slate-950/25">
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-slate-950 hover:bg-red-950/40 hover:border-red-500/30 text-slate-400 hover:text-red-400 font-bold border border-slate-850 rounded-lg text-xs cursor-pointer flex items-center justify-center gap-2 transition-all"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>

      </div>

      {/* DETAILED CONTENT VIEWS MODULES */}
      <div className="flex-1 min-w-0 pt-16 md:pt-0 p-6 overflow-y-auto max-w-7xl mx-auto space-y-6">
        
        {/* Render Customer workflow if logged in beneath Client view */}
        {loggedInUser.role === "Customer" && activeTab === "support" ? (
          <CustomerPortalView
            user={loggedInUser}
            tickets={tickets}
            customers={customers}
            invoices={invoices}
            inquiries={inquiries}
            onRegisterRemoteTicket={handleRegisterRemoteTicket}
            onSubmitInquiry={handleClientSubmitInquiry}
          />
        ) : loggedInUser.role === "Technician" && activeTab === "tickets" ? (
          
          <div className="space-y-6 text-left">
            {/* Header */}
            <div className="pb-3 border-b border-slate-800/80">
              <h2 className="text-xl font-bold text-white font-display">My Technician diagnostics Queue</h2>
              <p className="text-xs text-slate-400">Review jobs assigned to {loggedInUser.fullName}, post solder bench remarks, and log completed SKUs.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Workloads details */}
              <div className="lg:col-span-2 space-y-6">
                
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Assigned Repair Tickets Directory</h3>
                  
                  <div className="space-y-3">
                    {tickets
                      .filter(t => t.technician_name === loggedInUser.fullName) // Show assigned technician tickets
                      .map(t => (
                        <div key={t.id} className="p-4 bg-slate-955 rounded-xl border border-slate-850 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs font-sans text-left">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-amber-500 font-bold">REF #{t.id}</span>
                            <h4 className="font-bold text-white">{t.customer_name} — {t.device_brand} {t.device_model}</h4>
                            <p className="text-slate-400 text-[11px] italic">&ldquo;{t.issue_description}&rdquo;</p>
                          </div>

                          <div className="flex sm:flex-col items-end gap-2 shrink-0">
                            <span className="text-[10px] bg-slate-900 px-2 py-0.5 border border-slate-800 rounded-full font-bold font-mono text-amber-500">
                              {t.status}
                            </span>
                            
                            <button
                              onClick={() => {
                                const notes = prompt(`Append work log for Ticket #${t.id}:`);
                                if (notes) {
                                  handleUpdateTicket(t.id, "In Progress", notes);
                                }
                              }}
                              className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded hover:bg-amber-600 transition-colors cursor-pointer text-[11px]"
                            >
                              Log Update
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

              </div>

              {/* Inventory quick checks */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 text-xs text-left">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Package size={14} className="text-amber-500" />
                  Spare Parts Log Consumption
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans">Submit used component assets to automatically adjust levels &amp; feed custom bill invoices.</p>
                
                <div className="space-y-2">
                  {inventory.map(part => (
                    <div key={part.id} className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex justify-between items-center font-mono text-[11px]">
                      <div>
                        <span className="font-semibold text-slate-300 block">{part.part_name}</span>
                        <span className="text-[10px] text-slate-500">Stock: {part.stock_quantity} left</span>
                      </div>
                      
                      <button
                        onClick={() => {
                          const conf = window.confirm(`Deduct 1 unit of '${part.part_name}' for ticket log assignment?`);
                          if (conf) {
                            handleModifyStock(part.id, -1);
                          }
                        }}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 hover:border-amber-500 text-slate-400 hover:text-white rounded border border-slate-800 font-bold cursor-pointer transition-colors"
                      >
                        Log Consumption
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        ) : (
          
          /* BACKOFFICE / DYNAMIC TAB VIEW ROUTER */
          <div>
            {activeTab === "dashboard" && (
              <DashboardView
                tickets={tickets}
                customers={customers}
                inventory={inventory}
                deliveries={deliveries}
                logs={logs}
                user={loggedInUser}
              />
            )}

            {activeTab === "tickets" && (
              <TicketsView
                tickets={tickets}
                customers={customers}
                devices={devices}
                user={loggedInUser}
                technicians={technicians}
                onAssignTechnician={handleAssignTechnician}
                onUpdateTicket={handleUpdateTicket}
                onCreateTicketAndDevice={handleCreateTicketAndDevice}
              />
            )}

            {activeTab === "customers" && (
              <CustomersView
                customers={customers}
                devices={devices}
                tickets={tickets}
                inventory={inventory}
                onRegisterCustomer={handleRegisterCustomer}
              />
            )}

            {activeTab === "inventory" && (
              <InventoryView
                inventory={inventory}
                user={loggedInUser}
                onModifyStock={handleModifyStock}
                onRegisterPart={handleRegisterPart}
              />
            )}

            {activeTab === "technicians" && (
              <TechniciansView
                technicians={technicians}
              />
            )}

            {activeTab === "deliveries" && (
              <DeliveriesView
                deliveries={deliveries}
                tickets={tickets}
                user={loggedInUser}
                onDispatchDelivery={handleDispatchDelivery}
                onToggleDeliveryStatus={handleToggleDeliveryStatus}
              />
            )}

            {activeTab === "invoices" && (
              <InvoicesView
                invoices={invoices}
                tickets={tickets}
                inventory={inventory}
                user={loggedInUser}
                onTogglePayment={handleTogglePayment}
                onGenerateInvoice={handleGenerateInvoice}
                receiptUploads={receiptUploads}
                onVerifyReceipt={handleVerifyReceipt}
              />
            )}

            {activeTab === "support" && (
              <SupportView
                inquiries={inquiries}
                user={loggedInUser}
                onAnswerInquiry={handleAnswerInquiry}
              />
            )}

            {activeTab === "reports" && (
              <ReportsView
                invoices={invoices}
                tickets={tickets}
                inventory={inventory}
              />
            )}

            {activeTab === "logs" && (
              <AuditingView
                logs={logs}
              />
            )}

            {activeTab === "settings" && (
              loggedInUser.role === "Admin" ? (
                <SettingsView user={loggedInUser} />
              ) : (
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-4 text-xs font-sans">
                  <div className="w-16 h-16 bg-red-500/15 text-red-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold border border-red-500/20">
                    !
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Access Denied: Administrative Clearance Required</h3>
                  <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                    Security rules prevent role '{loggedInUser.role}' from loading the SMTP database settings and backoffice system configuration parameters.
                  </p>
                </div>
              )
            )}
          </div>

        )}

      </div>

    </div>
  );
}
