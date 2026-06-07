<?php
/**
 * CRSTMS - Invoice History index
 */
?>
<div class="space-y-6 text-left text-xs">
    <div class="border-b border-slate-800 pb-3">
        <h2 class="text-xl font-bold text-white font-display">Generated Billing Ledger</h2>
        <p class="text-slate-404">View registered invoice copies, check offline settlement logs, and generate printable invoice templates.</p>
    </div>

    <!-- Listings -->
    <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 text-xs text-left">
        <table class="w-full border-collapse">
            <thead>
                <tr class="bg-slate-958 border-b border-slate-800 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                    <th class="py-3 px-4">Invoice ID</th>
                    <th class="py-3 px-4">Completed Ticket ID</th>
                    <th class="py-3 px-4">Client User</th>
                    <th class="py-3 px-4 text-right">Sum Subtotals</th>
                    <th class="py-3 px-4 text-center">Settlement</th>
                    <th class="py-3 px-4 text-right">Receipt File</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/40">
                <?php if (empty($invoices)): ?>
                    <tr>
                        <td colSpan="6" class="py-8 text-center text-slate-550 italic">No invoicing statements created yet.</td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($invoices as $inv): ?>
                        <tr class="hover:bg-slate-950/20">
                            <td class="py-3.5 px-4 font-mono font-bold text-slate-202">#INV-<?= h($inv['id']) ?></td>
                            <td class="py-3.5 px-4 font-mono text-amber-500 font-semibold">#TRD<?= h($inv['ticket_id']) ?></td>
                            <td class="py-3.5 px-4 font-semibold text-slate-300"><?= h($inv['customer_name']) ?></td>
                            <td class="py-3.5 px-4 text-right font-mono text-white font-bold">$<?= number_format($inv['total_amount'], 2) ?></td>
                            <td class="py-3.5 px-4 text-center">
                                <span class="inline-block px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase tracking-wide <?= 
                                    $inv['payment_status'] === 'Paid' ? 'bg-[#0f2d24] text-teal-400 border border-teal-500/15' : 'bg-red-500/10 text-red-400 border border-red-500/10'
                                ?>">
                                    <?= h($inv['payment_status']) ?>
                                </span>
                            </td>
                            <td class="py-3.5 px-4 text-right">
                                <a href="/invoices/view?id=<?= $inv['id'] ?>" class="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-304 hover:text-amber-500 rounded transition font-bold">
                                    Display Invoice
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>