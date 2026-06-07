<?php 
/**
 * CRSTMS - Service Ticket Detail & Workspace
 */
?>
<div class="space-y-6 text-left text-xs">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-slate-800 gap-4">
        <div>
            <h2 class="text-xl font-bold text-white font-display">Intake File: Ref #TRD<?= h($ticket['id']) ?></h2>
            <p class="text-xs text-slate-400 font-sans">Spawned: <?= date('d M Y H:i', strtotime($ticket['created_at'])) ?> | Last sync: <?= date('d M Y H:i', strtotime($ticket['updated_at'])) ?></p>
        </div>
        <a href="/tickets" class="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded text-xs">&larr; Queue Directory</a>
    </div>

    <!-- Details -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main details -->
        <div class="lg:col-span-2 space-y-4">
            <!-- Specs grid -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <h3 class="font-bold text-white uppercase text-[10px] tracking-wide border-b border-slate-800 pb-1">Client owner specifications</h3>
                    <p class="text-slate-303"><strong>Name:</strong> <?= h($ticket['customer_name']) ?></p>
                    <p class="text-slate-404"><strong>Email:</strong> <?= h($ticket['customer_email']) ?> | <strong>Phone:</strong> <?= h($ticket['customer_phone']) ?></p>
                </div>

                <div class="space-y-2">
                    <h3 class="font-bold text-white uppercase text-[10px] tracking-wide border-b border-slate-800 pb-1">Hardware specs</h3>
                    <p class="text-slate-202"><strong>Model:</strong> <?= h($ticket['device_brand']) ?> <?= h($ticket['device_model']) ?></p>
                    <p class="text-slate-405"><strong>Serial key:</strong> <code class="font-mono text-amber-500 bg-slate-950 px-1 py-0.5 rounded text-[10px]"><?= h($ticket['device_serial']) ?></code></p>
                </div>

                <div class="sm:col-span-2 p-3 bg-slate-950 rounded border border-slate-800">
                    <h4 class="font-bold text-white uppercase text-[9px] mb-1">Reported symptoms during intake check-in:</h4>
                    <p class="text-slate-305 italic leading-relaxed">&ldquo;<?= h($ticket['issue_description']) ?>&rdquo;</p>
                </div>
            </div>

            <!-- Diagnostics -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 class="font-bold text-white uppercase tracking-wider text-[10px]">Technical Assessment Logs Feed</h3>

                <?php if (empty($updates)): ?>
                    <p class="text-slate-505 italic">No diagnostic assessor notes posted yet. Diagnostic bench idle.</p>
                <?php else: ?>
                    <div class="space-y-3.5 pl-3 border-l-2 border-slate-800">
                        <?php foreach ($updates as $u): ?>
                            <div class="space-y-1 relative pl-3">
                                <span class="absolute w-2 h-2 rounded-full -left-[18px] top-1 bg-amber-500"></span>
                                <div class="flex justify-between text-[11px]">
                                    <strong class="text-slate-300"><?= h($u['technician_name']) ?> (Bench Assessor)</strong>
                                    <span class="font-mono text-slate-500"><?= date('d H:i', strtotime($u['created_at'])) ?></span>
                                </div>
                                <div class="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-amber-400 inline-block font-mono mb-1"><?= h($u['update_status']) ?></div>
                                <p class="text-slate-400 leading-normal bg-slate-950/20 p-2 border border-slate-800 rounded font-medium"><?= h($u['diagnostic_notes']) ?></p>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Forms -->
        <div class="space-y-4">
            <!-- Allocations form for Clerks / Admins -->
            <?php if (in_array($_SESSION['user_role'], ['Admin', 'Receptionist'])): ?>
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                    <h3 class="font-bold text-white uppercase text-[10px] tracking-wide">Bench Assignment Panel</h3>
                    <form method="POST" action="/tickets/assign" class="space-y-2.5">
                        <input type="hidden" name="ticket_id" value="<?= $ticket['id'] ?>" />
                        <select name="technician_id" class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300">
                            <option value="">-- Release to Pool (Unassigned) --</option>
                            <?php foreach ($technicians as $tech): ?>
                                <option value="<?= $tech['id'] ?>" <?= $ticket['technician_id'] === $tech['id'] ? 'selected' : '' ?>>
                                    <?= h($tech['full_name']) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <button type="submit" class="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded cursor-pointer transition text-center font-sans">
                            Confirm allocation
                        </button>
                    </form>
                </div>
            <?php endif; ?>

            <!-- Bench controls for Technician / Admin -->
            <?php if (in_array($_SESSION['user_role'], ['Admin', 'Technician'])): ?>
                <!-- Diagnostician Actions form -->
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                    <h3 class="font-bold text-white uppercase text-[10px] tracking-wide">ASSESSOR DIAGNOSTIC BOARD</h3>
                    <form method="POST" action="/tickets/update" class="space-y-2.5">
                        <input type="hidden" name="ticket_id" value="<?= $ticket['id'] ?>" />
                        <div>
                            <label class="text-[10px] font-bold text-slate-450 block mb-1">State Transition</label>
                            <select name="status" class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300">
                                <option value="In Progress" <?= $ticket['status'] === 'In Progress' ? 'selected' : '' ?>>In Progress / Diagnosing</option>
                                <option value="Waiting for Spare Parts" <?= $ticket['status'] === 'Waiting for Spare Parts' ? 'selected' : '' ?>>Waiting for Spare Parts</option>
                                <option value="Completed" <?= $ticket['status'] === 'Completed' ? 'selected' : '' ?>>Completed / Passed QA</option>
                                <option value="Delivered" <?= $ticket['status'] === 'Delivered' ? 'selected' : '' ?>>Handovers / Delivered</option>
                                <option value="Closed" <?= $ticket['status'] === 'Closed' ? 'selected' : '' ?>>Closed file</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-slate-450 block mb-1">Deducted notes of process details</label>
                            <textarea name="diagnostic_notes" rows="3" required placeholder="Cleaned thermal paste, verified dynamic rails, solder repair done..." class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 placeholder-slate-700"></textarea>
                        </div>
                        <button type="submit" class="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded cursor-pointer transition text-center font-sans shadow">
                            Save Diagnostics Feed entry
                        </button>
                    </form>
                </div>

                <!-- Part usage billing subtraction panel -->
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                    <h3 class="font-bold text-white uppercase text-[10px] tracking-wide">Record Workshop Material Usage</h3>
                    <form method="POST" action="/tickets/consume" class="grid grid-cols-3 gap-2 align-items-end">
                        <input type="hidden" name="ticket_id" value="<?= $ticket['id'] ?>" />
                        <div class="col-span-2">
                            <label class="text-[10px] font-bold text-slate-450 block mb-1">Deducted spare part</label>
                            <select name="part_id" class="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200">
                                <?php foreach ($parts as $p): ?>
                                    <option value="<?= $p['id'] ?>">
                                        <?= h($p['part_name']) ?> (<?= $p['stock_quantity'] ?> left) — $<?= number_format($p['unit_price'], 2) ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-slate-450 block mb-1">Qty</label>
                            <input name="quantity" type="number" min="1" value="1" required class="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-200 font-mono text-center" />
                        </div>
                        <button type="submit" class="col-span-3 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-slate-950 border border-amber-500/15 font-bold rounded cursor-pointer transition text-center font-sans tracking-wide">
                            Consume Module Component
                        </button>
                    </form>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>