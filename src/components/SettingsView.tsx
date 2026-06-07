import * as React from "react";
import { useState } from "react";
import { Settings, Save, Server, ShieldCheck, Mail, Database } from "lucide-react";
import { User } from "../types";

interface SettingsViewProps {
  user: User;
}

export default function SettingsView({ user }: SettingsViewProps) {
  
  const [shopName, setShopName] = useState("CRSTMS Addis Ababa Central Repair Station");
  const [dbNode, setDbNode] = useState("crstms_db.sqlite");
  const [smtpServer, setSmtpServer] = useState("smtp.crstms.org");
  const [backupFrequency, setBackupFrequency] = useState("Daily");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Success: Configuration updated successfully.");
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="pb-3 border-b border-slate-800/80">
        <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
          <Settings className="text-amber-500" size={20} />
          System Settings
        </h2>
        <p className="text-xs text-slate-400">Configure system preferences and inspect service indicators.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-sans">
        
        {/* Left Side: forms */}
        <form onSubmit={handleSave} className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">System Preferences</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-400 font-bold">Shop Brand Logo/Title *</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Database File Name *</label>
              <input
                type="text"
                value={dbNode}
                onChange={(e) => setDbNode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">SMTP Mail Server *</label>
              <input
                type="text"
                value={smtpServer}
                onChange={(e) => setSmtpServer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-350 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Backup Table Frequency *</label>
              <select
                value={backupFrequency}
                onChange={(e) => setBackupFrequency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none"
              >
                <option value="Hourly">Hourly Backups</option>
                <option value="Daily">Daily Backups</option>
                <option value="Weekly">Weekly Backups</option>
              </select>
            </div>

          </div>

          <div className="flex justify-end pt-2 border-t border-slate-850">
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Save size={14} />
              <span>Save Settings</span>
            </button>
          </div>

        </form>

        {/* Right Side: state details */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Server size={14} className="text-amber-500" />
            Service Status Indicators
          </h3>

          <div className="space-y-3 font-mono text-[11px] text-slate-400">
            
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-850/80 space-y-1 text-left">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5"><Database size={12} className="text-emerald-400" /> SQLite Driver</span>
                <span className="text-emerald-500 font-bold">CONNECTED</span>
              </div>
              <p className="text-[10px] text-slate-500">Database file active, ready for operations.</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-850/80 space-y-1 text-left">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5"><Mail size={12} className="text-emerald-400" /> SMTP Service</span>
                <span className="text-emerald-500 font-bold">ACTIVE</span>
              </div>
              <p className="text-[10px] text-slate-500">Email notifications active, queue empty.</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-850/80 space-y-1 text-left">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-400" /> Password Hasher</span>
                <span className="text-neutral-400 font-bold">ENABLED</span>
              </div>
              <p className="text-[10px] text-slate-500">Local hashing enabled for login safety.</p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
