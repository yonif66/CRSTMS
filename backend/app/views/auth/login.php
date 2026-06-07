<?php
/**
 * CRSTMS - Login Entrance View
 */
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CRSTMS Secure Access Portal</title>
    <link href="/assets/css/tailwind.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4">

    <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div class="text-center space-y-2">
            <h1 class="text-2xl font-bold tracking-tight text-white">CRSTMS Access Portal</h1>
            <p class="text-xs text-slate-400">Computer Repair Service Tracking & Management System</p>
        </div>

        <?php if (!empty($error)): ?>
            <div class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                <?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?>
            </div>
        <?php endif; ?>

        <?php if (!empty($_SESSION['flash_msg'])): ?>
            <div class="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
                <?= htmlspecialchars($_SESSION['flash_msg'], ENT_QUOTES, 'UTF-8') ?>
                <?php unset($_SESSION['flash_msg']); ?>
            </div>
        <?php endif; ?>

        <form action="/login" method="POST" class="space-y-4">
            <!-- CSRF Guard Token -->
            <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">

            <div class="space-y-1.5">
                <label for="username" class="text-xs font-semibold text-slate-400">System Username</label>
                <input type="text" name="username" id="username" placeholder="e.g. tech_johndoe" required
                       class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none">
            </div>

            <div class="space-y-1.5">
                <label for="password" class="text-xs font-semibold text-slate-400">Account Password</label>
                <input type="password" name="password" id="password" placeholder="••••••••" required
                       class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none">
            </div>

            <div class="flex items-center justify-between text-xs">
                <label class="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-white select-none sign-none">
                    <input type="checkbox" name="remember_me" class="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0">
                    <span>Remember logged-in actor</span>
                </label>
            </div>

            <button type="submit" class="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-sm transition-all shadow-md shadow-amber-500/10">
                Verify Credentials
            </button>
        </form>

        <div class="pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 space-y-2 font-sans font-medium">
            <p>Verified with server-side <code class="text-slate-400">password_verify()</code> Argon2id hashes.</p>
            <p class="text-slate-600">Enterprise Access Isolation Enforced.</p>
        </div>
    </div>

</body>
</html>