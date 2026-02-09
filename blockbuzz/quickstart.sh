#!/bin/bash

# Quick Start Script for BlockBuzz with Capacitor
# This script helps you quickly start developing with Capacitor

echo "🚀 BlockBuzz Capacitor Quick Start"
echo "=================================="
echo ""

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Error: Bun is not installed"
    echo "Please install Bun: https://bun.sh"
    exit 1
fi

echo "✅ Bun is installed"
echo ""

# Ask user what they want to do
echo "What would you like to do?"
echo ""
echo "1. Start development (Next.js server only)"
echo "2. Start and open Android"
echo "3. Start and open iOS"
echo "4. Sync Capacitor"
echo "5. Install dependencies"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🔨 Starting Next.js development server..."
        echo "The server will be available at http://localhost:3000"
        echo ""
        bun run dev
        ;;
    2)
        echo ""
        echo "🔨 Starting Next.js development server in background..."
        bun run dev &
        DEV_PID=$!
        echo "✅ Server started (PID: $DEV_PID)"
        echo ""
        echo "⏳ Waiting 3 seconds for server to start..."
        sleep 3
        echo ""
        echo "📱 Opening Android Studio..."
        bun run cap:open:android
        ;;
    3)
        echo ""
        echo "🔨 Starting Next.js development server in background..."
        bun run dev &
        DEV_PID=$!
        echo "✅ Server started (PID: $DEV_PID)"
        echo ""
        echo "⏳ Waiting 3 seconds for server to start..."
        sleep 3
        echo ""
        echo "📱 Opening Xcode..."
        bun run cap:open:ios
        ;;
    4)
        echo ""
        echo "🔄 Syncing Capacitor..."
        bunx cap sync
        echo ""
        echo "✅ Sync complete!"
        ;;
    5)
        echo ""
        echo "📦 Installing dependencies..."
        bun install
        echo ""
        echo "✅ Dependencies installed!"
        ;;
    *)
        echo ""
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"
