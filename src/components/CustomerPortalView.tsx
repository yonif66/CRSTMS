import * as React from "react";
import { useState } from "react";
import { 
  Clock, 
  Receipt, 
  Mail, 
  Plus, 
  Truck, 
  Laptop, 
  Smartphone, 
  Monitor, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  UserCheck
} from "lucide-react";
import { RepairTicket, Customer, Invoice, Inquiry, User } from "../types";

interface CustomerPortalViewProps {
  user: User;
  tickets: RepairTicket[];
  customers: Customer[];
  invoices: Invoice[];
  inquiries: Inquiry[];
  onRegisterRemoteTicket: (
    brand: string,
    model: string,
    deviceType: string,
    serialNumber: string,
    issueDescription: string,
    pickupRequired: boolean,
    altPhone: string,
    altAddress: string,
    deviceImg?: string
  ) => void;
  onSubmitInquiry: (msg: string) => void;
}

export default function CustomerPortalView({
  user,
  tickets,
  customers,
  invoices,
  inquiries,
  onRegisterRemoteTicket,
  onSubmitInquiry
}: CustomerPortalViewProps) {
  
  // Find customer profile linked to logged in email
  const customerProfile = customers.find(c => c.email.toLowerCase() === user.username.toLowerCase());

  // Filter tickets belonging to this customer
  const clientTickets = tickets.filter(t => t.customer_id === customerProfile?.id);
  // Filter invoices belonging to this customer
  const clientInvoices = invoices.filter(i => i.customer_id === customerProfile?.id);
  // Filter inquiries belonging to this customer
  const clientInquiries = inquiries.filter(i => i.customerId === user.id);

  // Form States for Remote Repair Requisition
  const [deviceType, setDeviceType] = useState("Laptop");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [pickupRequired, setPickupRequired] = useState(false);
  const [contactPhone, setContactPhone] = useState(customerProfile?.phone || "");
  const [deliveryAddress, setDeliveryAddress] = useState(customerProfile?.address || "");
  
  // Custom mock image selection state
  const [deviceImg, setDeviceImg] = useState("https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&q=80"); // laptop default
  
  // Inquiry form states
  const [inquiryMsg, setInquiryMsg] = useState("");

  const handleDeviceTypeChange = (type: string) => {
    setDeviceType(type);
    if (type === "Laptop") {
      setDeviceImg("https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&q=80");
    } else if (type === "Phone") {
      setDeviceImg("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80");
    } else {
      setDeviceImg("https://images.unsplash.com/photo-1547082299-de196ea013d6?w=200&q=80");
    }
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !model.trim() || !issueDescription.trim()) {
      alert("Validation Error: Please specify device brand, model, and problem description.");
      return;
    }

    onRegisterRemoteTicket(
      brand.trim(),
      model.trim(),
      deviceType,
      serialNumber.trim(),
      issueDescription.trim(),
      pickupRequired,
      contactPhone.trim() || customerProfile?.phone || "",
      deliveryAddress.trim() || customerProfile?.address || "",
      deviceImg
    );

    // Reset Form Fields
    setBrand("");
    setModel("");
    setSerialNumber("");
    setIssueDescription("");
    setPickupRequired(false);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryMsg.trim()) return;
    onSubmitInquiry(inquiryMsg);
    setInquiryMsg("");
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Upper greetings with user profile metadata */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Client Repair Portal Space</h2>
          <p className="text-xs text-slate-400">Addis Ababa Central Station — Monitor active jobs, file repair requests, and track couriers.</p>
        </div>
        <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs flex items-center gap-2">
          <UserCheck size={14} className="text-amber-500" />
          <span className="text-slate-300">Logged in: <strong className="text-white">{user.fullName}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols wide on large screen): Active Jobs Tracking & Invoices */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Job Progress and delivery tracking */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
              <Clock size={14} className="text-amber-500" />
              My Repair Requisitions &amp; Delivery Tracking ({clientTickets.length})
            </h3>

            {clientTickets.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <AlertTriangle size={24} className="mx-auto text-slate-600" />
                <p className="text-xs">No repair contracts cataloged under your account.</p>
                <p className="text-[11px] text-slate-650">Submit a remote repair request on the right form to initiate diagnostics!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientTickets.map(t => {
                  let trackingStatus = t.delivery_tracking_status || "None";
                  
                  return (
                    <div key={t.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-4 text-xs font-sans">
                      
                      {/* Ticket header indicators */}
                      <div className="flex justify-between items-start gap-2 flex-wrap pb-2 border-b border-slate-900">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-amber-500">JOB CONTRACT ID #{t.id}</span>
                          <h4 className="font-bold text-white text-sm">{t.device_brand} {t.device_model}</h4>
                          <div className="flex gap-2 items-center text-[10px] text-slate-400 mt-0.5 font-mono">
                            <span>Source: <strong className="text-slate-300">{t.request_source || "Walk-in"}</strong></span>
                            <span>•</span>
                            <span>Pickup: <strong className="text-slate-300">{t.pickup_required ? "Yes" : "No"}</strong></span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono uppercase ${
                            t.status === "Completed"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : t.status === "Waiting for Spare Parts"
                              ? "bg-red-500/15 text-red-400 border border-red-500/30"
                              : "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      </div>

                      {/* Device problem and option device image */}
                      <div className="flex gap-4 items-center bg-slate-900/40 p-2.5 rounded-lg border border-slate-900 text-slate-300">
                        {t.device_image && (
                          <img 
                            src={t.device_image} 
                            alt="uploaded device" 
                            className="w-12 h-12 rounded object-cover border border-slate-800 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 font-mono block">Problem Description</span>
                          <p className="italic text-slate-300">"{t.issue_description}"</p>
                        </div>
                      </div>

                      {/* Timeline status indicator tracking */}
                      {t.pickup_required && (
                        <div className="space-y-2 bg-[#0e131d] p-3 rounded-lg border border-slate-850">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 font-mono">
                            <Truck size={12} />
                            Logistics &amp; Delivery Tracking ({trackingStatus})
                          </span>

                          <div className="grid grid-cols-4 gap-1 text-[10px] text-center pt-1">
                            <div className={`p-1.5 rounded ${trackingStatus === "Pending Pickup" ? "bg-amber-500/15 text-amber-500 font-bold border border-amber-500/20" : "bg-slate-900 text-slate-500"}`}>
                              Pending Pickup
                            </div>
                            <div className={`p-1.5 rounded ${(trackingStatus === "Picked Up" || trackingStatus === "In Repair") ? "bg-amber-500/15 text-amber-500 font-bold border border-amber-500/20" : "bg-slate-900 text-slate-500"}`}>
                              In Repair
                            </div>
                            <div className={`p-1.5 rounded ${trackingStatus === "Ready for Return" ? "bg-amber-500/15 text-amber-500 font-bold border border-amber-500/20" : "bg-slate-900 text-slate-500"}`}>
                              Ready return
                            </div>
                            <div className={`p-1.5 rounded ${(trackingStatus === "In Return Transit" || trackingStatus === "Completed" || trackingStatus === "Handed Over") ? "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20" : "bg-slate-900 text-slate-500"}`}>
                              Returned
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Job diary logs */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 font-mono block">Latest updates</span>
                        <div className="space-y-1 font-mono text-[10px] text-slate-400 pl-2 border-l border-slate-800">
                          {t.logs.slice(-2).map((log, idx) => (
                            <div key={idx} className="flex gap-1.5 items-start">
                              <span className="text-amber-500/80">•</span>
                              <span className="truncate" title={log}>{log}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Customer Specific Invoice receipt list */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
              <Receipt size={14} className="text-amber-500" />
              My Financial Invoices ({clientInvoices.length})
            </h3>

            {clientInvoices.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4 italic">No invoice sheets processed yet for your devices.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientInvoices.map(invoice => (
                  <div key={invoice.id} className="p-4 bg-slate-950 border border-slate-850 rounded-lg space-y-3 font-sans text-xs">
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-900 font-mono text-[10px] text-slate-500">
                      <span>INVOICE: #INV-{invoice.id}</span>
                      <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                        invoice.payment_status === "Paid" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {invoice.payment_status}
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-300">
                      <p className="font-bold text-white">{invoice.device_brand} {invoice.device_model}</p>
                      <p className="text-[10px] text-slate-500 font-mono">S/N: {invoice.device_serial}</p>
                      <p className="text-[10px] text-slate-500">Date: {new Date(invoice.invoice_date).toLocaleDateString()}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex justify-between items-center">
                      <span className="text-slate-500 font-bold text-[10px] font-mono">Amount due:</span>
                      <strong className="text-emerald-400 font-mono font-bold text-sm">Br {invoice.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                    </div>

                    <button 
                      onClick={() => alert(`Simulated Receipt printing sequence for INV-${invoice.id}. Generated Birr copy successfully!`)}
                      className="w-full mt-1.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded text-slate-400 hover:text-white font-bold font-mono text-[10px] cursor-pointer flex items-center justify-center gap-1"
                    >
                      <FileText size={11} />
                      <span>Print invoice copy (Birr)</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (1 Col wide): Register Request Form & Support Inquiries */}
        <div className="space-y-6">
          
          {/* Register Remote Repair Request Form */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
              <Plus size={14} className="text-amber-500" />
              File Remote Repair Request
            </h3>

            <form onSubmit={handleTicketSubmit} className="space-y-3.5 text-xs text-left">
              
              {/* Select Device Category */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Device category *</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDeviceTypeChange("Laptop")}
                    className={`py-1.5 rounded border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      deviceType === "Laptop"
                        ? "bg-amber-500/10 text-amber-500 border-amber-500"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    <Laptop size={14} />
                    <span>Laptop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeviceTypeChange("Phone")}
                    className={`py-1.5 rounded border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      deviceType === "Phone"
                        ? "bg-amber-500/10 text-amber-500 border-amber-500"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    <Smartphone size={14} />
                    <span>Phone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeviceTypeChange("Desktop")}
                    className={`py-1.5 rounded border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      deviceType === "Desktop"
                        ? "bg-amber-500/10 text-amber-500 border-amber-500"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    <Monitor size={14} />
                    <span>Desktop</span>
                  </button>
                </div>
              </div>

              {/* Brand and Model */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dell, Apple, Samsung"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Latitude 5430, Galaxy S22"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              {/* Serial number */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Serial Number / Asset Tag</label>
                <input
                  type="text"
                  placeholder="e.g. SN-XYZ-9080 (highly recommended)"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* Problem Description */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Describe device problems *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe board faults, hardware crashes, screen splits, or fluid spills..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                ></textarea>
              </div>

              {/* Delivery method choice */}
              <div className="space-y-2 bg-[#0c0f16] p-2.5 border border-slate-850 rounded">
                <label className="text-slate-400 font-extrabold block uppercase tracking-wider text-[9px] font-mono">Delivery &amp; Courier Method</label>
                <div className="space-y-1.5 font-sans">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="radio"
                      name="pickup"
                      checked={!pickupRequired}
                      onChange={() => setPickupRequired(false)}
                      className="accent-amber-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Bring physically ( Addis Ababa station desk )</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="radio"
                      name="pickup"
                      checked={pickupRequired}
                      onChange={() => setPickupRequired(true)}
                      className="accent-amber-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Request pickup by delivery couriers</span>
                  </label>
                </div>
              </div>

              {/* Conditional Address and Telephone check */}
              {pickupRequired && (
                <div className="p-2.5 bg-[#141822] border border-slate-800 rounded space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 font-mono block">CALLBACK CONTACT PHONE</label>
                    <input
                      type="text"
                      placeholder="+251-9..."
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-slate-955 border border-slate-800 rounded p-1.5 text-slate-200 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 font-mono block">PICKUP PHYSICAL ADDRESS</label>
                    <input
                      type="text"
                      placeholder="e.g. Bole Kebele 03, Addis Ababa"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-slate-955 border border-slate-800 rounded p-1.5 text-slate-200 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Upload Illustration Info */}
              <div className="space-y-1 pt-1">
                <label className="text-slate-400 font-bold block">Optional device fault mock attachment</label>
                <div className="flex gap-2 items-center">
                  <div className="w-10 h-10 border border-slate-800 rounded overflow-hidden shrink-0 bg-slate-950">
                    <img src={deviceImg} alt="selected thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 text-[10px] text-slate-500 leading-normal">
                    Automatic mock file attachment created. Click form submit below to save.
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-transform"
              >
                Submit Repair Requisition
              </button>
            </form>
          </div>

          {/* Inquiry thread & Progress messages support */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
              <Mail size={14} className="text-amber-500" />
              Progress Inquiry Threads
            </h3>

            {/* Form */}
            <form onSubmit={handleInquirySubmit} className="space-y-2.5 text-xs">
              <textarea
                required
                rows={2}
                placeholder="Ask our technicians a question regarding parts waitlists or courier status..."
                value={inquiryMsg}
                onChange={(e) => setInquiryMsg(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-slate-200 focus:outline-none focus:border-amber-550"
              />
              <button
                type="submit"
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-450 hover:text-white border border-slate-800 rounded font-bold cursor-pointer transition-colors"
              >
                Dispatch Question Thread
              </button>
            </form>

            {/* List */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block">Historic queries ({clientInquiries.length})</span>
              
              {clientInquiries.length === 0 ? (
                <p className="text-[10px] text-slate-500 italic text-left pl-1">No conversation threads opened yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pl-1 pr-1 font-sans text-xs">
                  {clientInquiries.slice().reverse().map(inq => (
                    <div key={inq.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-850 space-y-1.5 text-left text-[11px]">
                      <div className="flex justify-between items-center pb-1 border-b border-slate-900 font-mono text-[9px] text-slate-500">
                        <span>THREAD NO: #{inq.id}</span>
                        <span className={`px-1 rounded font-bold ${inq.status === "Responded" ? "text-teal-400 bg-teal-500/10" : "text-amber-500 bg-amber-500/10"}`}>
                          {inq.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-extrabold text-amber-500 block">Q:</span>
                        <p className="text-slate-300 italic">"{inq.messageText}"</p>
                      </div>
                      {inq.responseText && (
                        <div className="pt-1.5 border-t border-slate-900 leading-relaxed text-slate-400">
                          <span className="text-[9px] font-extrabold text-teal-400 block">A:</span>
                          <p>{inq.responseText}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
