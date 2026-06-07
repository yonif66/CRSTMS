import { useState } from "react";
import { Search, Shield, Clock } from "lucide-react";
import { SystemLog } from "../types";

interface AuditingViewProps {
  logs: SystemLog[];
}

export default function AuditingView({ logs }: AuditingViewProps) {
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const filteredLogs = logs.filter(l => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = q === "" || 
      l.details.toLowerCase().includes(q) ||
      l.userName.toLowerCase().includes(q) ||
      l.affected_module.toLowerCase().includes(q);
    
    const matchesFilter = filterType === "ALL" || l.action_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="pb-3 border-b border-slate-800/80">
        <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
          <Shield className="text-amber-500" size={20} />
          Operations Audit Logs
        </h2>
        <p className="text-xs text-slate-400">Track system actions, status updates, and logging events across staff operations.</p>
      </div>

      {/* Filter and Search controls */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between text-xs">
        
        {/* Search bar */}
        <div className="w-full md:max-w-md flex bg-slate-950 border border-slate-800 rounded-lg overflow-hidden px-3 py-1.5 items-center gap-2">
          <Search size={14} className="text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search auditing files by operator, description details..."
            className="bg-transparent border-0 focus:outline-none text-slate-300 placeholder-slate-600 text-xs w-full"
          />
        </div>

        {/* Action Type Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto self-start md:self-auto font-sans">
          <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">Action Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 p-2 rounded text-slate-300 focus:outline-none focus:border-amber-500 scrollbar-none"
          >
            <option value="ALL">-- ALL CODES --</option>
            <option value="LOGIN">LOGIN</option>
            <option value="CREATE_CUSTOMER">CREATE CUSTOMER</option>
            <option value="CREATE_TICKET">CREATE TICKET</option>
            <option value="UPDATE_TICKET">UPDATE TICKET</option>
            <option value="DEDUCT_PART">DEDUCT PART</option>
            <option value="GENERATE_INVOICE">GENERATE INVOICE</option>
            <option value="PAY_INVOICE">PAY INVOICE</option>
          </select>
        </div>

      </div>

      {/* Tables log stream */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        
        <div className="overflow-x-auto text-[11px] font-mono">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap">
                <th className="py-2 px-3">TIMESTAMP</th>
                <th className="py-2 px-3">ACTION</th>
                <th className="py-2 px-3">USER</th>
                <th className="py-2 px-3">MODULE</th>
                <th className="py-2 px-3">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 italic">No activity logs found.</td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-950/10">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action_type === "LOGIN"
                          ? "bg-blue-950 text-blue-400 border border-blue-500/10"
                          : log.action_type.includes("CREATE")
                          ? "bg-emerald-950 text-emerald-400 border border-teal-500/10"
                          : log.action_type.includes("DEDUCT") || log.action_type.includes("FAIL")
                          ? "bg-red-950 text-red-500 border border-red-500/10"
                          : "bg-slate-950 text-slate-400 border border-slate-800"
                      }`}>
                        {log.action_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">{log.userName}</td>
                    <td className="py-3 px-3 text-amber-500 font-semibold">{log.affected_module}</td>
                    <td className="py-3 px-3 text-slate-350 leading-relaxed font-sans">{log.details}</td>
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
