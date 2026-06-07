<?php
/**
 * CRSTMS - Customer Tracking Hub
 */
?>
<div class="space-y-6">
    <div class="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
            <h1 class="text-2xl font-bold text-white">Client Repair Center</h1>
            <p class="text-xs text-slate-400">Monitor active repair pipelines, view billings, and summon assistance.</p>
        </div>
        <span class="text-xs bg-slate-800 border border-slate-700 px-3 py-1 rounded text-amber-500 font-mono font-bold">My Account Status: Registered Client</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Repair Tracker -->
        <div class="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 class="text-sm font-bold text-white">Live Hardware Status Tracking</h3>
            
            <?php if (empty($tickets)): ?>
                <p class="text-xs text-slate-500">No active repair tickets found registered under your customer profile.</p>
            <?php else: ?>
                <?php foreach ($tickets as $t): ?>
                    <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                        <div class="flex justify-between text-xs items-center">
                            <span class="font-mono text-slate-300">Ticket #<?= $t['id'] ?></span>
                            <span class="text-amber-400 font-bold font-mono">Status: <?= $t['status'] ?></span>
                        </div>

                        <!-- Step Tracker UI Visual -->
                        <div class="grid grid-cols-4 gap-2 text-center text-[10px]">
                            <div class="p-2 rounded <?= in_array($t['status'], ['Created', 'Assigned', 'In Progress', 'Completed']) ? 'bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20' : 'bg-slate-900 text-slate-600' ?>">Check-in</div>
                            <div class="p-2 rounded <?= in_array($t['status'], ['Assigned', 'In Progress', 'Completed']) ? 'bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20' : 'bg-slate-900 text-slate-600' ?>">Diagnosing</div>
                            <div class="p-2 rounded <?= in_array($t['status'], ['In Progress', 'Completed']) ? 'bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20' : 'bg-slate-900 text-slate-600' ?>">Repair Work</div>
                            <div class="p-2 rounded <?= $t['status'] === 'Completed' ? 'bg-teal-500/10 text-teal-400 font-bold border border-teal-500/20' : 'bg-slate-900 text-slate-600' ?>">Ready / Passed</div>
                        </div>

                        <p class="text-xs text-slate-400"><strong>Hardware model:</strong> <?= htmlspecialchars($t['device_brand']) ?> <?= htmlspecialchars($t['device_model']) ?></p>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>

        <!-- Inquiries / Billing -->
        <div class="space-y-4">
            <!-- Launch support inquiry -->
            <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                <h3 class="text-sm font-bold text-white">Inquire / Query Support</h3>
                <form action="/customer/inquiry/submit" method="POST" class="space-y-3 text-xs">
                    <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                    <div class="space-y-1">
                        <label class="text-slate-400 font-semibold">Message Detail</label>
                        <textarea name="message" required placeholder="Ask about ticket completion timeline or quotes..." class="w-full h-20 bg-slate-950 border border-slate-800 rounded p-2 focus:outline-none text-slate-200"></textarea>
                    </div>
                    <button class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold transition-all">
                        Submit Enquiry
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>