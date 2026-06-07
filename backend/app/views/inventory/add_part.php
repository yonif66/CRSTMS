<?php 
/**
 * CRSTMS - Register Spare Part SKU View
 */
?>
<div class="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl text-left text-xs">
    <div class="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
            <h2 class="text-xl font-bold text-white font-display">Register Material SKU</h2>
            <p class="text-[11px] text-slate-400">Add physical inventory modules into the general computer repairs catalog database.</p>
        </div>
        <a href="/inventory" class="px-2.5 py-1.5 bg-slate-950 border border-slate-805 text-slate-300 hover:text-white rounded text-[11px]">&larr; Catalog Listings</a>
    </div>

    <?php if (!empty($errors)): ?>
        <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3 my-4 text-red-400">
            <strong>Errors occurred:</strong>
            <ul class="list-disc pl-4 mt-1">
                <?php foreach ($errors as $err): ?>
                    <li><?= h($err) ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>

    <form method="POST" action="/inventory/create" class="space-y-4 mt-4">
        <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>" />

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
                <label class="text-slate-400 font-bold block">Part Name / Title *</label>
                <input type="text" name="part_name" required placeholder="Kingston 16GB RAM module" class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
            </div>

            <div class="space-y-1">
                <label class="text-slate-400 font-bold block">Manufacturer Serial Code *</label>
                <input type="text" name="serial_number" required placeholder="KGN-DDR4-16G-M" class="w-full bg-slate-950 border border-slate-805 rounded p-2 text-slate-200 font-mono" />
            </div>

            <div class="space-y-1">
                <label class="text-slate-400 font-bold block">Initial Received Quantity</label>
                <input type="number" name="stock_quantity" min="0" value="10" class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono" />
            </div>

            <div class="space-y-1">
                <label class="text-slate-400 font-bold block">Unit Billing Cost ($) *</label>
                <input type="number" name="unit_price" step="0.01" min="0.01" value="45.00" class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono" />
            </div>

            <div class="col-span-2 space-y-1">
                <label class="text-slate-400 font-bold block">Safety Reorder Warning Threshold Level *</label>
                <input type="number" name="low_stock_threshold" min="1" value="5" class="w-full bg-slate-950 border border-slate-808 rounded p-2 text-slate-200 font-mono" />
                <span class="text-[10px] text-slate-500">Automated alarm alerts light up standard administrative headers if quantities sink to this volume.</span>
            </div>
        </div>

        <button type="submit" class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-905 font-bold rounded-lg transition uppercase tracking-wider font-sans cursor-pointer text-center">
            Register Material SKU
        </button>
    </form>
</div>