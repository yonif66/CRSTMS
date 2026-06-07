<?php
/**
 * CRSTMS - Printable Receipt View
 */
?>
<div class="space-y-6 text-left text-xs max-w-3xl mx-auto">
    <!-- Header Controls -->
    <div class="flex justify-between items-center pb-3 border-b border-slate-800 print:hidden">
        <a href="/invoices" class="px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded">&larr; Invoices Ledger</a>
        <button onclick="window.print()" class="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded flex items-center gap-1.5 transition cursor-pointer font-sans">
            🖨️ Print Statement Receipt
        </button>
    </div>

    <!-- Printable Invoice Sheet Area -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 print:bg-white print:text-black print:border-none">
        
        <!-- Header Info -->
        <div class="flex flex-col sm:flex-row justify-between pb-6 border-b border-slate-800/80 print:border-black gap-4">
            <div class="space-y-1.5">
                <h1 class="text-2xl font-bold font-mono tracking-wider text-amber-500 print:text-amber-605">CRSTMS LTD</h1>
                <p class="text-[10px] text-slate-400 font-medium font-sans print:text-black">100 MicroTech Boulevard, Laboratory Bench B-1</p>
                <p class="text-[10px] text-slate-505 print:text-black">Intranet Support Point: tech-labs@crstms.service.mobi</p>
            </div>
            <div class="sm:text-right space-y-1">
                <span class="inline-block px-3 py-1 font-mono font-bold uppercase rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 print:bg-white print:text-black print:border-black">
                    INVOICE FILE
                </span>
                <div class="text-[11px] font-bold text-slate-202 pt-1">No. INV-<?= h($invoice['id']) ?></div>
                <div class="text-[10px] text-slate-500 font-mono">Finalized: <?= date('d M Y H:i', strtotime($invoice['invoice_date'])) ?></div>
            </div>
        </div>

        <!-- Addresses meta -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-800/80 print:border-black text-[11px]">
            <div class="space-y-1.5">
                <h3 class="font-bold text-white uppercase text-[10px] tracking-wide print:text-black">DELIVERY / DEBTOR SOURCE:</h3>
                <p class="font-semibold text-slate-300 print:text-black">Debtor Name: <?= h($invoice['customer_name']) ?></p>
                <p class="text-slate-400 print:text-black">Email Link: <?= h($invoice['customer_email']) ?></p>
                <p class="text-slate-400 print:text-black">Mobile Callback: <?= h($invoice['customer_phone']) ?></p>
                <p class="text-slate-404 print:text-black">Shipping Coordinate: <?= h($invoice['customer_address']) ?></p>
            </div>
            <div class="space-y-1.5">
                <h3 class="font-bold text-white uppercase text-[10px] tracking-wide print:text-black">HARDWARE SPECIFICATION LOGS:</h3>
                <p class="font-semibold text-slate-300 print:text-black">Hardware Model: <?= h($invoice['device_brand']) ?> <?= h($invoice['device_model']) ?></p>
                <p class="text-slate-400 print:text-black">Physical Class: <?= h($invoice['device_type']) ?></p>
                <p class="text-[10px] text-slate-450 print:text-black">Manufacturer Serial: <code class="font-mono bg-slate-950 px-1 py-0.5 rounded text-amber-500 print:bg-white print:text-black print:border-black"><?= h($invoice['device_serial']) ?></code></p>
                <p class="text-slate-500 print:text-black">Assigned bench engineer: <?= $invoice['technician_name'] ? h($invoice['technician_name']) : 'Centralized Pool' ?></p>
            </div>
        </div>

        <!-- Ledger breakdowns -->
        <div class="space-y-2 text-[11px]">
            <h3 class="font-bold text-white uppercase text-[10px] tracking-wide print:text-black">BILLABLE WORKSHOP SUBITEMS STATEMENT:</h3>
            <div class="border border-slate-800 rounded-lg overflow-hidden print:border-black">
                <div class="grid grid-cols-4 bg-slate-950 p-2.5 font-bold text-slate-400 border-b border-slate-800 print:bg-white print:text-black print:border-black text-[10px]">
                    <div class="col-span-2">Item / Diagnostic Bench Activity Description</div>
                    <div class="text-center">Tax / Multiplier Category</div>
                    <div class="text-right">Unification Total Fees</div>
                </div>
                <div class="divide-y divide-slate-800/50 print:divide-black">
                    <!-- Service/Labor fee row -->
                    <div class="grid grid-cols-4 p-3 hover:bg-slate-950/10 text-slate-350 print:text-black">
                        <div class="col-span-2">
                            <strong class="text-slate-200 print:text-black text-xs block">Assessor Lab Diagnostic Fee</strong>
                            <span class="text-[10px] text-slate-500 print:text-black">Solder tests, thermal paste replenishment, firmware diagnostic checking.</span>
                        </div>
                        <div class="text-center font-mono text-slate-400 self-center print:text-black">15.00% VAT</div>
                        <div class="text-right font-mono text-slate-300 font-bold self-center print:text-black">$<?= number_format($invoice['service_cost'], 2) ?></div>
                    </div>
                    <!-- Materials component total cost row -->
                    <div class="grid grid-cols-4 p-3 hover:bg-slate-950/10 text-slate-350 print:text-black">
                        <div class="col-span-2">
                            <strong class="text-slate-200 print:text-black text-xs block">Replaced Physical Spare Materials Total</strong>
                            <span class="text-[10px] text-slate-500 print:text-black">Calculated dynamically matching inventory logs for Ticket #<?= $invoice['ticket_id'] ?>.</span>
                        </div>
                        <div class="text-center font-mono text-slate-400 self-center print:text-black">15.00% VAT</div>
                        <div class="text-right font-mono text-slate-300 font-bold self-center print:text-black">$<?= number_format($invoice['spare_parts_cost'], 2) ?></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Totals panel -->
        <div class="flex justify-end pt-4">
            <div class="w-72 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 print:bg-white print:text-black print:border-black text-[11px]">
                <div class="flex justify-between text-slate-400 print:text-black">
                    <span>Labor Subtotal:</span>
                    <span class="font-mono text-slate-300 print:text-black">$<?= number_format($invoice['service_cost'], 2) ?></span>
                </div>
                <div class="flex justify-between text-slate-400 print:text-black pb-2 border-b border-slate-800/80 print:border-black">
                    <span>Materials Subtotal:</span>
                    <span class="font-mono text-slate-300 print:text-black">$<?= number_format($invoice['spare_parts_cost'], 2) ?></span>
                </div>
                <div class="flex justify-between text-slate-400 print:text-black">
                    <span>Applicable VAT Taxes (15.00%):</span>
                    <span class="font-mono text-slate-300 print:text-black">
                        $<?= number_format(($invoice['service_cost'] + $invoice['spare_parts_cost']) * 0.15, 2) ?>
                    </span>
                </div>
                <div class="flex justify-between font-bold text-white text-sm pt-2 border-t border-slate-850/80 print:text-black print:border-black">
                    <span>Total Settled cost:</span>
                    <span class="font-mono text-amber-400 print:text-black">$<?= number_format($invoice['total_amount'], 2) ?></span>
                </div>
            </div>
        </div>

        <!-- Settlement registration controls for Operators / Admins -->
        <?php if (in_array($_SESSION['user_role'], ['Admin', 'Receptionist']) && $invoice['payment_status'] === 'Unpaid'): ?>
            <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row justify-between items-center text-xs gap-4 print:hidden">
                <div class="space-y-0.5">
                    <strong class="text-amber-500 block">Pending Register Offline Settlement</strong>
                    <span class="text-slate-500">Record cash / bank transfer settlements of this hardware repair ticket task invoice.</span>
                </div>
                <form method="POST" action="/invoices/paid" class="flex gap-2">
                    <input type="hidden" name="invoice_id" value="<?= $invoice['id'] ?>" />
                    <input type="hidden" name="payment_status" value="Paid" />
                    <button type="submit" class="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold font-sans rounded transition tracking-wide cursor-pointer text-center">
                        Confirm Offline Cash Received
                    </button>
                </form>
            </div>
        <?php endif; ?>
    </div>
</div>