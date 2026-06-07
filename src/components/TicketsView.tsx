import * as React from "react";
import { useState } from "react";
import { Cpu, Search, Plus, UserPlus, Clock } from "lucide-react";
import { RepairTicket, Customer, Device, User, Technician } from "../types";

interface TicketsViewProps {
  tickets: RepairTicket[];
  customers: Customer[];
  devices: Device[];
  user: User;
  technicians: Technician[];
  onAssignTechnician: (ticketId: number, techName: string) => void;
  onUpdateTicket: (tId: number, nextStatus: string, appendLog: string) => void;
  onCreateTicketAndDevice: (custId: number, dType: string, brand: string, model: string, sn: string, issue: string) => void;
}

export default function TicketsView({
  tickets,
  customers,
  devices,
  user,
  technicians,
  onAssignTechnician,
  onUpdateTicket,
  onCreateTicketAndDevice
}: TicketsViewProps) {
  
  const [ticketSearch, setTicketSearch] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Create ticket states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [deviceType, setDeviceType] = useState("Laptop");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [issueDescription, setIssueDescription] = useState("");

  const activeTicket = tickets.find(t => t.id === selectedTicketId);

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const q = ticketSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      String(t.id).includes(q) ||
      t.customer_name.toLowerCase().includes(q) ||
      t.device_brand.toLowerCase().includes(q) ||
      t.device_model.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q) ||
      (t.technician_name && t.technician_name.toLowerCase().includes(q))
    );
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const custId = parseInt(selectedCustomerId);
    if (!custId || !brand.trim() || !model.trim() || !serialNumber.trim() || !issueDescription.trim()) {
      alert("Validation Error: Please populate all fields, selecting a valid client profile first.");
      return;
    }
    
    // Call props callback
    onCreateTicketAndDevice(custId, deviceType, brand, model, serialNumber, issueDescription);

    // Reset states
    setSelectedCustomerId("");
    setBrand("");
    setModel("");
    setSerialNumber("");
    setIssueDescription("");
    setShowCreateForm(false);
    alert("Success: Asset catalog logged and Ticket requisition opened successfully.");
  };

  return (
    <div className="space-y-6">
      
      {/* Header operations */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Hardware Repair Requisitions</h2>
          <p className="text-xs text-slate-400">Manage diagnostic work orders, parts logistics, and technician updates.</p>
        </div>
        
        {["Admin", "Receptionist"].includes(user.role) && (
          <button
            onClick={() => { setShowCreateForm(!showCreateForm); setSelectedTicketId(null); }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Plus size={14} />
            <span>Launch Maintenance Intake</span>
          </button>
        )}
      </div>

      {/* Ticket intake creation form */}
      {showCreateForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu size={14} className="text-amber-500" />
              Enroll Connected Hardware Asset &amp; Spawn Ticket
            </h4>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-slate-500 hover:text-white text-xs bg-slate-950 px-2 py-0.5 border border-slate-800 rounded hover:bg-slate-900 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-left">
            
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Billing Customer Owner *</label>
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Choose Account --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Device Asset Type *</label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="Laptop">Laptop Computer</option>
                <option value="Phone">Smart Phone / Tablet</option>
                <option value="Desktop">Desktop PC Workspace</option>
                <option value="Console">Gaming Console / Media</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Device Manufacturer Brand *</label>
              <input
                type="text"
                required
                placeholder="e.g. Apple, Dell, Lenovo, Sony"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Hardware Model / Submodel *</label>
              <input
                type="text"
                required
                placeholder="e.g. MacBook Air M1, XPS 13, ThinkPad"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Hardware Serial Number SN *</label>
              <input
                type="text"
                required
                placeholder="e.g. SN-KDF82-2026M"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2 md:col-span-3">
              <label className="text-slate-400 font-bold">Reported Symptom &amp; Damage Description *</label>
              <textarea
                required
                placeholder="Describe exact physical hardware symptoms (e.g., keyboard sticky fluid spill, battery case expansion, loop screens, solder bridge failure)..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                className="w-full h-20 bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500"
              ></textarea>
            </div>

            <div className="sm:col-span-2 md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-all shadow-md"
              >
                Log Hardware and Open Ticket
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Ticket Details Inspection Card */}
      {activeTicket && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative space-y-4">
          <button
            onClick={() => setSelectedTicketId(null)}
            className="absolute right-4 top-4 text-slate-500 hover:text-white text-xs bg-slate-950 px-2 py-0.5 border border-slate-800 rounded cursor-pointer hover:bg-slate-900"
          >
            Close Inspector
          </button>

          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 pb-3 border-b border-slate-800 text-left">
            <div>
              <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded font-bold border border-amber-500/15">
                TICKET ARCHIVE REQUISITION #{activeTicket.id}
              </span>
              <h3 className="text-base font-bold text-white font-sans mt-2">
                {activeTicket.device_brand} {activeTicket.device_model} — {activeTicket.customer_name}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">DB State:</span>
              <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded border ${
                activeTicket.status === 'Completed'
                  ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>{activeTicket.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-left">
            
            {/* Left side problem statement */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850/80">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Issue Reported:</div>
                <p className="text-slate-300 leading-normal leading-relaxed text-xs italic">&ldquo;{activeTicket.issue_description}&rdquo;</p>
              </div>

              {/* Workflow timelines */}
              <div className="space-y-2">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Intranet Diagnostics Log History File</div>
                
                <div className="space-y-1.5 border-l border-slate-850 pl-3 ml-1.5">
                  {activeTicket.logs.map((log, lIdx) => (
                    <div key={lIdx} className="relative py-0.5 text-slate-300 font-mono text-[11px] flex items-start gap-2 text-left">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0 relative -left-[16px] border border-slate-900" />
                      <span className="leading-normal">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side form updates */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Diagnostics Checkpoint</h4>
              
              <div className="space-y-3.5 text-xs">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Assigned Service Specialist</label>
                  <select
                    id={`active_tech_sel`}
                    value={activeTicket.technician_name || ""}
                    onChange={(e) => {
                      if (["Admin", "Receptionist"].includes(user.role)) {
                        onAssignTechnician(activeTicket.id, e.target.value);
                        alert(`Dispatched Repair specialist: ${e.target.value}`);
                      } else {
                        alert("Access Denied: Only Admin or Receptionist personnel can dispatch hardware technicians.");
                      }
                    }}
                    disabled={!["Admin", "Receptionist"].includes(user.role)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-xs text-slate-300 disabled:opacity-75 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Unallocated Pool --</option>
                    {technicians.map(tech => (
                      <option key={tech.id} value={tech.name}>
                        {tech.name} ({tech.speciality})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Adjust Progress State</label>
                  <select
                    id={`active_status_sel`}
                    defaultValue={activeTicket.status}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-xs text-slate-300"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting for Spare Parts">Waiting for Spare Parts</option>
                    <option value="Completed">Completed / Passed QA</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Append Work remarks</label>
                  <input
                    type="text"
                    id={`active_notes_input`}
                    placeholder="e.g. Cleared corrosion trace, solder pad verified"
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-xs text-slate-200"
                  />
                </div>

                <button
                  onClick={() => {
                    const statusEl = document.getElementById(`active_status_sel`) as HTMLSelectElement;
                    const notesEl = document.getElementById(`active_notes_input`) as HTMLInputElement;
                    if (statusEl && notesEl) {
                      onUpdateTicket(activeTicket.id, statusEl.value, notesEl.value || "Assessor checkpoint update");
                      notesEl.value = "";
                      alert(`Successfully synchronized: work logs appended.`);
                    }
                  }}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-colors text-center"
                >
                  Commit Diagnostics Log
                </button>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* Main master list directory table */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 text-xs">
        
        {/* Table search bar */}
        <div className="max-w-md flex bg-slate-950 border border-slate-800 rounded-lg overflow-hidden px-3 py-1.5 items-center gap-2">
          <Search size={14} className="text-slate-500" />
          <input
            type="text"
            value={ticketSearch}
            onChange={(e) => setTicketSearch(e.target.value)}
            placeholder="Search tickets by ID, device owner, status, brand..."
            className="bg-transparent border-0 focus:outline-none text-slate-300 placeholder-slate-600 text-xs w-full"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-[9px] tracking-wider whitespace-nowrap">
                <th className="py-2 px-3">TICKET REF</th>
                <th className="py-2 px-3">CLIENT OWNER</th>
                <th className="py-2 px-3">HARDWARE BRAND &amp; MODEL</th>
                <th className="py-2 px-3">REPORTED TROUBLE</th>
                <th className="py-2 px-3">ASSIGNED ENG</th>
                <th className="py-2 px-3 text-center">CURRENT STATE</th>
                <th className="py-2 px-4 text-right">INSPECT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 italic">No tickets found matching the filter matrix.</td>
                </tr>
              ) : (
                filteredTickets.map(t => (
                  <tr key={t.id} className="hover:bg-slate-950/20 text-xs text-slate-300">
                    <td className="py-3 px-3 font-mono font-bold text-slate-400">#{t.id}</td>
                    <td className="py-3 px-3">{t.customer_name}</td>
                    <td className="py-3 px-3">
                      <span className="text-slate-200 font-semibold">{t.device_brand}</span> {t.device_model}
                    </td>
                    <td className="py-3 px-3 text-slate-400 truncate max-w-[180px]" title={t.issue_description}>
                      {t.issue_description}
                    </td>
                    <td className="py-3 px-3">
                      {t.technician_name ? (
                        <span className="inline-block px-2 py-0.5 bg-slate-950 border border-slate-800 rounded font-bold text-[10px] text-slate-200">
                          {t.technician_name}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-rose-950/10 border border-rose-500/10 rounded font-mono font-bold text-[10px] text-rose-400">
                          Unallocated Pool
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${
                        t.status === 'Completed'
                          ? 'bg-emerald-950 text-emerald-400 border-teal-500/20'
                          : t.status === 'In Progress'
                          ? 'bg-blue-950 text-blue-400 border-blue-500/20'
                          : 'bg-amber-950 text-amber-500 border-amber-500/20'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedTicketId(t.id)}
                        className="p-1 px-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 hover:border-amber-500 text-slate-400 hover:text-white rounded text-[11px] font-semibold cursor-pointer transition-colors"
                      >
                        Inspect Log
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
