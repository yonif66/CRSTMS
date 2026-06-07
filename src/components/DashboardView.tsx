import { Cpu, Users, AlertTriangle, MapPin, TrendingUp, Clock, Server } from "lucide-react";
import { RepairTicket, Customer, SparePart, Delivery, SystemLog, User } from "../types";

interface DashboardViewProps {
  tickets: RepairTicket[];
  customers: Customer[];
  inventory: SparePart[];
  deliveries: Delivery[];
  logs: SystemLog[];
  user: User;
}

export default function DashboardView({
  tickets,
  customers,
  inventory,
  deliveries,
  logs,
  user
}: DashboardViewProps) {
  
  // Computations
  const activeTickets = tickets.filter(t => t.status !== "Completed").length;
  const criticalItems = inventory.filter(part => part.stock_quantity <= part.low_stock_threshold);
  const transitDeliveries = deliveries.filter(d => d.status === "In Transit").length;
  
  // Calculate total worth of stock
  const inventoryValue = inventory.reduce((sum, item) => sum + (item.stock_quantity * item.unit_price), 0);

  return (
    <div className="space-y-6">
      
      {/* Upper greetings */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Staff Dashboard</h2>
          <p className="text-xs text-slate-400">Computer Repair Service Tracking &amp; Management System (CRSTMS)</p>
        </div>
        <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-300">Authorized Operator: <strong className="text-white">{user.fullName} ({user.role})</strong></span>
        </div>
      </div>

      {/* Aggregate metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 relative overflow-hidden group">
          <div className="absolute right-3 top-3 opacity-10 text-slate-400 group-hover:opacity-25 transition-all">
            <Cpu size={32} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Repair Queue</span>
          <div className="text-xl font-extrabold text-white">{activeTickets} Tickets</div>
          <div className="text-[10px] text-amber-500 font-medium">In active diagnostics queue</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 relative overflow-hidden group">
          <div className="absolute right-3 top-3 opacity-10 text-slate-400 group-hover:opacity-25 transition-all">
            <Users size={32} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Clients Enrolled</span>
          <div className="text-xl font-extrabold text-white">{customers.length} Accounts</div>
          <div className="text-[10px] text-teal-400 font-medium">{customers.filter(c => c.active).length} Active registrations</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 relative overflow-hidden group">
          <div className="absolute right-3 top-3 opacity-10 text-slate-400 group-hover:opacity-25 transition-all">
            <AlertTriangle size={32} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Inventory Alarms</span>
          <div className={`text-xl font-extrabold ${criticalItems.length > 0 ? "text-red-400" : "text-white"}`}>{criticalItems.length} SKUs Alert</div>
          <div className={`text-[10px] ${criticalItems.length > 0 ? "text-red-500 font-bold" : "text-slate-500"}`}>
            {criticalItems.length > 0 ? "Breeched safety boundaries" : "All parts levels optimal"}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 relative overflow-hidden group">
          <div className="absolute right-3 top-3 opacity-10 text-slate-400 group-hover:opacity-25 transition-all">
            <MapPin size={32} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Fleet Dispatches</span>
          <div className="text-xl font-extrabold text-white">{transitDeliveries} Deliveries</div>
          <div className="text-[10px] text-blue-400 font-medium">Packages in physical transit route</div>
        </div>

      </div>

      {/* Low Stock Warners banner */}
      {criticalItems.length > 0 && (
        <div className="p-4 bg-red-950/40 border border-red-500/20 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
            <AlertTriangle size={15} />
            <span>Low Spare Stock Alarm: High Priority Procurement Needed</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {criticalItems.map(p => (
              <div key={p.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-900 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-200">{p.part_name}</div>
                  <div className="text-[10px] font-mono text-slate-500">SKU: {p.serial_number}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded font-mono font-bold">{p.stock_quantity} left</span>
                  <div className="text-[9px] text-slate-500 mt-0.5">Threshold: {p.low_stock_threshold}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main body: analytics indicators and logging stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left columns: system details */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Server size={14} className="text-amber-500" />
              SaaS Engine Core Metrics
            </h3>
            
            <div className="space-y-2 font-mono text-[11px] text-slate-400">
              <div className="flex justify-between py-1.5 border-b border-slate-850">
                <span>Database Node State</span>
                <span className="text-emerald-400 font-bold">ONLINE (SQLite)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-850">
                <span>Spare Parts Capital</span>
                <span className="text-slate-200">Br {inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-850">
                <span>Diagnostics Load</span>
                <span className="text-amber-400 font-bold">
                  {(tickets.filter(t => t.status === "In Progress").length / Math.max(tickets.length, 1) * 100).toFixed(0)}% Queue Capacity
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>Intranet Gate IP</span>
                <span className="text-teal-400">192.168.1.144</span>
              </div>
            </div>

            <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-lg text-[11px] leading-relaxed text-slate-400 text-left">
              <strong>CRM Data Safety Notice:</strong> All repair logs, inventory levels, and dispatch states are maintained inside reactive SQLite data layers to avoid transactional delays.
            </div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={14} className="text-amber-500" />
              Quick Financial Summary
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-center">
                <span className="text-[9px] text-slate-500 block uppercase font-mono">Invoice Queue</span>
                <span className="text-base font-bold text-white font-mono">{tickets.length} Registered</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-center">
                <span className="text-[9px] text-slate-500 block uppercase font-mono">Active Customers</span>
                <span className="text-base font-bold text-white font-mono">{customers.length} Accounts</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Columns: logs */}
        <div className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock size={14} className="text-amber-500" />
              Recent Activity Logs
            </h3>
            <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-bold">LIVE FEED</span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {logs.slice(0, 10).map(log => (
              <div key={log.id} className="p-3 bg-slate-950 border border-slate-850 rounded-lg flex gap-3 text-xs text-left items-start">
                <span className={`px-2 py-0.5 font-mono text-[9px] rounded font-bold uppercase shrink-0 ${
                  log.action_type === "LOGIN"
                    ? "bg-blue-900/15 text-blue-400 border border-blue-500/20"
                    : log.action_type.includes("CREATE")
                    ? "bg-emerald-950 text-teal-400 border border-teal-500/20"
                    : log.action_type.includes("DEDUCT")
                    ? "bg-red-950 text-red-400 border border-red-500/20"
                    : "bg-slate-900 text-slate-400 border border-slate-800"
                }`}>
                  {log.action_type}
                </span>

                <div className="space-y-1 flex-1">
                  <p className="text-slate-200 text-xs leading-relaxed">{log.details}</p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.created_at).toLocaleTimeString()} | Operator: {log.userName} | Module: {log.affected_module}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
