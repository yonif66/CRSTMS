import * as React from "react";
import { useState } from "react";
import { Search, Printer, Receipt, CheckCircle, AlertTriangle, ToggleLeft } from "lucide-react";
import { Invoice, RepairTicket, SparePart, User, ReceiptUpload } from "../types";

interface InvoicesViewProps {
  invoices: Invoice[];
  tickets: RepairTicket[];
  inventory: SparePart[];
  user: User;
  onTogglePayment: (invoiceId: number) => void;
  onGenerateInvoice: (ticketId: number, serviceCost: number) => boolean;
  receiptUploads: ReceiptUpload[];
  onVerifyReceipt: (uploadId: number, status: "Approved" | "Rejected", notes: string) => void;
}

export default function InvoicesView({
  invoices,
  tickets,
  inventory,
  user,
  onTogglePayment,
  onGenerateInvoice,
  receiptUploads,
  onVerifyReceipt
}: InvoicesViewProps) {
  
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);

  // Form states
  const [targetTicketId, setTargetTicketId] = useState("");
  const [serviceCost, setServiceCost] = useState("75.00");

  const activeInvoice = invoices.find(i => i.id === selectedInvoiceId);

  // Filtered invoices
  const filteredInvoices = invoices.filter(i => {
    const q = invoiceSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      String(i.id).includes(q) ||
      i.customer_name.toLowerCase().includes(q) ||
      i.device_model.toLowerCase().includes(q)
    );
  });

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tId = parseInt(targetTicketId);
    const sCost = parseFloat(serviceCost);

    if (isNaN(tId) || isNaN(sCost)) {
      alert("Validation Error: Please select a valid ticket and decimal service charge.");
      return;
    }

    const success = onGenerateInvoice(tId, sCost);
    if (success) {
      setTargetTicketId("");
      setServiceCost("75.00");
      setShowGenerateForm(false);
      alert("Invoice generated and committed successfully!");
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header operations */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Invoices &amp; Billing Ledger</h2>
          <p className="text-xs text-slate-400">Manage customer retail invoices, track unpaid balances, and issue work-order completions.</p>
        </div>
        
        {["Admin", "Receptionist"].includes(user.role) && (
          <button
            onClick={() => setShowGenerateForm(!showGenerateForm)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Receipt size={14} />
            <span>Generate Workorder Invoice</span>
          </button>
        )}
      </div>

      {/* Invoice Generator Form */}
      {showGenerateForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Receipt size={14} className="text-amber-500" />
              Issue New Invoice (Automated Ledger Calculations)
            </h4>
            <button
              onClick={() => setShowGenerateForm(false)}
              className="text-slate-500 hover:text-white text-xs bg-slate-950 px-2 py-0.5 border border-slate-800 rounded cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleGenerateSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left">
            
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Select Active Repair Ticket *</label>
              <select
                required
                value={targetTicketId}
                onChange={(e) => setTargetTicketId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Select Repair Ticket --</option>
                {tickets
                  .filter(t => !invoices.some(i => i.ticket_id === t.id)) // Only show uninvoiced tickets
                  .map(t => (
                    <option key={t.id} value={t.id}>
                      Ticket #{t.id} - {t.customer_name} ({t.device_brand} {t.device_model}) [{t.status}]
                    </option>
                  ))}
              </select>
              {tickets.filter(t => !invoices.some(i => i.ticket_id === t.id)).length === 0 && (
                <p className="text-[10px] text-amber-500 mt-1">No uninvoiced tickets available in system buffers.</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Direct Labor / Diagnostic Service Cost (Br) *</label>
              <input
                required
                type="text"
                value={serviceCost}
                onChange={(e) => setServiceCost(e.target.value)}
                placeholder="1500.00"
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-all shadow-md"
              >
                Perform Ledger Calculation &amp; Issue Invoice
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Printable Invoice Sheet Rendering Pane */}
      {activeInvoice && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative space-y-6">
          
          <div className="flex justify-between items-center pb-3 border-b border-slate-850">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Invoice Details Inspector</h3>
            <div className="flex gap-2">
              <button
                onClick={() => onTogglePayment(activeInvoice.id)}
                className="px-3 py-1 bg-slate-950 border border-slate-800 hover:border-amber-500 text-slate-300 hover:text-white rounded text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <ToggleLeft size={12} className="text-amber-500" />
                <span>Change Ledger Paid Status</span>
              </button>
              
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Printer size={12} />
                <span>Print Document</span>
              </button>

              <button
                onClick={() => setSelectedInvoiceId(null)}
                className="text-slate-500 hover:text-white text-xs bg-slate-950 border border-slate-850 rounded px-2 py-1 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

          {/* RETAIL INVOICE SHEET */}
          <div className="bg-white text-slate-955 p-6 rounded-xl border border-slate-800 max-w-2xl mx-auto shadow-2xl text-[12px] text-slate-900 leading-normal font-sans">
            
            {/* Upper Company branding */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-5">
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-950">CRSTMS SERVICES LTD</h1>
                <p className="text-[10px] text-slate-500 leading-none mt-1 font-mono">REPAIR LOGISTICS SYSTEM CORP #8812</p>
                <p className="text-[11px] text-slate-400 mt-2">144 Silicon Way, London EC1V 2NX</p>
                <p className="text-[11px] text-slate-400">Tel: +44 (0) 20 7946 0144 | billing@crstms.org</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-slate-800 tracking-tight block">OFFICIAL INVOICE</span>
                <span className="text-xs font-bold font-mono text-slate-600 block mt-1">REF: #{activeInvoice.id}</span>
                <span className="text-[10px] text-slate-500 font-mono block">Date: {new Date(activeInvoice.invoice_date).toLocaleDateString()}</span>
                
                <span className={`inline-block mt-3 px-3 py-1 rounded text-[10px] font-black border font-mono ${
                  activeInvoice.payment_status === "Paid"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-red-100 text-red-800 border-red-300"
                }`}>
                  STATUS: {activeInvoice.payment_status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Debtor Profile block */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200">
              <div className="text-left space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Invoiced Customer</span>
                <p className="font-extrabold text-slate-950 leading-tight">{activeInvoice.customer_name}</p>
                <p className="text-slate-500 text-[11px]">{activeInvoice.customer_address}</p>
                <p className="text-slate-500 text-[11px]">Tel: {activeInvoice.customer_phone}</p>
                <p className="text-slate-500 text-[11px]">Email: {activeInvoice.customer_email}</p>
              </div>
              
              <div className="text-left space-y-1 border-l border-slate-100 pl-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Serviced Device</span>
                <p className="font-extrabold text-slate-900 leading-tight">{activeInvoice.device_brand} {activeInvoice.device_model}</p>
                <p className="text-slate-500 text-[11px]">Type category: {activeInvoice.device_type}</p>
                <p className="text-slate-500 text-[11px] font-mono">Hardware SN: {activeInvoice.device_serial}</p>
                <p className="text-slate-500 text-[11px]">Diagnostics: {activeInvoice.technician_name}</p>
              </div>
            </div>

            {/* Calculations main ledger table */}
            <div className="py-4 font-sans">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                    <th className="py-1.5">Item Description</th>
                    <th className="py-1.5 text-right">Units</th>
                    <th className="py-1.5 text-right">Unit Price</th>
                    <th className="py-1.5 text-right">Ext Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="text-slate-800">
                    <td className="py-2.5 font-medium">Diagnostic Solder bench fee &amp; Work-hours</td>
                    <td className="py-2.5 text-right font-mono">1</td>
                    <td className="py-2.5 text-right font-mono">Br {activeInvoice.service_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-2.5 text-right font-mono">Br {activeInvoice.service_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                  
                  {activeInvoice.spare_parts_cost > 0 && (
                    <tr className="text-slate-850">
                      <td className="py-2.5">Mapped spare replacement components SKU (Aggregate stock subtraction)</td>
                      <td className="py-2.5 text-right font-mono">1</td>
                      <td className="py-2.5 text-right font-mono">Br {activeInvoice.spare_parts_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-2.5 text-right font-mono">Br {activeInvoice.spare_parts_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Aggregates block */}
              <div className="mt-8 border-t border-slate-200 pt-4 flex justify-end">
                <div className="w-64 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal of service items</span>
                    <span className="font-mono text-slate-800">Br {(activeInvoice.service_cost + activeInvoice.spare_parts_cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes &amp; VAT (15.00%)</span>
                    <span className="font-mono text-slate-800">Br {((activeInvoice.service_cost + activeInvoice.spare_parts_cost) * 0.15).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm text-slate-950 font-black">
                    <span>Grand Ledger Total</span>
                    <span className="font-mono">Br {activeInvoice.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-12 grid grid-cols-2 gap-6 pt-6 border-t border-slate-150 text-[10px] text-slate-400">
              <div className="text-left space-y-1.5">
                <div className="border-b border-slate-200 h-8" />
                <span>Authorized Representative Signature</span>
              </div>
              <div className="text-left space-y-1.5">
                <div className="border-b border-slate-200 h-8" />
                <span>Customer Acknowledgment/Receipt Match</span>
              </div>
            </div>

            {/* Barcode representation */}
            <div className="mt-8 flex flex-col items-center justify-center space-y-1">
              <div className="w-48 h-8 flex justify-between bg-slate-900 px-2 select-none pointer-events-none items-stretch opacity-20">
                <span className="w-1 bg-white inline-block"></span>
                <span className="w-2 bg-white inline-block"></span>
                <span className="w-1.5 bg-white inline-block"></span>
                <span className="w-0.5 bg-white inline-block"></span>
                <span className="w-2 bg-white inline-block"></span>
                <span className="w-1.5 bg-white inline-block"></span>
                <span className="w-1.5 bg-white inline-block"></span>
              </div>
              <span className="text-[9px] font-mono text-slate-400 tracking-wider font-semibold">BARCODE SECURE NO: *CRSTMS-0801M*</span>
            </div>

          </div>

        </div>
      )}

      {/* Main invoices grid table */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        
        <div className="max-w-md flex bg-slate-950 border border-slate-800 rounded-lg overflow-hidden px-3 py-1.5 items-center gap-2">
          <Search size={14} className="text-slate-500" />
          <input
            type="text"
            value={invoiceSearch}
            onChange={(e) => setInvoiceSearch(e.target.value)}
            placeholder="Search billing ledger by client name or invoice refer..."
            className="bg-transparent border-0 focus:outline-none text-slate-300 placeholder-slate-600 text-xs w-full"
          />
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left font-sans">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap">
                <th className="py-2 px-3">INVOICE NO</th>
                <th className="py-2 px-3">CLIENT OWNER</th>
                <th className="py-2 px-3">SERVICED DEVICE</th>
                <th className="py-2 px-3 text-center">PAYMENT STATE</th>
                <th className="py-2 px-3 text-right">REVENUE VALUE</th>
                <th className="py-2 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 italic">No invoices found matching the search inputs.</td>
                </tr>
              ) : (
                filteredInvoices.map(i => (
                  <tr key={i.id} className="hover:bg-slate-950/20 text-slate-300">
                    <td className="py-3 px-3 font-mono font-bold text-slate-400">#INV-80{i.id}</td>
                    <td className="py-3 px-3 font-semibold text-white">{i.customer_name}</td>
                    <td className="py-3 px-3 text-slate-400">{i.device_brand} {i.device_model}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded font-mono font-bold text-[10px] border ${
                        i.payment_status === "Paid"
                          ? "bg-emerald-950 text-emerald-400 border-teal-500/25"
                          : "bg-red-950 text-red-500 border-red-500/20"
                      }`}>
                        {i.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-teal-400">Br {i.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedInvoiceId(i.id)}
                        className="p-1 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-850 hover:border-amber-500 text-slate-400 hover:text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        Inspect Invoice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Customer Receipt Upload Approvals Block */}
      <div className="mt-6 p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-white font-bold text-sm tracking-tight flex items-center gap-2">
              <Receipt size={16} className="text-amber-500" />
              Customer Payment Slip Verification
            </h3>
            <p className="text-[11px] text-slate-500">
              Audit offline bank slips (CBE Birr, Telebirr, Awash) uploaded by customers for pending invoices.
            </p>
          </div>
          <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 font-bold px-2.5 py-1 rounded font-mono">
            SECURE AUDIT PORTAL
          </span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left font-sans">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap">
                <th className="py-2 px-3">REF ID</th>
                <th className="py-2 px-3">CLIENT</th>
                <th className="py-2 px-3">SLIP FILENAME</th>
                <th className="py-3 px-3">UPLOAD DATE</th>
                <th className="py-2 px-3 text-center">VERIFICATION</th>
                <th className="py-2 px-3">AUDIT REMARKS / APPROVAL REASON</th>
                <th className="py-2 px-4 text-right">ACTION COMMANDS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {receiptUploads?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">No receipt verification records loaded.</td>
                </tr>
              ) : (
                receiptUploads?.map(up => {
                  return (
                    <tr key={up.id} className="hover:bg-slate-950/20 text-slate-350">
                      <td className="py-3 px-3 font-mono font-bold text-slate-400">#INV-80{up.invoice_id}</td>
                      <td className="py-3 px-3 font-semibold text-white">{up.customer_name}</td>
                      <td className="py-3 px-3 font-mono text-xs text-amber-500">
                        <span className="truncate max-w-[170px]" title={up.uploaded_filename}>
                          📂 {up.uploaded_filename}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{new Date(up.uploaded_at).toLocaleString()}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[9px] border ${
                          up.status === "Approved"
                            ? "bg-emerald-950 text-emerald-400 border-teal-500/25"
                            : up.status === "Rejected"
                            ? "bg-red-950 text-red-550 border-red-500/25"
                            : "bg-amber-950 text-amber-500 border-amber-500/25"
                        }`}>
                          {up.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-450 text-xs italic max-w-[200px] truncate" title={up.approval_notes || "Unverified pool"}>
                        {up.approval_notes || "Awaiting receptionist assessment..."}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 min-w-[200px]">
                        {up.status === "Pending" ? (
                          <>
                            <button
                              onClick={() => {
                                const notes = prompt("Enter CBE/Telebirr authorization notes:", "CBE reference code matched correctly.");
                                if (notes !== null) onVerifyReceipt(up.id, "Approved", notes || "Approved slip validation.");
                              }}
                              className="px-2 py-1 bg-emerald-900/50 hover:bg-emerald-800 text-emerald-300 font-bold border border-emerald-500/20 rounded text-[10px] cursor-pointer transition-colors"
                            >
                              Approve Pay
                            </button>
                            <button
                              onClick={() => {
                                const notes = prompt("Enter rejection reason notes:", "Transaction slip unconfirmed or legacy reference.");
                                if (notes !== null) onVerifyReceipt(up.id, "Rejected", notes || "Payment slip rejected.");
                              }}
                              className="px-2 py-1 bg-red-900/50 hover:bg-red-850 text-red-300 font-bold border border-red-500/20 rounded text-[10px] cursor-pointer transition-colors"
                            >
                              Reject Slip
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-semibold italic">
                            Verified by: {up.approved_by || "System Automated"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
