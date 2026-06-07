<?php
/**
 * CRSTMS - Common Header Layout View
 */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$userFullname = $_SESSION['user_fullname'] ?? 'System User';
$userRole = $_SESSION['user_role'] ?? 'Guest';
$csrfToken = $_SESSION['csrf_token'] ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRSTMS - Computer Repair Shop Tracking System</title>
    <!-- Tailwind CSS (Loaded in public public assets or via CDN for fully ready standalone deployment) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        .font-mono {
            font-family: 'JetBrains Mono', monospace;
        }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col">

    <!-- Top Navigation Bar -->
    <header class="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-black text-slate-950 text-sm tracking-tight shadow-lg shadow-amber-500/15">
                    CR
                </div>
                <div>
                    <span class="font-bold text-white text-base tracking-tight block">CRSTMS</span>
                    <span class="text-[10px] text-amber-500 uppercase font-mono tracking-widest font-semibold block -mt-1">Repair Terminal</span>
                </div>
            </div>

            <?php if (isset($_SESSION['user_id'])): ?>
                <div class="flex items-center gap-4">
                    <div class="text-right hidden sm:block">
                        <div class="text-xs font-bold text-white"><?= htmlspecialchars($userFullname) ?></div>
                        <div class="text-[10px] text-slate-400 font-mono"><?= htmlspecialchars($userRole) ?> Dashboard</div>
                    </div>
                    <div class="h-8 w-px bg-slate-800"></div>
                    <a href="/logout" class="text-xs bg-slate-800 hover:bg-slate-700/80 text-white font-medium px-3.5 py-1.5 rounded-lg border border-slate-700/60 transition-colors">
                        Sign Out
                    </a>
                </div>
            <?php endif; ?>
        </div>
    </header>

    <!-- Main Container Layout Wrap -->
    <div class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <main class="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
