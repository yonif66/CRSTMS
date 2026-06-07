import * as React from "react";
import { useState } from "react";
import { Package, Search, Plus, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";
import { SparePart, User } from "../types";

interface InventoryViewProps {
  inventory: SparePart[];
  user: User;
  onModifyStock: (pId: number, adjustment: number) => void;
  onRegisterPart: (partName: string, sn: string, initialQty: number, price: number, threshold: number) => boolean;
}

export default function InventoryView({
  inventory,
  user,
  onModifyStock,
  onRegisterPart
}: InventoryViewProps) {
  
  const [partSearch, setPartSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [partName, setPartName] = useState("");
  const [serialCode, setSerialCode] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [price, setPrice] = useState("45.00");
  const [threshold, setThreshold] = useState("3");

  const filteredInventory = inventory.filter(p => {
    const q = partSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      p.part_name.toLowerCase().includes(q) ||
      p.serial_number.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyInt = parseInt(quantity);
    const prFloat = parseFloat(price);
    const thInt = parseInt(threshold);

    if (!partName.trim() || !serialCode.trim() || isNaN(qtyInt) || isNaN(prFloat) || isNaN(thInt)) {
      alert("Validation Error: Please enter valid parameters.");
      return;
    }

    const success = onRegisterPart(partName, serialCode, qtyInt, prFloat, thInt);
    if (success) {
      setPartName("");
      setSerialCode("");
      setQuantity("10");
      setPrice("45.00");
      setThreshold("3");
      setShowAddForm(false);
      alert("Success: Spare Part SKU entered cleanly inside inventory buffer.");
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Spare Parts &amp; Inventory</h2>
          <p className="text-xs text-slate-400">Track current components stock levels, adjust SKU listings, and verify safety bounds warnings.</p>
        </div>
        
        {["Admin", "Receptionist"].includes(user.role) && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Plus size={14} />
            <span>Enroll Spare Part SKU</span>
          </button>
        )}
      </div>

      {/* Registration Form */}
      {showAddForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Package size={15} className="text-amber-500" />
              Enroll Spare Component (Active Record Schema Entry)
            </h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-slate-500 hover:text-white text-xs bg-slate-950 px-2 py-0.5 border border-slate-800 rounded cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs text-left">
            
            <div className="space-y-1 col-span-1 sm:col-span-2">
              <label className="text-slate-400 font-bold">Component Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Kingston 16GB Tech RAM"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Serial barcode SKU *</label>
              <input
                required
                type="text"
                placeholder="SKU-KING-16"
                value={serialCode}
                onChange={(e) => setSerialCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="space-y-1 font-sans">
              <label className="text-slate-400 font-bold">Initial Stock Count *</label>
              <input
                required
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Unit Retail Price (Br) *</label>
              <input
                required
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Low-Stock Alert limit *</label>
              <input
                required
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="col-span-1 sm:col-span-2 lg:col-span-5 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-all shadow-md"
              >
                Insert Component SKU
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Main Grid table */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        
        <div className="max-w-md flex bg-slate-950 border border-slate-800 rounded-lg overflow-hidden px-3 py-1.5 items-center gap-2">
          <Search size={14} className="text-slate-500" />
          <input
            type="text"
            value={partSearch}
            onChange={(e) => setPartSearch(e.target.value)}
            placeholder="Search parts catalog by title name or inventory SKU..."
            className="bg-transparent border-0 focus:outline-none text-slate-300 placeholder-slate-600 text-xs w-full"
          />
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left font-sans">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap">
                <th className="py-2 px-3">INVENTORY SKU</th>
                <th className="py-2 px-3">PART TITLE</th>
                <th className="py-1 px-3 text-center">SAFETY BOUNDS STATUS</th>
                <th className="py-2 px-3 text-center">UNITS IN DB BUFFER</th>
                <th className="py-2 px-3 text-right">UNIT PRICE</th>
                <th className="py-2 px-4 text-center">LEVEL CONTROL ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 italic">No spare parts found matching the query context.</td>
                </tr>
              ) : (
                filteredInventory.map(part => {
                  const isUnderLimit = part.stock_quantity <= part.low_stock_threshold;
                  return (
                    <tr key={part.id} className="hover:bg-slate-950/20 text-slate-300">
                      <td className="py-3.5 px-3 font-mono text-amber-500 font-semibold">{part.serial_number}</td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-white">{part.part_name}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {isUnderLimit ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-950 text-red-400 rounded-full font-mono text-[9px] font-bold border border-red-500/20">
                            <AlertTriangle size={10} />
                            <span>LOW STOCK LIMIT</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-full font-mono text-[9px] font-bold border border-emerald-555/20">
                            <span>OPTIMAL</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded ${isUnderLimit ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                          {part.stock_quantity} Units
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-400">Br {part.unit_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex rounded-lg border border-slate-800 overflow-hidden bg-slate-950 p-0.5 gap-1">
                          <button
                            onClick={() => onModifyStock(part.id, 1)}
                            className="p-1 px-2.5 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                            title="Rapid Check-in (+1)"
                          >
                            <ArrowUp size={11} className="text-emerald-500" />
                            <span>ADD</span>
                          </button>
                          <div className="w-[1px] bg-slate-800 h-4 mt-1" />
                          <button
                            disabled={part.stock_quantity <= 0}
                            onClick={() => onModifyStock(part.id, -1)}
                            className={`p-1 px-2.5 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer ${
                              part.stock_quantity <= 0 ? "opacity-30 cursor-not-allowed" : ""
                            }`}
                            title="Register Outtake (-1)"
                          >
                            <ArrowDown size={11} className="text-red-400" />
                            <span>DEC</span>
                          </button>
                        </div>
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
