<?php
/**
 * CRSTMS - Delivery Personnel Logistics Panel
 */
?>
<div class="space-y-6">
    <div class="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
            <h1 class="text-2xl font-bold text-white">Logistics Delivery Board</h1>
            <p class="text-xs text-slate-400">Assigned dispatch packages, routes, and signoff forms.</p>
        </div>
        <span class="text-xs bg-slate-800 border border-slate-700 px-3 py-1 rounded text-amber-500 font-mono font-bold">Driver ID: Fleet 01</span>
    </div>

    <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <h3 class="text-sm font-bold text-white">My Active Transport Manifest</h3>
        
        <div class="space-y-3">
            <?php foreach ($deliveries as $d): ?>
                <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div class="space-y-1">
                        <span class="font-mono text-amber-400 text-xs font-bold">Manifest ID: #00<?= $d['id'] ?></span>
                        <div class="text-xs text-slate-300"><strong>Customer:</strong> <?= htmlspecialchars($d['customer_name']) ?></div>
                    </div>
                    <div class="text-xs text-slate-400">
                        <strong>Address:</strong> <?= htmlspecialchars($d['shipping_destination']) ?>
                    </div>
                    <div class="text-xs">
                        <strong class="text-slate-400">State:</strong> 
                        <span class="ml-1 px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300"><?= $d['status'] ?></span>
                    </div>
                    <form action="/delivery/update" method="POST" class="flex gap-2 justify-end text-xs">
                        <input type="hidden" name="delivery_id" value="<?= $d['id'] ?>">
                        <select name="status" class="bg-slate-900 border border-slate-800 rounded p-1 text-slate-300">
                            <option value="In Transit">In Transit</option>
                            <option value="Handed Over">Handed Over / Closed</option>
                        </select>
                        <button class="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1 rounded transition-all">
                            Save
                        </button>
                    </form>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>