import * as React from "react";
import { useState } from "react";
import { Users, Search, UserPlus, Phone, MapPin, Mail, Layers, Receipt } from "lucide-react";
import { Customer, Device, RepairTicket, SparePart } from "../types";

interface CustomersViewProps {
  customers: Customer[];
  devices: Device[];
  tickets: RepairTicket[];
  inventory: SparePart[];
  onRegisterCustomer: (fullName: string, email: string, phone: string, address: string, altPhone?: string) => boolean;
}

export default function CustomersView({
  customers,
  devices,
  tickets,
  inventory,
  onRegisterCustomer
}: CustomersViewProps) {
  
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [altPhone, setAltPhone] = useState("");

  const activeCustomer = customers.find(c => c.id === selectedCustomerId);

  const filteredCustomers = customers.filter(c => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      alert("Validation Error: Please populate all mandatory fields correctly.");
      return;
    }

    const success = onRegisterCustomer(fullName, email, phone, address, altPhone);
    if (success) {
      setFullName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setAltPhone("");
      setShowRegisterForm(false);
      alert("Success: Customer model stored inside DBMS databases.");
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Client Database Directory</h2>
          <p className="text-xs text-slate-400">Search customer profiles, track hardware repair histories, and manage registered billing accounts.</p>
        </div>
        <button
          onClick={() => { setShowRegisterForm(!showRegisterForm); setSelectedCustomerId(null); }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <UserPlus size={14} />
          <span>Register New Customer</span>
        </button>
      </div>

      {/* Register customer model form */}
      {showRegisterForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserPlus size={15} className="text-amber-500" />
              Register Customer Record (PHP BaseModel SQL Enforced)
            </h4>
            <button
              onClick={() => setShowRegisterForm(false)}
              className="text-slate-500 hover:text-white text-xs bg-slate-950 px-2 py-0.5 border border-slate-800 rounded cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleRegisterSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Customer Full Name *</label>
              <input
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Arthur Pendragon"
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Primary Email Address *</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arthur@pendragon.co.uk"
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Primary Mobile Phone *</label>
              <input
                required
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0711928012"
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Alternative Phone (Optional)</label>
              <input
                type="text"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
                placeholder="0711928999"
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-550"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-400 font-bold">Billing Corporate Address *</label>
              <input
                required
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Camelot Castle, Wiltshire"
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-all shadow-md"
              >
                Insert Customer Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customer Profile detail modal or panel view */}
      {activeCustomer && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative space-y-5">
          <button
            onClick={() => setSelectedCustomerId(null)}
            className="absolute right-4 top-4 text-slate-500 hover:text-white text-xs bg-slate-950 border border-slate-850 rounded px-2 py-0.5 cursor-pointer hover:bg-slate-900"
          >
            Close Details
          </button>

          <div className="flex flex-col md:flex-row md:items-start gap-4 pb-4 border-b border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-lg font-bold shrink-0">
              {activeCustomer.full_name.charAt(0)}
            </div>
            <div className="space-y-1.5 flex-1">
              <h4 className="text-base font-bold text-white font-sans">{activeCustomer.full_name}</h4>
              <span className="inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#0f2d24] text-teal-400 uppercase tracking-wide">
                Account Status: ACTIVE REGISTRY
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 text-slate-400 text-xs text-left">
                <div className="flex items-center gap-1.5"><Mail size={13} className="text-slate-500 shrink-0" /> <strong>Email:</strong> {activeCustomer.email}</div>
                <div className="flex items-center gap-1.5"><Phone size={13} className="text-slate-500 shrink-0" /> <strong>Phone:</strong> {activeCustomer.phone}</div>
                <div className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-500 shrink-0" /> <strong>Address:</strong> {activeCustomer.address}</div>
              </div>
            </div>
          </div>

          {/* Linked device inventory and repair sheets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs font-sans">
            
            {/* Linked device assets */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-3">
              <h5 className="font-bold text-white uppercase text-[10px] tracking-widest text-slate-400 flex items-center gap-1.5">
                <Layers size={11} className="text-amber-500" />
                Registered Client Hardware Assets ({devices.filter(d => d.customer_id === activeCustomer.id).length})
              </h5>
              {devices.filter(d => d.customer_id === activeCustomer.id).length === 0 ? (
                <p className="text-slate-500 italic">No device assets linked to this customer yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {devices.filter(d => d.customer_id === activeCustomer.id).map(dev => (
                    <div key={dev.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded flex justify-between items-center text-left">
                      <div>
                        <span className="font-bold text-slate-200">{dev.brand} {dev.model}</span>
                        <div className="text-[10px] text-slate-500 font-mono">SN: {dev.serial_number}</div>
                      </div>
                      <span className="text-[9px] bg-slate-950 px-2 py-0.5 text-slate-400 border border-slate-850 rounded uppercase">
                        {dev.device_type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Repair history and bill estimates */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-3">
              <h5 className="font-bold text-white uppercase text-[10px] tracking-widest text-slate-400 flex items-center gap-1.5">
                <Receipt size={11} className="text-amber-500" />
                Spawned Requisitions &amp; Estimates ({tickets.filter(t => t.customer_id === activeCustomer.id).length})
              </h5>
              {tickets.filter(t => t.customer_id === activeCustomer.id).length === 0 ? (
                <p className="text-slate-500 italic">No maintenance tickets spawned for this client.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tickets.filter(t => t.customer_id === activeCustomer.id).map(t => {
                    const partsCost = t.logs
                      .filter(l => l.includes("Part Consumed:"))
                      .reduce((acc, l) => {
                        const name = l.replace("Part Consumed: -1x ", "").trim();
                        const p = inventory.find(i => i.part_name === name);
                        return acc + (p?.unit_price || 0);
                      }, 0);
                    const totalCharge = 1500.00 + partsCost;

                    return (
                      <div key={t.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded space-y-1.5 text-left">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="font-bold text-amber-500">TICKET REF #{t.id}</span>
                          <span className="text-slate-500">Total charge: <strong className="text-emerald-400">Br {totalCharge.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                        </div>
                        <p className="text-slate-350">{t.device_brand} {t.device_model} — <span className="text-slate-400 text-[11px] italic">&ldquo;{t.issue_description}&rdquo;</span></p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Tables directory */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        
        <div className="max-w-md flex bg-slate-950 border border-slate-800 rounded-lg overflow-hidden px-3 py-1.5 items-center gap-2">
          <Search size={14} className="text-slate-500" />
          <input
            type="text"
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            placeholder="Search master client index by name, email, or telephone..."
            className="bg-transparent border-0 focus:outline-none text-slate-300 placeholder-slate-600 text-xs w-full"
          />
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap">
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">FULL NAME</th>
                <th className="py-2 px-3">EMAIL ADDRESS</th>
                <th className="py-2 px-3">MOBILE PHONE</th>
                <th className="py-2 px-3">PRIMARY BILLING ADDRESS</th>
                <th className="py-2 px-4 text-right">PROFILE ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 italic">No client profiles found matching the query context.</td>
                </tr>
              ) : (
                filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-950/20 text-slate-300">
                    <td className="py-3 px-3 font-mono text-slate-500">#{c.id}</td>
                    <td className="py-3 px-3 font-semibold text-white">{c.full_name}</td>
                    <td className="py-3 px-3 text-slate-400">{c.email}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono">{c.phone}</td>
                    <td className="py-3 px-3 text-slate-500 truncate max-w-xs">{c.address}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomerId(c.id)}
                        className="p-1 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-white rounded text-[11px] font-semibold cursor-pointer transition-colors"
                      >
                        Inspect History
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
