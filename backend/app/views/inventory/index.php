<?php 
/**
 * CRSTMS - Inventory Control index
 */
?>
<div class="space-y-6 text-left">
    <div class="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-3 gap-4">
        <div>
            <h2 class="text-xl font-bold text-white font-display">Workshop Material Stock Catalog</h2>
            <p class="text-xs text-slate-400">Restock replacement parts, track safety bounds, prevent negative inventory margins, and view audit events.</p>
        </div>
        <?php if ($_SESSION['user_role'] === 'Admin'): ?>
            <a href="/inventory/create" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition whitespace-nowrap">
                + Add Spare SKU
            </a>
        <?php endif; ?>
    </div>

    <!-- Alarm banners -->
    <?php if ($alertsCount > 0): ?>
        <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400">
            <strong class="block mb-1.5 font-bold tracking-wide uppercase font-sans flex items-center gap-1.5">⚠️ SAFETY MONITOR: LOW PARTS IN WORKSPACE!</strong>
            <span>There are currently <?= $alertsCount ?> items under critical stock replenishment levels. Immediate material restock orders are recommended.</span>
        </div>
    <?php endif; ?>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Stock items list -->
        <div class="lg:col-span-2 space-y-4">
            <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 text-xs">
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="bg-slate-955 border-b border-slate-800 text-slate-500 font-bold uppercase text-[9px] tracking-wider text-left">
                            <th class="py-3 px-4">SKU / Item Details</th>
                            <th class="py-3 px-4 text-center">Remaining Stock</th>
                            <th class="py-3 px-4 text-right">Cost Value</th>
                            <?php if (in_array($_SESSION['user_role'], ['Admin', 'Technician'])): ?>
                                <th class="py-3 px-4 text-right">Adjust Counts</th>
                            <?php endif; ?>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/40">
                        <?php if (empty($parts)): ?>
                            <tr>
                                <td colSpan="4" class="py-6 text-center text-slate-500 italic">No spare materials found matching catalogue records.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($parts as $p): ?>
                                <tr class="hover:bg-slate-950/20">
                                    <td class="py-3 px-4">
                                        <div class="font-bold text-slate-200"><?= h($p['part_name']) ?></div>
                                        <div class="font-mono text-[10px] text-slate-500"><?= h($p['serial_number']) ?></div>
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        <span class="inline-block px-2.5 py-0.5 rounded font-mono font-bold text-[9px] uppercase tracking-wide <?= 
                                            $p['stock_quantity'] <= $p['low_stock_threshold'] ? 'bg-red-500/10 text-red-400 border border-red-500/15' : 'bg-[#0f2d24] text-teal-400 border border-teal-500/15'
                                        ?>">
                                            <?= $p['stock_quantity'] ?> Units remaining
                                        </span>
                                    </td>
                                    <td class="py-3 px-4 text-right font-mono text-slate-300 font-bold">$<?= number_format($p['unit_price'], 2) ?></td>
                                    
                                    <?php if (in_array($_SESSION['user_role'], ['Admin', 'Technician'])): ?>
                                        <td class="py-3 px-4 text-right">
                                            <form method="POST" action="/inventory/adjust" class="flex items-center justify-end gap-1.5">
                                                <input type="hidden" name="part_id" value="<?= $p['id'] ?>" />
                                                <input type="number" name="quantity_changed" min="-50" max="100" placeholder="±Qty" required class="w-14 bg-slate-950 border border-slate-800 rounded p-1 text-center font-mono text-slate-200" />
                                                <button type="submit" class="p-1 px-2.5 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 border border-slate-800 rounded text-[10px] font-bold transition">Confirm</button>
                                            </form>
                                        </td>
                                    <?php endif; ?>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- System ledger history -->
        <div class="space-y-4">
            <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3.5">
                <h3 class="font-bold text-white uppercase tracking-wider text-[10px]">Material Adjustment Ledger</h3>
                <div class="space-y-3 pl-3 border-l border-slate-800 max-h-[420px] overflow-y-auto">
                    <?php if (empty($logs)): ?>
                        <p class="text-slate-500 italic text-[11px] py-2">No database material logs created yet.</p>
                    <?php else: ?>
                        <?php foreach ($logs as $l): ?>
                            <div class="space-y-1 relative pl-3.5 text-[10px]">
                                <span class="absolute w-1.5 h-1.5 rounded-full -left-[19.5px] top-1 <?= $l['quantity_changed'] >= 0 ? 'bg-teal-500' : 'bg-red-400' ?>"></span>
                                <div class="flex justify-between">
                                    <strong class="text-slate-300"><?= h($l['part_name']) ?></strong>
                                    <span class="font-mono text-slate-500"><?= date('d M', strtotime($l['created_at'])) ?></span>
                                </div>
                                <div class="text-slate-400">
                                    Change: <strong class="<?= $l['quantity_changed'] >= 0 ? 'text-teal-400' : 'text-red-400' ?>"><?= $l['quantity_changed'] > 0 ? '+' : '' ?><?= $l['quantity_changed'] ?> Units</strong> 
                                    (<?= h($l['action_type']) ?>)
                                </div>
                                <p class="text-slate-500 italic leading-snug">Context: <?= h($l['notes']) ?> — by <?= h($l['operator_name']) ?></p>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>