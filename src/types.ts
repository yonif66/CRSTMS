export interface User {
  id: number;
  username: string;
  fullName: string;
  role: "Admin" | "Receptionist" | "Technician" | "Customer" | "Delivery";
  desk?: string;
  speciality?: string;
}

export interface Customer {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  alt_phone?: string;
  active: boolean;
}

export interface Device {
  id: number;
  customer_id: number;
  device_type: string;
  brand: string;
  model: string;
  serial_number: string;
  issue_description: string;
  created_at: string;
}

export interface RepairTicket {
  id: number;
  customer_id: number;
  customer_name: string;
  device_id: number;
  device_brand: string;
  device_model: string;
  status: "Created" | "In Progress" | "Waiting for Spare Parts" | "Completed";
  issue_description: string;
  logs: string[];
  technician_name?: string;
  remote_request?: boolean;
  pickup_required?: boolean;
  customer_address?: string;
  contact_phone?: string;
  delivery_tracking_status?: "None" | "Pending Pickup" | "Picked Up" | "In Repair" | "Ready for Return" | "In Return Transit" | "Completed" | "Handed Over";
  request_source?: "Walk-in" | "Remote Request";
  device_image?: string;
  created_at?: string;
}

export interface SparePart {
  id: number;
  part_name: string;
  serial_number: string;
  stock_quantity: number;
  unit_price: number;
  low_stock_threshold: number;
}

export interface Delivery {
  id: number;
  ticket_id: number;
  customer_name: string;
  shipping_destination: string;
  status: "In Transit" | "Handed Over";
  courier: string;
  notes: string;
}

export interface Invoice {
  id: number;
  ticket_id: number;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  device_brand: string;
  device_model: string;
  device_type: string;
  device_serial: string;
  technician_name: string;
  service_cost: number;
  spare_parts_cost: number;
  tax_multiplier: number;
  total_amount: number;
  payment_status: "Paid" | "Unpaid";
  invoice_date: string;
}

export interface Inquiry {
  id: number;
  customerId: number;
  clientName: string;
  messageText: string;
  responseText: string;
  status: "Received" | "Responded";
}

export interface InquiryResponse {
  id: number;
  inquiry_id: number;
  responder_id: number;
  responder_name: string;
  response_text: string;
  created_at: string;
}

export interface SystemLog {
  id: number;
  user_id: number;
  userName: string;
  action_type: string;
  affected_module: string;
  reference_id: string;
  details: string;
  created_at: string;
}

export interface Technician {
  id: number;
  name: string;
  speciality: string;
  availability: "Available" | "On Leave" | "Busy";
  assignedTicketsCount: number;
  desk: string;
}

export interface ReceiptUpload {
  id: number;
  invoice_id: number;
  customer_name: string;
  uploaded_filename: string;
  uploaded_at: string;
  status: "Approved" | "Pending" | "Rejected";
  approved_by?: string;
  approval_notes?: string;
}
