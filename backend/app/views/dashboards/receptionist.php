<?php
/**
 * CRSTMS - Receptionist Panel
 */
?>
<div class="space-y-6">
    <div class="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
            <h1 class="text-2xl font-bold text-white">Desk Intake Board</h1>
            <p class="text-xs text-slate-400">Check-in devices, associate owners, and trigger workflows.</p>
        </div>
        <span class="text-xs bg-slate-800 border border-slate-700 px-3 py-1 rounded text-amber-400 font-mono font-bold">Counter Desk: 04</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- New Client -->
        <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 class="text-sm font-bold text-white">Register Customer</h3>
            <form action="/receptionist/customer/create" method="POST" class="space-y-3 text-xs">
                <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                <div class="space-y-1">
                    <label class="text-slate-400 font-semibold">Customer Full Name</label>
                    <input type="text" name="full_name" required placeholder="Emily Thorne" class="w-full bg-slate-950 border border-slate-800 rounded p-2 focus:border-amber-500 focus:outline-none text-slate-200">
                </div>
                <div class="space-y-1">
                    <label class="text-slate-400 font-semibold">Mobile Phone No.</label>
                    <input type="text" name="phone" required placeholder="0711928012" class="w-full bg-slate-950 border border-slate-800 rounded p-2 focus:border-amber-500 focus:outline-none text-slate-200">
                </div>
                <div class="space-y-1">
                    <label class="text-slate-400 font-semibold">Physical Address</label>
                    <input type="text" name="address" required placeholder="12 Baker St, London" class="w-full bg-slate-950 border border-slate-800 rounded p-2 focus:border-amber-500 focus:outline-none text-slate-200">
                </div>
                <button class="w-full py-2 bg-amber-500 hover:bg-amber-600 rounded text-slate-950 font-bold transition-all mt-2">
                    Create Customer File
                </button>
            </form>
        </div>

        <!-- New Ticket -->
        <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 class="text-sm font-bold text-white">Open Repair Ticket</h3>
            <form action="/receptionist/ticket/create" method="POST" class="space-y-3 text-xs">
                <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                <div class="space-y-1">
                    <label class="text-slate-400 font-semibold">Select Customer</label>
                    <select name="customer_id" class="w-full bg-slate-950 border border-slate-800 rounded p-2 focus:border-amber-500 focus:outline-none text-slate-200">
                        <?php foreach ($customers as $c): ?>
                            <option value="<?= $c['id'] ?>"><?= htmlspecialchars($c['full_name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-slate-400 font-semibold">Device Type & Model</label>
                    <input type="text" name="brand" placeholder="Apple MacBook Pro 14" class="w-full bg-slate-950 border border-slate-800 rounded p-2 focus:outline-none text-slate-200">
                </div>
                <div class="space-y-1">
                    <label class="text-slate-400 font-semibold">Issue Reported</label>
                    <textarea name="issue" placeholder="Liquid damage recovery" class="w-full h-16 bg-slate-950 border border-slate-800 rounded p-2 focus:outline-none text-slate-200"></textarea>
                </div>
                <button class="w-full py-2 bg-amber-500 hover:bg-amber-600 rounded text-slate-950 font-bold transition-all mt-2">
                    Open Ticket
                </button>
            </form>
        </div>

        <!-- Customer Inquiries -->
        <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 class="text-sm font-bold text-white">Active Customer Inquiries</h3>
            <div class="space-y-2 max-h-[300px] overflow-y-auto">
                <?php foreach ($inquiries as $inq): ?>
                    <div class="p-3 bg-slate-950 border border-slate-800/80 rounded-lg space-y-2">
                        <div class="flex justify-between items-center text-[10px]">
                            <strong class="text-slate-300"><?= htmlspecialchars($inq['client_name']) ?></strong>
                            <span class="bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded"><?= $inq['status'] ?></span>
                        </div>
                        <p class="text-xs text-slate-400 leading-normal italic">"<?= htmlspecialchars($inq['message_text']) ?>"</p>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>