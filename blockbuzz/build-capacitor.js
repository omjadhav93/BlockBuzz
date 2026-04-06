/**
 * build-capacitor.js
 * Cross-platform build script for Capacitor mobile app.
 *
 * What it does:
 *  1. Swaps next.config.ts with the capacitor version (output: export, trailingSlash, unoptimized images)
 *  2. Temporarily removes app/api (server routes can't be in a static export)
 *  3. Runs `next build` to produce the /out static folder
 *  4. Syncs with Capacitor (`npx cap sync`)
 *  5. Restores everything back to normal web-server mode
 *
 * Usage:  npm run cap:build
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const ROOT = __dirname;

function run(cmd) {
    console.log(`\n▶ ${cmd}`);
    execSync(cmd, { stdio: 'inherit', cwd: ROOT });
}

console.log('\n🚀 Capacitor Build Starting...\n');

// ──────────────────────────────────────────────
// 1. Backup & swap next.config.ts
// ──────────────────────────────────────────────
const mainConfig = path.join(ROOT, 'next.config.ts');
const capConfig  = path.join(ROOT, 'next.config.capacitor.ts');
const backupConfig = path.join(ROOT, 'next.config.ts.bak');

if (!fs.existsSync(capConfig)) {
    console.error('❌  next.config.capacitor.ts not found! Aborting.');
    process.exit(1);
}

fs.copyFileSync(mainConfig, backupConfig);
fs.copyFileSync(capConfig, mainConfig);
console.log('✅  Swapped next.config.ts → capacitor config');

// ──────────────────────────────────────────────
// 2. Temporarily remove app/api (server routes)
// ──────────────────────────────────────────────
const apiDir    = path.join(ROOT, 'app', 'api');
const apiBackup = path.join(ROOT, 'app_api_backup');
let apiMoved = false;

if (fs.existsSync(apiDir)) {
    fs.renameSync(apiDir, apiBackup);
    apiMoved = true;
    console.log('✅  Moved app/api → app_api_backup (static export cannot serve API routes)');
}

// ──────────────────────────────────────────────
// 3. Build & Sync
// ──────────────────────────────────────────────
let buildOk = false;
try {
    run('npm run build');
    buildOk = true;

    run('npx cap sync');

    console.log('\n🎉  Capacitor build complete!');
    console.log('   → npm run cap:open:android  (open Android Studio)');
    console.log('   → npm run cap:open:ios      (open Xcode)');
} catch (err) {
    console.error('\n❌  Build failed:', err.message);
} finally {
    // ──────────────────────────────────────────
    // 4. Restore everything
    // ──────────────────────────────────────────
    console.log('\n🔄  Restoring original configuration...');

    if (fs.existsSync(backupConfig)) {
        fs.copyFileSync(backupConfig, mainConfig);
        fs.unlinkSync(backupConfig);
        console.log('✅  Restored next.config.ts');
    }

    if (apiMoved && fs.existsSync(apiBackup)) {
        fs.renameSync(apiBackup, apiDir);
        console.log('✅  Restored app/api');
    }

    if (!buildOk) process.exit(1);
}
