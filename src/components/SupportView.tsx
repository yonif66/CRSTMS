import * as React from "react";
import { useState } from "react";
import { Search, Mail, CheckCircle, RefreshCw } from "lucide-react";
import { Inquiry, User } from "../types";

interface SupportViewProps {
  inquiries: Inquiry[];
  user: User;
  onAnswerInquiry: (inqId: number, response: string) => void;
}

export default function SupportView({
  inquiries,
  user,
  onAnswerInquiry
}: SupportViewProps) {
  
  const [searchInq, setSearchInq] = useState("");
  const [selectedInqId, setSelectedInqId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const activeInquiry = inquiries.find(i => i.id === selectedInqId);

  const filteredInquiries = inquiries.filter(i => {
    const q = searchInq.trim().toLowerCase();
    if (!q) return true;
    return (
      i.clientName.toLowerCase().includes(q) ||
      i.messageText.toLowerCase().includes(q) ||
      i.status.toLowerCase().includes(q)
    );
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInqId || !replyText.trim()) {
      alert("Validation Error: Reply cannot be blank.");
      return;
    }

    onAnswerInquiry(selectedInqId, replyText);
    setReplyText("");
    setSelectedInqId(null);
    alert("Reply sent and inquiry marked Responded successfully.");
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white font-display">CSR Support Desk Channel</h2>
          <p className="text-xs text-slate-400">Receive client diagnostic requests, confirm device inquiries, and submit status threads.</p>
        </div>
      </div>

      {activeInquiry && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative space-y-4">
          <button
            onClick={() => setSelectedInqId(null)}
            className="absolute right-4 top-4 text-slate-500 hover:text-white text-xs bg-slate-950 px-2 py-0.5 border border-slate-850 rounded cursor-pointer"
          >
            Close Conversation
          </button>

          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Mail size={14} className="text-amber-500" />
            Respond to Message Thread (ID: #{activeInquiry.id})
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg text-left">
              <span className="text-[10px] font-bold text-amber-500 font-mono block mb-1">CUSTOMER MESSAGE (Sender: {activeInquiry.clientName})</span>
              <p className="text-slate-300 italic text-xs leading-relaxed">&ldquo;{activeInquiry.messageText}&rdquo;</p>
            </div>

            {activeInquiry.responseText ? (
              <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg text-left pl-6">
                <span className="text-[10px] font-bold text-teal-400 font-mono block mb-1">OPERATOR RESPONSE</span>
                <p className="text-slate-400 text-xs leading-relaxed">{activeInquiry.responseText}</p>
              </div>
            ) : (
              <form onSubmit={handleReplySubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Write response thread text *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide diagnostic updates or status reports..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 focus:outline-none focus:border-amber-550"
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    Send Response Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Grid Table */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        
        <div className="max-w-md flex bg-slate-950 border border-slate-800 rounded-lg overflow-hidden px-3 py-1.5 items-center gap-2">
          <Search size={14} className="text-slate-500" />
          <input
            type="text"
            value={searchInq}
            onChange={(e) => setSearchInq(e.target.value)}
            placeholder="Search inquiries messages, status, sender name..."
            className="bg-transparent border-0 focus:outline-none text-slate-300 placeholder-slate-600 text-xs w-full"
          />
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left font-sans">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap">
                <th className="py-2 px-3">MSG ID</th>
                <th className="py-2 px-3">CLIENT SENDER</th>
                <th className="py-2 px-3">MESSAGE CONTENT TEXT</th>
                <th className="py-2 px-3 text-center">THREAD STATUS</th>
                <th className="py-2 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 italic">No inquiries found in channels.</td>
                </tr>
              ) : (
                filteredInquiries.map(i => (
                  <tr key={i.id} className="hover:bg-slate-950/20">
                    <td className="py-3 px-3 font-mono text-slate-500">#CSR-00{i.id}</td>
                    <td className="py-3 px-3 font-semibold text-white">{i.clientName}</td>
                    <td className="py-3 px-3 text-slate-400 max-w-sm truncate" title={i.messageText}>
                      {i.messageText}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${
                        i.status === "Responded"
                          ? "bg-emerald-950 text-teal-400 border-teal-500/25"
                          : "bg-amber-950 text-amber-500 border-amber-500/15"
                      }`}>
                        {i.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedInqId(i.id)}
                        className="p-1 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-850 hover:border-amber-500 text-slate-400 hover:text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        {i.status === "Responded" ? "View Conversation" : "Reply Thread"}
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
