#!/bin/bash

# Build script for Capacitor
# This script builds the Next.js app for Capacitor

echo "🔨 Building Next.js for Capacitor..."

# Use the Capacitor-specific config
cp next.config.capacitor.ts next.config.ts.backup
cp next.config.capacitor.ts next.config.ts

# Build with static export
bun run build

# Restore original config
mv next.config.ts.backup next.config.ts

echo "✅ Build complete! Now syncing with Capacitor..."
bunx cap sync

echo "🎉 Done! You can now run:"
echo "  - bun run cap:open:android (to open Android Studio)"
echo "  - bun run cap:open:ios (to open Xcode)"
