<?php
/**
 * CRSTMS - Admin Operations Control Center
 */
?>
<div class="space-y-6">
    <div class="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
            <h1 class="text-2xl font-bold text-white">Admin Operations Panel</h1>
            <p class="text-xs text-slate-400">Ecosystem statistics and inventory safety levels.</p>
        </div>
        <span class="text-xs bg-slate-800 border border-slate-700 px-3 py-1 rounded text-amber-400 font-mono">Role: Enterprise Systems Admin</span>
    </div>

    <!-- Counters Analytics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Repair Tickets</div>
            <div class="text-2xl font-bold text-white mt-1"><?= $stats['total_tickets'] ?></div>
        </div>
        <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Customers</div>
            <div class="text-2xl font-bold text-white mt-1"><?= $stats['total_customers'] ?></div>
        </div>
        <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Available Technicians</div>
            <div class="text-2xl font-bold text-teal-400 mt-1"><?= $stats['total_techs'] ?> Available</div>
        </div>
        <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Low-Stock Warnings</div>
            <div class="text-2xl font-bold text-red-500 mt-1"><?= count($low_stock) ?> Triggered</div>
        </div>
    </div>

    <!-- Alerts if low stock -->
    <?php if (!empty($low_stock)): ?>
        <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <h3 class="text-sm font-bold text-red-400 mb-2">Automated Low Stock Safety Alerts!</h3>
            <div class="space-y-1.5 text-xs">
                <?php foreach ($low_stock as $part): ?>
                    <div class="flex gap-2 items-center text-slate-300">
                        <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        <span><strong><?= htmlspecialchars($part['part_name']) ?></strong> (SKU: <?= htmlspecialchars($part['serial_number']) ?>) only has <strong class="text-white"><?= $part['stock_quantity'] ?> units remaining</strong> (alert trigger threshold: <?= $part['low_stock_threshold'] ?>).</span>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    <?php endif; ?>

    <!-- Split view metrics & activities -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Inventory catalog -->
        <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 class="text-sm font-bold text-white">Parts Stock Inventory Catalog</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr class="bg-slate-950/50 border-b border-slate-800 text-slate-500">
                            <th class="p-2">Part Name / Serial</th>
                            <th class="p-2">Stock Level</th>
                            <th class="p-2">Unit Cost</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/80">
                        <?php foreach ($inventory as $part): ?>
                            <tr>
                                <td class="p-2">
                                    <div class="font-medium text-slate-200"><?= htmlspecialchars($part['part_name']) ?></div>
                                    <div class="text-[10px] text-slate-500 font-mono"><?= htmlspecialchars($part['serial_number']) ?></div>
                                </td>
                                <td class="p-2">
                                    <span class="font-mono text-xs <?= $part['stock_quantity'] < $part['low_stock_threshold'] ? 'text-red-400 font-bold' : 'text-slate-300' ?>">
                                        <?= $part['stock_quantity'] ?> left
                                    </span>
                                </td>
                                <td class="p-2 font-mono text-slate-400">$<?= number_format($part['unit_price'], 2) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Recent logging feeds -->
        <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 class="text-sm font-bold text-white">Real-Time Core Repair Activity Log</h3>
            <div class="space-y-3">
                <?php foreach ($recent_activities as $log): ?>
                    <div class="p-3 bg-slate-950 rounded-lg border border-slate-800/60 flex items-start gap-3">
                        <div class="text-[10px] text-slate-500 font-mono shrink-0 mt-0.5"><?= $log['time_label'] ?></div>
                        <div class="space-y-0.5">
                            <p class="text-xs text-slate-200"><?= htmlspecialchars($log['message']) ?></p>
                            <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-500 font-mono"><?= $log['actor_role'] ?>: <?= htmlspecialchars($log['actor_name']) ?></span>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>