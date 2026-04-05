const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('Starting Capacitor build process...');

// 1. Backup original config and set capacitor config
fs.copyFileSync('next.config.ts', 'next.config.original.ts');
fs.copyFileSync('next.config.capacitor.ts', 'next.config.ts');

// 2. Temporarily rename app/api since we don't need backend routes in the mobile app bundle
let apiMoved = false;
if (fs.existsSync(path.join('app', 'api'))) {
    fs.renameSync(path.join('app', 'api'), 'app_api_backup');
    apiMoved = true;
    console.log('Temporarily disabled app/api for static export');
}

try {
    console.log('\n🔨 Building Next.js static bundle...');
    execSync('npm run build', { stdio: 'inherit' });

    console.log('\n✅ Build complete! Syncing with Capacitor...');
    execSync('npx cap sync', { stdio: 'inherit' });

    console.log('\n🎉 Done! The Capacitor project is ready.');
} catch (error) {
    console.error('\n❌ Build or sync failed:', error.message);
} finally {
    // 3. Cleanup and restore
    console.log('\nRestoring configuration...');
    if (fs.existsSync('next.config.original.ts')) {
        fs.copyFileSync('next.config.original.ts', 'next.config.ts');
        fs.unlinkSync('next.config.original.ts');
    }

    if (apiMoved && fs.existsSync('app_api_backup')) {
        fs.renameSync('app_api_backup', path.join('app', 'api'));
        console.log('Restored app/api folder');
    }
}
