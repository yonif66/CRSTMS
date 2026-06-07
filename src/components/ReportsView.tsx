import { Cpu, Receipt, Users, AlertTriangle, TrendingUp, BarChart2 } from "lucide-react";
import { Invoice, RepairTicket, SparePart } from "../types";

interface ReportsViewProps {
  invoices: Invoice[];
  tickets: RepairTicket[];
  inventory: SparePart[];
}

export default function ReportsView({
  invoices,
  tickets,
  inventory
}: ReportsViewProps) {
  
  // Calculations
  const totalRevenue = invoices
    .filter(i => i.payment_status === "Paid")
    .reduce((acc, i) => acc + i.total_amount, 0);

  const pendingRevenue = invoices
    .filter(i => i.payment_status === "Unpaid")
    .reduce((acc, i) => acc + i.total_amount, 0);

  const completedTickets = tickets.filter(t => t.status === "Completed").length;
  const activeQueued = tickets.filter(t => t.status !== "Completed").length;

  const totalReplenishPartsVal = inventory.reduce((acc, p) => acc + (p.stock_quantity * p.unit_price), 0);

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="pb-3 border-b border-slate-800/80">
        <h2 className="text-xl font-bold text-white font-display">Business Intelligence &amp; Analytical Reports</h2>
        <p className="text-xs text-slate-400">Review cumulative monthly revenues, asset depletion statistics, and repair pipeline analytics.</p>
      </div>

      {/* Grid Summaries */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1 text-left">
          <span className="text-[10px] font-bold uppercase text-slate-500 font-mono block">Aggregate Revenue</span>
          <div className="text-xl font-extrabold text-teal-400 font-mono">Br {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <p className="text-[9px] text-slate-500">Representing completed receipts</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1 text-left">
          <span className="text-[10px] font-bold uppercase text-slate-500 font-mono block">Unpaid Debts</span>
          <div className="text-xl font-extrabold text-amber-500 font-mono">Br {pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <p className="text-[9px] text-slate-500">Invoices issued and outstanding</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1 text-left">
          <span className="text-[10px] font-bold uppercase text-slate-500 font-mono block">Pipeline Throughput</span>
          <div className="text-xl font-extrabold text-white font-mono">
            {(completedTickets / Math.max(tickets.length, 1) * 100).toFixed(0)}% Completed
          </div>
          <p className="text-[9px] text-slate-500">{completedTickets} of {tickets.length} tickets passed</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1 text-left">
          <span className="text-[10px] font-bold uppercase text-slate-500 font-mono block">Current Parts Capital</span>
          <div className="text-xl font-extrabold text-emerald-400 font-mono">Br {totalReplenishPartsVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <p className="text-[9px] text-slate-500">SaaS inventory capital evaluation</p>
        </div>

      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left chart: Revenue Stream visualiser */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-850">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 size={14} className="text-amber-500" />
              Monthly Diagnostic Earnings Stream (Br)
            </h4>
            <span className="text-[9px] bg-slate-850 text-slate-400 px-2 py-0.5 rounded font-mono font-bold">CY2026 FORECAST</span>
          </div>

          <div className="h-64 flex items-end gap-4 pt-10 px-4 font-mono select-none">
            {/* March */}
            <div className="flex-1 flex flex-col items-center gap-2 group">
              <div className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 px-1 py-0.5 rounded font-mono">Br 62,000</div>
              <div className="w-full bg-slate-800 group-hover:bg-amber-500 h-24 rounded-t transition-colors relative" />
              <span className="text-[10px] text-slate-500 mt-1 uppercase font-bold">MAR</span>
            </div>
            {/* April */}
            <div className="flex-1 flex flex-col items-center gap-2 group">
              <div className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 px-1 py-0.5 rounded font-mono">Br 99,000</div>
              <div className="w-full bg-slate-800 group-hover:bg-amber-500 h-40 rounded-t transition-all relative" />
              <span className="text-[10px] text-slate-500 mt-1 uppercase font-bold">APR</span>
            </div>
            {/* May */}
            <div className="flex-1 flex flex-col items-center gap-2 group">
              <div className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 px-1 py-0.5 rounded font-mono">Br {totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              <div className="w-full bg-amber-500 h-52 rounded-t transition-all relative shadow-lg shadow-amber-500/10" />
              <span className="text-[10px] font-bold text-slate-200 mt-1 uppercase">MAY (ACTIVE)</span>
            </div>
            {/* June */}
            <div className="flex-1 flex flex-col items-center gap-2 group">
              <div className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 px-1 py-0.5 rounded font-mono">Br 120,000</div>
              <div className="w-full bg-slate-800/60 group-hover:bg-amber-500 h-32 rounded-t transition-all relative" />
              <span className="text-[10px] text-slate-500 mt-1 uppercase font-bold">JUN*</span>
            </div>
          </div>
          
          <p className="text-[10px] text-left text-slate-500 italic mt-2">Charts reflect direct labor charges + inventory component markups validated inside active billing ledgers.</p>
        </div>

        {/* Right chart: Components analysis */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-850">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 size={14} className="text-amber-500" />
              Spare Inventory SKU Stock Breakdown
            </h4>
            <span className="text-[9px] bg-slate-850 text-slate-400 px-2 py-0.5 rounded font-mono font-bold font-semibold">DBMS BUFFER</span>
          </div>

          <div className="space-y-4 pt-4 text-xs font-sans">
            {inventory.map(part => {
              const stockRatio = Math.min((part.stock_quantity / 15) * 100, 100);
              const isUnderLimit = part.stock_quantity <= part.low_stock_threshold;

              return (
                <div key={part.id} className="space-y-1.5 text-left">
                  <div className="flex justify-between text-slate-350 font-medium">
                    <span>{part.part_name}</span>
                    <span className="font-mono text-slate-300 font-bold">{part.stock_quantity} units available</span>
                  </div>
                  
                  {/* Visual Progress bar */}
                  <div className="w-full bg-slate-950 h-2 rounded border border-slate-850 overflow-hidden">
                    <div
                      style={{ width: `${stockRatio}%` }}
                      className={`h-full transition-all duration-500 ${isUnderLimit ? "bg-red-500" : "bg-emerald-400"}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
