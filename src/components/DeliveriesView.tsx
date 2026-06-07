import * as React from "react";
import { useState } from "react";
import { Search, MapPin, Plus, CheckCircle2, Navigation } from "lucide-react";
import { Delivery, RepairTicket, User } from "../types";

interface DeliveriesViewProps {
  deliveries: Delivery[];
  tickets: RepairTicket[];
  user: User;
  onDispatchDelivery: (ticketId: number, dest: string, courier: string, notes: string) => boolean;
  onToggleDeliveryStatus: (dId: number) => void;
}

export default function DeliveriesView({
  deliveries,
  tickets,
  user,
  onDispatchDelivery,
  onToggleDeliveryStatus
}: DeliveriesViewProps) {
  
  const [deliverySearch, setDeliverySearch] = useState("");
  const [showDispatchForm, setShowDispatchForm] = useState(false);

  // Form states
  const [ticketId, setTicketId] = useState("");
  const [destination, setDestination] = useState("");
  const [courierName, setCourierName] = useState("Kaleab Birhanu");
  const [dispatchNotes, setDispatchNotes] = useState("");

  const filteredDeliveries = deliveries.filter(d => {
    const q = deliverySearch.trim().toLowerCase();
    if (!q) return true;
    return (
      d.customer_name.toLowerCase().includes(q) ||
      d.shipping_destination.toLowerCase().includes(q) ||
      d.courier.toLowerCase().includes(q)
    );
  });

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tId = parseInt(ticketId);
    if (isNaN(tId) || !destination.trim() || !courierName.trim()) {
      alert("Validation Error: Please select an active ticket and address.");
      return;
    }

    const success = onDispatchDelivery(tId, destination, courierName, dispatchNotes);
    if (success) {
      setTicketId("");
      setDestination("");
      setCourierName("Kaleab Birhanu");
      setDispatchNotes("");
      setShowDispatchForm(false);
      alert("Success: Dispatch ticket emitted to courier manifest.");
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Couriers &amp; Logistics Tracking</h2>
          <p className="text-xs text-slate-400">Dispatch returned hardware devices, assign freight messengers, and confirm hands-on client signatures.</p>
        </div>
        
        {["Admin", "Receptionist"].includes(user.role) && (
          <button
            onClick={() => setShowDispatchForm(!showDispatchForm)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Plus size={14} />
            <span>Dispatch Deliverer</span>
          </button>
        )}
      </div>

      {/* Dispatch Creator Form */}
      {showDispatchForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Navigation size={14} className="text-amber-500" />
              Manifest New Drop-off Courier Route
            </h4>
            <button
              onClick={() => setShowDispatchForm(false)}
              className="text-slate-500 hover:text-white text-xs bg-slate-950 px-2 py-0.5 border border-slate-800 rounded cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleDispatchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-left">
            
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Finished Device Ticket *</label>
              <select
                required
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Choose Complete Job --</option>
                {tickets
                  .filter(t => t.status === "Completed")
                  .map(t => (
                    <option key={t.id} value={t.id}>
                      Ticket #{t.id} - {t.customer_name} ({t.device_brand} {t.device_model})
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Assign Shipper / Courier *</label>
              <select
                required
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none"
              >
                <option value="Kaleab Birhanu">Kaleab Birhanu (Delivery Moto)</option>
                <option value="Mikiyas Assefa">Mikiyas Assefa (Freight Truck)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Client Drop-off Destination Address *</label>
              <input
                required
                type="text"
                placeholder="e.g. Bole, Addis Ababa"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2 lg:col-span-3">
              <label className="text-slate-400 font-bold">Courier Notes &amp; Routing Remarks</label>
              <input
                type="text"
                placeholder="Contact owner prior to routing, call mobile upon arrival..."
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-880 rounded p-2 text-slate-300 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-all shadow-md"
              >
                Commit Route Manifest
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Main Grid Tables */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        
        <div className="max-w-md flex bg-slate-950 border border-slate-800 rounded-lg overflow-hidden px-3 py-1.5 items-center gap-2">
          <Search size={14} className="text-slate-500" />
          <input
            type="text"
            value={deliverySearch}
            onChange={(e) => setDeliverySearch(e.target.value)}
            placeholder="Search manifests by driver name, destination, owner..."
            className="bg-transparent border-0 focus:outline-none text-slate-300 placeholder-slate-600 text-xs w-full"
          />
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap">
                <th className="py-2 px-3">ROUTE ID</th>
                <th className="py-2 px-3">RECIPIENT CLIENT</th>
                <th className="py-2 px-3">SHIPPING DESTINATION</th>
                <th className="py-2 px-3">COURIER ASSIGNEE</th>
                <th className="py-2 px-3">FREIGHT REMARKS</th>
                <th className="py-2 px-3 text-center">ROUTE STATUS</th>
                <th className="py-2 px-4 text-right">LEDGER ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">No delivery manifests queued.</td>
                </tr>
              ) : (
                filteredDeliveries.map(d => (
                  <tr key={d.id} className="hover:bg-slate-950/20">
                    <td className="py-3 px-3 font-mono text-slate-500">#TRK-50{d.id}</td>
                    <td className="py-3 px-3 font-semibold text-white">{d.customer_name}</td>
                    <td className="py-3 px-3 text-slate-400">
                      <div className="flex items-center gap-1.5 font-sans">
                        <MapPin size={11} className="text-slate-500" />
                        <span>{d.shipping_destination}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">{d.courier}</td>
                    <td className="py-3 px-3 text-slate-500 max-w-xs truncate" title={d.notes || "None"}>
                      {d.notes || <span className="italic">None</span>}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${
                        d.status === "Handed Over"
                          ? "bg-emerald-950 text-teal-400 border-teal-500/20"
                          : "bg-amber-950 text-amber-500 border-amber-500/15"
                      }`}>
                        {d.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {["Admin", "Receptionist", "Delivery"].includes(user.role) && d.status === "In Transit" ? (
                        <button
                          onClick={() => { onToggleDeliveryStatus(d.id); alert("Delivery package marked signed and delivered successfully."); }}
                          className="p-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-teal-400 hover:text-slate-950 border border-teal-500/20 rounded text-[11px] font-bold cursor-pointer transition-all inline-flex items-center gap-1"
                        >
                          <CheckCircle2 size={11} />
                          <span>Delivered</span>
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[11px] italic pr-2">No Action</span>
                      )}
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
