<?php
/**
 * CRSTMS - Deliveries view template (MVC)
 */
?>
<div class="space-y-6 text-xs text-left">
    <div class="flex justify-between items-center border-b border-slate-805 pb-3">
        <div>
            <h2 class="text-lg font-bold text-white font-display">Logistics Control & Deliveries</h2>
            <p class="text-[11px] text-slate-400">Track shipping schedules, assign courier operators, and receive dropoff confirmations.</p>
        </div>
    </div>

    <!-- Filter toolbar -->
    <form method="GET" action="/deliveries" class="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
            <label class="block text-slate-500 font-bold mb-1 uppercase text-[9px]">Transit State</label>
            <select name="status" class="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200">
                <option value="">-- All Deliveries --</option>
                <option value="Pending" <?= ($filters['status'] === 'Pending') ? 'selected' : '' ?>>Pending</option>
                <option value="Assigned" <?= ($filters['status'] === 'Assigned') ? 'selected' : '' ?>>Assigned</option>
                <option value="Picked Up" <?= ($filters['status'] === 'Picked Up') ? 'selected' : '' ?>>Picked Up</option>
                <option value="In Transit" <?= ($filters['status'] === 'In Transit') ? 'selected' : '' ?>>In Transit</option>
                <option value="Delivered" <?= ($filters['status'] === 'Delivered') ? 'selected' : '' ?>>Delivered</option>
                <option value="Confirmed" <?= ($filters['status'] === 'Confirmed') ? 'selected' : '' ?>>Customer Confirmed</option>
            </select>
        </div>
        <div class="sm:col-span-2">
            <label class="block text-slate-500 font-bold mb-1 uppercase text-[9px]">Search Customer/Specs</label>
            <input name="search" type="text" value="<?= h($filters['search'] ?? '') ?>" placeholder="Scan name, brand model parameters..." class="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200" />
        </div>
        <div class="flex items-end">
            <button type="submit" class="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded cursor-pointer transition">Filter Results</button>
        </div>
    </form>

    <!-- Logistics Grid -->
    <div class="space-y-3">
        <?php if (empty($deliveries)): ?>
            <div class="p-8 text-center bg-slate-900 border border-slate-800 text-slate-500 rounded-xl italic">
                No logistical transit or dispatch assignments found.
            </div>
        <?php else: ?>
            <?php foreach ($deliveries as $item): ?>
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    
                    <!-- Customer & Coordinates -->
                    <div class="space-y-1">
                        <span class="text-[9px] bg-slate-950 text-slate-400 rounded px-1.5 py-0.5 font-mono">DELIVERY ORDER #<?= h($item['id']) ?></span>
                        <h4 class="font-bold text-white text-sm"><?= h($item['customer_name']) ?></h4>
                        <p class="text-slate-400 leading-normal">📍 <?= h($item['customer_address']) ?></p>
                        <p class="text-[10px] text-slate-500">Contact: <?= h($item['customer_email']) ?></p>
                    </div>

                    <!-- Laptop specs & linked Ticket -->
                    <div class="space-y-1">
                        <span class="text-slate-500 font-bold uppercase text-[9px]">Hardware Device Details</span>
                        <div class="font-medium text-slate-200"><?= h($item['device_brand']) ?> <?= h($item['device_model']) ?></div>
                        <p class="text-slate-500">Type: <?= h($item['device_type']) ?></p>
                        <a href="/tickets/view?id=<?= $item['ticket_id'] ?>" class="text-[#f59e0b] hover:underline font-mono">Linked Ticket #<?= $item['ticket_id'] ?> &rarr;</a>
                    </div>

                    <!-- Courier runner status -->
                    <div class="space-y-1.5">
                        <span class="text-slate-500 font-bold uppercase text-[9px] block">Dispatcher Driver</span>
                        <?php if (empty($item['delivery_personnel_id'])): ?>
                            <div class="text-slate-500 italic">No runner assigned yet</div>
                            <?php if (in_array($_SESSION['user_role'] ?? 'Guest', ['Admin', 'Receptionist'])): ?>
                                <!-- Assign driver form -->
                                <form method="POST" action="/deliveries/assign" class="flex gap-1 pt-1">
                                    <input type="hidden" name="delivery_id" value="<?= $item['id'] ?>" />
                                    <select name="personnel_id" required class="flex-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-200 text-[11px]">
                                        <option value="">-- Choose Runner --</option>
                                        <?php foreach ($drivers as $dr): ?>
                                            <option value="<?= $dr['id'] ?>"><?= h($dr['full_name']) ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                    <button type="submit" class="px-2.5 py-1 bg-[#0f2d24] text-teal-400 border border-teal-800 rounded font-bold cursor-pointer text-[10px]">Assign</button>
                                </form>
                            <?php endif; ?>
                        <?php else: ?>
                            <div class="font-semibold text-slate-300">🚚 <?= h($item['driver_name']) ?></div>
                            <span class="inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase leading-none bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Status: <?= h($item['status']) ?>
                            </span>
                        <?php endif; ?>
                    </div>

                    <!-- Transit Status timeline controls -->
                    <div class="flex flex-col gap-1.5 justify-end sm:items-end">
                        <div class="text-[10px] text-slate-500 font-mono">Scheduled: <?= date('d M Y', strtotime($item['created_at'])) ?></div>
                        
                        <?php if (!empty($item['notes'])): ?>
                            <div class="p-2 bg-slate-950 rounded text-slate-400 italic text-[11px] border border-slate-850 w-full text-left">
                                Notes: <span class="text-slate-300"><?= h($item['notes']) ?></span>
                            </div>
                        <?php endif; ?>

                        <!-- Status Transition controls -->
                        <?php if (!empty($item['delivery_personnel_id'])): ?>
                            <form method="POST" action="/deliveries/update" class="flex flex-col gap-1.5 w-full">
                                <input type="hidden" name="delivery_id" value="<?= $item['id'] ?>" />
                                
                                <div class="flex gap-1.5">
                                    <input name="notes" type="text" placeholder="Transit notes / delivery codes..." class="flex-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[11px] text-slate-300 focus:outline-none" />
                                    
                                    <select name="status" required class="bg-slate-950 border border-slate-800 rounded px-1 py-1 text-[11px] text-slate-200 font-bold font-sans">
                                        <option value="">-- Shift --</option>
                                        <option value="Picked Up">Mark Picked Up</option>
                                        <option value="In Transit">Mark In Transit</option>
                                        <option value="Delivered">Mark Delivered</option>
                                        <?php if (in_array($_SESSION['user_role'] ?? '', ['Admin', 'Receptionist'])): ?>
                                            <option value="Confirmed">Mark Confirmed</option>
                                        <?php endif; ?>
                                    </select>
                                    
                                    <button type="submit" class="px-3 bg-amber-500 hover:bg-amber-600 font-bold text-slate-950 rounded text-[11px] cursor-pointer">OK</button>
                                </div>
                            </form>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>