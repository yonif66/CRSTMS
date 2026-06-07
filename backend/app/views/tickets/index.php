<?php 
/**
 * CRSTMS - Maintenance Tickets List view
 */
?>
<div class="space-y-6 text-left">
    <div class="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-3 gap-4">
        <div>
            <h2 class="text-xl font-bold text-white font-display">Service Tracking Directory</h2>
            <p class="text-xs text-slate-400">Search customer tickets, inspect assigned technicians, track queue priorities, and export audit sheets.</p>
        </div>
        <?php if ($_SESSION['user_role'] !== 'Customer'): ?>
            <a href="/tickets/create" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition whitespace-nowrap">
                + intake hardware check-in
            </a>
        <?php endif; ?>
    </div>

    <!-- Filters -->
    <form method="GET" action="/tickets" class="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div class="space-y-1">
            <label class="text-slate-400 font-bold">Search Keywords</label>
            <input type="text" name="search" placeholder="Ref code, client, serial..." value="<?= h($filters['search']) ?>" class="w-full bg-slate-950 border border-slate-800 rounded p-2" />
        </div>

        <div class="space-y-1">
            <label class="text-slate-400 font-bold">Status Pipeline</label>
            <select name="status" class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300">
                <option value="">-- All Processes --</option>
                <option value="Created" <?= $filters['status'] === 'Created' ? 'selected' : '' ?>>Created</option>
                <option value="Assigned" <?= $filters['status'] === 'Assigned' ? 'selected' : '' ?>>Assigned</option>
                <option value="In Progress" <?= $filters['status'] === 'In Progress' ? 'selected' : '' ?>>In Progress</option>
                <option value="Waiting for Spare Parts" <?= $filters['status'] === 'Waiting for Spare Parts' ? 'selected' : '' ?>>Waiting for Spare Parts</option>
                <option value="Completed" <?= $filters['status'] === 'Completed' ? 'selected' : '' ?>>Completed / Passed QA</option>
                <option value="Delivered" <?= $filters['status'] === 'Delivered' ? 'selected' : '' ?>>Delivered</option>
                <option value="Closed" <?= $filters['status'] === 'Closed' ? 'selected' : '' ?>>Closed</option>
            </select>
        </div>

        <div class="space-y-1">
            <label class="text-slate-400 font-bold">Priority Status</label>
            <select name="priority" class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-305">
                <option value="">-- All priorities --</option>
                <option value="Low" <?= $filters['priority'] === 'Low' ? 'selected' : '' ?>>Minor Priority</option>
                <option value="Medium" <?= $filters['priority'] === 'Medium' ? 'selected' : '' ?>>Average Priority</option>
                <option value="High" <?= $filters['priority'] === 'High' ? 'selected' : '' ?>>High Priority</option>
                <option value="Urgent" <?= $filters['priority'] === 'Urgent' ? 'selected' : '' ?>>CRITICAL SLA</option>
            </select>
        </div>

        <div class="flex items-end gap-1.5">
            <button type="submit" class="flex-1 py-2 bg-slate-950 border border-slate-800 hover:border-amber-500 rounded text-amber-500 hover:text-amber-400 font-bold font-sans transition whitespace-nowrap cursor-pointer text-center">
                Query DBMS
            </button>
            <a href="/tickets" class="px-3 py-2 bg-slate-950 border border-slate-800 text-slate-450 hover:text-white rounded font-sans cursor-pointer text-center whitespace-nowrap">
                Clear
            </a>
        </div>
    </form>

    <!-- Table -->
    <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 text-xs">
        <table class="w-full border-collapse">
            <thead>
                <tr class="bg-slate-905 border-b border-slate-800 text-slate-500 font-bold uppercase text-[9px] tracking-wider text-left">
                    <th class="py-3 px-4">Service REF ID</th>
                    <th class="py-3 px-4">Client Customer</th>
                    <th class="py-3 px-4">Hardware Specs</th>
                    <th class="py-3 px-4">Active Status</th>
                    <th class="py-3 px-4">Assignee</th>
                    <th class="py-3 px-4 text-right">Task Access</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/40">
                <?php if (empty($tickets)): ?>
                    <tr>
                        <td colSpan="6" class="py-6 text-center text-slate-550 italic">No repair cases logged matching querying metrics.</td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($tickets as $t): ?>
                        <tr class="hover:bg-slate-950/20">
                            <td class="py-3.5 px-4 font-mono font-bold text-amber-505">#TRD<?= h($t['id']) ?></td>
                            <td class="py-3.5 px-4 font-medium text-slate-200"><?= h($t['customer_name']) ?></td>
                            <td class="py-3.5 px-4 text-slate-300">
                                <span class="font-bold"><?= h($t['device_brand']) ?></span> <?= h($t['device_model']) ?>
                            </td>
                            <td class="py-3.5 px-4">
                                <span class="inline-block px-2.5 py-0.5 rounded font-mono font-bold text-[9px] uppercase tracking-wide <?= 
                                    $t['status'] === 'Completed' ? 'bg-[#0f2d24] text-teal-400 border border-teal-500/10' : 'bg-amber-500/10 text-amber-500 border border-amber-500/15'
                                ?>">
                                    <?= h($t['status']) ?>
                                </span>
                            </td>
                            <td class="py-3.5 px-4 text-slate-400">
                                <?= $t['technician_name'] ? h($t['technician_name']) : '<em class="text-red-500/70">Unallocated POOL</em>' ?>
                            </td>
                            <td class="py-3.5 px-4 text-right">
                                <a href="/tickets/view?id=<?= $t['id'] ?>" class="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-205 hover:text-amber-500 rounded font-semibold transition">
                                    Assess Case
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>