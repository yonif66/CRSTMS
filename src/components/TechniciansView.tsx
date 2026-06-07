import { Cpu, Users, Award, ShieldCheck } from "lucide-react";
import { Technician } from "../types";

interface TechniciansViewProps {
  technicians: Technician[];
}

export default function TechniciansView({ technicians }: TechniciansViewProps) {
  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="pb-3 border-b border-slate-800/80">
        <h2 className="text-xl font-bold text-white font-display">Technical Repair Specialists</h2>
        <p className="text-xs text-slate-400">Track on-bench repair specialists, expertise specialties, assignments load distribution, and workstation desk locations.</p>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {technicians.map(tech => (
          <div key={tech.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 text-xs font-sans relative overflow-hidden group">
            
            {/* Upper availability badge */}
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                {tech.name.charAt(0)}
              </div>
              
              <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase border ${
                tech.availability === "Available"
                  ? "bg-emerald-950 text-emerald-400 border-teal-500/20"
                  : tech.availability === "Busy"
                  ? "bg-amber-950 text-amber-500 border-amber-500/20"
                  : "bg-red-950 text-red-400 border-red-500/20"
              }`}>
                {tech.availability}
              </span>
            </div>

            {/* Profile info */}
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white transition-colors group-hover:text-amber-500">{tech.name}</h4>
              <p className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                <Award size={11} className="text-slate-500 shrink-0" />
                <span>Expertise: {tech.speciality}</span>
              </p>
            </div>

            {/* Stats */}
            <div className="pt-3 border-t border-slate-850 grid grid-cols-2 gap-2 text-slate-400">
              <div>
                <span className="text-[9px] block text-slate-500 uppercase font-mono">Workstation Desk</span>
                <span className="font-bold text-slate-200">{tech.desk}</span>
              </div>
              <div>
                <span className="text-[9px] block text-slate-500 uppercase font-mono">Active Workload</span>
                <span className="font-bold text-slate-200">{tech.assignedTicketsCount} Handled Jobs</span>
              </div>
            </div>

            {/* Micro Solder validation badge */}
            <div className="pt-2 flex justify-end">
              <div className="inline-flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                <ShieldCheck size={11} />
                <span>ArgonSolder Certified</span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
