<?php
/**
 * CRSTMS - Support and inquiry template (MVC)
 */
?>
<div class="space-y-6 text-xs text-left">
    <div class="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
            <h2 class="text-lg font-bold text-white font-display">Customer Support & Response Lobby</h2>
            <p class="text-[11px] text-slate-400">Review customers hardware disputes, answer catalog questions, and delegate support tasks.</p>
        </div>
    </div>

    <!-- CUSTOMER INTAKE FORM (SUBMIT ONLY VIEWABLE BY CUSTOMER ROLE) -->
    <?php if ($_SESSION['user_role'] === 'Customer'): ?>
        <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3.5">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider">File Support Request Ticket</h3>
            <form method="POST" action="/support/submit" class="grid grid-cols-1 gap-3">
                <div class="space-y-1">
                    <label class="font-bold text-slate-400">Subject / Context Category *</label>
                    <input name="subject" required type="text" placeholder="e.g., Boot-loop after screen replacement" class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
                </div>
                <div class="space-y-1">
                    <label class="font-bold text-slate-400">Details / Describe your problem *</label>
                    <textarea name="message" required rows="3" placeholder="Explain the symptoms, device serial codes concerned..." class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300"></textarea>
                </div>
                <div class="flex justify-end">
                    <button type="submit" class="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold font-sans rounded cursor-pointer transition">
                        Dispatch Concern to Shop
                    </button>
                </div>
            </form>
        </div>
    <?php endif; ?>

    <!-- INQUIRIES WORKSPACE LIST -->
    <div class="space-y-4">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Active Queries Ledger</h3>
        
        <?php if (empty($inquiries)): ?>
            <div class="p-8 text-center bg-slate-900 border border-slate-800 text-slate-500 rounded-xl italic">
                No active or historical support requests currently filed.
            </div>
        <?php else: ?>
            <div class="space-y-3">
                <?php foreach ($inquiries as $inq): ?>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-3">
                            <div class="space-y-1">
                                <span class="text-[9px] font-mono text-slate-500 uppercase tracking-wide">Inquiry Ref: INQ-<?= $inq['id'] ?></span>
                                <h4 class="text-sm font-extrabold text-white leading-snug"><?= h($inq['subject']) ?></h4>
                                <div class="text-[10px] text-slate-400">
                                    Submitted by: <strong class="text-slate-200"><?= h($inq['customer_name']) ?></strong> (<?= h($inq['customer_email']) ?>)
                                </div>
                            </div>
                            
                            <div class="flex items-center gap-2.5">
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono border" style="
                                    background-color: <?= ($inq['status'] === 'Closed') ? '#1e1b4b' : (($inq['status'] === 'Responded') ? '#022c22' : '#7c2d12') ?>;
                                    color: <?= ($inq['status'] === 'Closed') ? '#c7d2fe' : (($inq['status'] === 'Responded') ? '#34d399' : '#f87171') ?>;
                                    border-color: <?= ($inq['status'] === 'Closed') ? '#4f46e5/20' : (($inq['status'] === 'Responded') ? '#10b981/20' : '#f97316/20') ?>;
                                ">
                                    <?= h($inq['status']) ?>
                                </span>
                                <span class="text-slate-500 font-mono text-[10px]"><?= date('d M, H:i', strtotime($inq['created_at'])) ?></span>
                            </div>
                        </div>

                        <!-- Initial customer concern text -->
                        <div class="p-3 bg-slate-950 rounded-lg text-slate-300 border border-slate-850">
                            <strong>Concern:</strong> <p class="mt-1 leading-relaxed text-slate-350"><?= nl2br(h($inq['message'])) ?></p>
                        </div>

                        <!-- Threaded Replies section -->
                        <?php if (!empty($inq['replies'])): ?>
                            <div class="space-y-2.5 pl-4 border-l-2 border-slate-800">
                                <?php foreach ($inq['replies'] as $rep): ?>
                                    <div class="p-3 bg-slate-950/40 rounded border border-slate-850 text-[11px] space-y-1">
                                        <div class="flex justify-between font-mono text-[9px] text-slate-500">
                                            <span>Reply by: <strong><?= h($rep['responder_name']) ?></strong> (<?= h($rep['responder_role']) ?>)</span>
                                            <span><?= date('d M, H:i', strtotime($rep['created_at'])) ?></span>
                                        </div>
                                        <p class="text-slate-300 leading-normal font-sans"><?= nl2br(h($rep['response_text'])) ?></p>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>

                        <!-- STAFF ACTIONS: DELEGATING OR CLOSING -->
                        <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <div class="text-[10px] text-slate-500">
                                <?php if ($inq['assigned_staff_id']): ?>
                                    <span>Assigned to support lead: <strong class="text-slate-300"><?= h($inq['staff_name']) ?></strong></span>
                                <?php else: ?>
                                    <span class="text-red-400/80 font-bold italic">Unallocated - Queue attention required!</span>
                                <?php endif; ?>
                            </div>

                            <div class="flex gap-2 text-xs">
                                <!-- Delegate Support Leader (Admins/Receptionists only) -->
                                <?php if (in_array($_SESSION['user_role'] ?? '', ['Admin', 'Receptionist'])): ?>
                                    <form method="POST" action="/support/assign" class="flex gap-1">
                                        <input type="hidden" name="inquiry_id" value="<?= $inq['id'] ?>" />
                                        <select name="staff_id" required class="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300">
                                            <option value="">-- Delegate Staff --</option>
                                            <?php foreach ($staff as $st): ?>
                                                <option value="<?= $st['id'] ?>"><?= h($st['full_name']) ?> (<?= h($st['role']) ?>)</option>
                                            <?php endforeach; ?>
                                        </select>
                                        <button type="submit" class="px-2.5 bg-slate-950 hover:bg-slate-850 text-slate-200 border border-slate-850 rounded font-bold cursor-pointer transition">Delegate</button>
                                    </form>

                                    <!-- Close Ticket buttons -->
                                    <?php if ($inq['status'] !== 'Closed'): ?>
                                        <form method="POST" action="/support/close" class="inline">
                                            <input type="hidden" name="inquiry_id" value="<?= $inq['id'] ?>" />
                                            <button type="submit" class="px-2.5 py-1 bg-red-950/20 text-red-400 hover:bg-red-900/30 border border-red-910/30 rounded font-bold cursor-pointer transition">Close Query</button>
                                        </form>
                                    <?php endif; ?>
                                <?php endif; ?>
                            </div>
                        </div>

                        <!-- REPLY INPUT BOX FOR ACTIVE DIALOGUE -->
                        <?php if ($inq['status'] !== 'Closed'): ?>
                            <form method="POST" action="/support/reply" class="pt-3 border-t border-slate-800/80">
                                <input type="hidden" name="inquiry_id" value="<?= $inq['id'] ?>" />
                                <div class="flex flex-col sm:flex-row gap-2">
                                    <input name="response_text" required type="text" placeholder="Add reply to threaded dialogue log..." class="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500" />
                                    
                                    <div class="flex gap-1.5 self-end">
                                        <?php if (in_array($_SESSION['user_role'] ?? '', ['Admin', 'Receptionist'])): ?>
                                            <select name="status" class="bg-slate-950 border border-slate-800 rounded px-1.5 text-[11px] text-slate-200 font-bold">
                                                <option value="Responded">Responded</option>
                                                <option value="Escalated">Escalate Concern</option>
                                            </select>
                                        <?php endif; ?>
                                        <button type="submit" class="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded font-bold font-sans cursor-pointer transition">Post Message</button>
                                    </div>
                                </div>
                            </form>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</div>