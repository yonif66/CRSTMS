<?php 
/**
 * CRSTMS - Repair Ticket Intake View
 */
?>
<div class="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl text-left">
    <div class="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
            <h2 class="text-xl font-bold text-white font-display">New Repair service check-in</h2>
            <p class="text-xs text-slate-400">Validate hardware specifications, details, deadlines, and technician task allocations.</p>
        </div>
        <a href="/tickets" class="px-3 py-1.5 bg-slate-950 border border-slate-805 text-slate-300 hover:text-white rounded text-xs transition duration-150">&larr; Back to Listings</a>
    </div>

    <?php if (!empty($errors)): ?>
        <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3.5 my-4 text-xs text-red-400 font-medium">
            <strong class="block mb-1">Validation Failures:</strong>
            <ul class="list-disc pl-4 space-y-1">
                <?php foreach($errors as $err): ?>
                    <li><?= h($err) ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>

    <form method="POST" action="/tickets/create" class="space-y-4 mt-4 text-xs">
        <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>" />

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
                <label class="text-slate-400 font-bold">Select Client customer *</label>
                <select name="customer_id" id="client_select" class="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-300" onchange="window.location.search = '?customer_id=' + this.value">
                    <option value="">-- Choose registered customer --</option>
                    <?php foreach ($customers as $c): ?>
                        <option value="<?= $c['id'] ?>" <?= ($input['customer_id'] ?? 0) === $c['id'] ? 'selected' : '' ?>>
                            <?= h($c['full_name']) ?> (<?= h($c['email']) ?>)
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="space-y-1">
                <label class="text-slate-400 font-bold">Assigned Client Hardware Spec *</label>
                <select name="device_id" required class="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-300">
                    <option value="">-- Choose hardware device --</option>
                    <?php foreach ($devices as $d): ?>
                        <option value="<?= $d['id'] ?>" <?= ($input['device_id'] ?? 0) === $d['id'] ? 'selected' : '' ?>>
                            <?= h($d['brand']) ?> <?= h($d['model']) ?> [SN: <?= h($d['serial_number']) ?>]
                        </option>
                    <?php endforeach; ?>
                </select>
                <?php if (empty($devices) && !empty($input['customer_id'])): ?>
                    <span class="text-amber-500 text-[10px] block mt-1 font-mono">No hardware linked. Register a device first!</span>
                <?php endif; ?>
            </div>

            <div class="space-y-1">
                <label class="text-slate-400 font-bold">Priority Level *</label>
                <select name="priority" required class="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-300 font-bold">
                    <option value="Low">Green Priority (Minor Faults)</option>
                    <option value="Medium" selected>Amber Priority (Average Queue)</option>
                    <option value="High">Red Priority (Immediate / Solder Diagnostic)</option>
                    <option value="Urgent">CRITICAL SLA (Business Crucial)</option>
                </select>
            </div>

            <div class="space-y-1">
                <label class="text-slate-400 font-bold">Estimated Handover / Target Completion</label>
                <input type="date" name="estimated_completion_date" class="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-300 font-mono" />
            </div>

            <div class="sm:col-span-2 space-y-1">
                <label class="text-slate-400 font-bold">Assigned Diagnostics bench Technician</label>
                <select name="technician_id" class="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-300">
                    <option value="">-- Keep in repair pool (Unassigned) --</option>
                    <?php foreach ($technicians as $t): ?>
                        <option value="<?= $t['id'] ?>" <?= ($input['technician_id'] ?? 0) === $t['id'] ? 'selected' : '' ?>>
                            <?= h($t['full_name']) ?> — Specialized Bench Assessor
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="sm:col-span-2 space-y-1">
                <label class="text-slate-400 font-bold">Detailed Intake Symptoms & Fault Profile *</label>
                <textarea name="issue_description" required rows="4" placeholder="Case buckle, battery degrades, liquid exposure, solder diagnostics requested..." class="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-300 placeholder-slate-600 leading-relaxed"><?= h($input['issue_description'] ?? '') ?></textarea>
            </div>
        </div>

        <button type="submit" class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition duration-200 uppercase tracking-wider font-sans cursor-pointer text-center">
            Commit intake, spawn service tracking timeline
        </button>
    </form>
</div>