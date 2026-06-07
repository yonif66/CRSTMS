<?php
/**
 * CRSTMS - Technician Assignments Panel
 */
?>
<div class="space-y-6">
    <div class="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
            <h1 class="text-2xl font-bold text-white">Technician Diagnostics Board</h1>
            <p class="text-xs text-slate-400">Assigned repair queues, parts consumption records, and status updates.</p>
        </div>
        <span class="text-xs bg-slate-800 border border-slate-700 px-3 py-1 rounded text-amber-400 font-mono font-bold">Tech Speciality: Solder Work & Logic Boards</span>
    </div>

    <!-- Main Board Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Ticket Queue -->
        <div class="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 class="text-sm font-bold text-white">Enrolled Repair Tickets Queue</h3>
            <div class="space-y-3">
                <?php foreach ($tickets as $t): ?>
                    <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                        <div class="flex justify-between items-center text-xs">
                            <span class="font-mono text-amber-400 font-bold">Ticket ID: #<?= $t['id'] ?></span>
                            <span class="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20"><?= $t['status'] ?></span>
                        </div>
                        <div class="text-xs text-slate-300">
                            <strong>Owner Customer:</strong> <?= htmlspecialchars($t['customer_name']) ?> | <strong>Hardware:</strong> <?= htmlspecialchars($t['device_brand']) ?> (<?= htmlspecialchars($t['device_model']) ?>)
                        </div>
                        <p class="text-xs text-slate-400 italic">"<?= htmlspecialchars($t['issue_description']) ?>"</p>
                        
                        <!-- Internal Actions -->
                        <form action="/technician/ticket/update" method="POST" class="pt-3 border-t border-slate-800 flex items-center gap-3 flex-wrap text-xs">
                            <input type="hidden" name="ticket_id" value="<?= $t['id'] ?>">
                            <select name="status" class="bg-slate-900 border border-slate-800 rounded p-1.5 focus:outline-none text-slate-200">
                                <option value="In Progress">In Progress</option>
                                <option value="Waiting for Spare Parts">Waiting for Spare Parts</option>
                                <option value="Completed">Completed / Passed QA</option>
                            </select>
                            <input type="text" name="notes" placeholder="Diagnostic comments..." required class="flex-1 bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 focus:outline-none">
                            <button class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded font-bold transition-all">
                                Post Progress
                            </button>
                        </form>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Inventory consumption panel -->
        <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 class="text-sm font-bold text-white">Record Part Deduction</h3>
            <p class="text-xs text-slate-400">Deduct units physically used from inventory to trigger invoice calculations.</p>
            
            <form action="/technician/inventory/consume" method="POST" class="space-y-3 text-xs">
                <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                <div class="space-y-1">
                    <label class="text-slate-400 font-semibold">Reference Ticket ID</label>
                    <select name="ticket_id" class="w-full bg-slate-950 border border-slate-800 rounded p-2 focus:outline-none text-slate-200">
                        <?php foreach ($tickets as $t): ?>
                            <option value="<?= $t['id'] ?>">Ticket #<?= $t['id'] ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-slate-400 font-semibold">Part Used</label>
                    <select name="part_id" class="w-full bg-slate-950 border border-slate-800 rounded p-2 focus:outline-none text-slate-200">
                        <?php foreach ($inventory as $part): ?>
                            <option value="<?= $part['id'] ?>"><?= htmlspecialchars($part['part_name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <button class="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded transition-all mt-3">
                    Deduct & Record Usage
                </button>
            </form>
        </div>
    </div>
</div>