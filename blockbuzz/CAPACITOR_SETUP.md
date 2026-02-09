# BlockBuzz - Capacitor Setup

Your Next.js project has been wrapped with Capacitor for mobile development! 🎉

## 📱 What's Configured

- **Android** platform added
- **iOS** platform added
- **Capacitor Geolocation** plugin installed
- Server mode configured for development

## 🚀 Development Workflow

Since your app has API routes, Capacitor is configured to connect to your local Next.js server during development.

### Step 1: Start the Next.js Development Server

```bash
bun run dev
```

This will start your Next.js server on `http://localhost:3000` with all API routes working.

### Step 2: Open the Mobile App

#### For Android:
```bash
bun run cap:open:android
```

This opens Android Studio. From there, you can:
- Run the app in an emulator
- Run the app on a physical device
- The app will connect to your local server at `http://localhost:3000`

#### For iOS (macOS only):
```bash
bun run cap:open:ios
```

This opens Xcode. From there, you can:
- Run the app in a simulator
- Run the app on a physical device
- The app will connect to your local server at `http://localhost:3000`

### Step 3: Making Changes

When you make changes to your Next.js code:
1. The Next.js dev server will hot-reload automatically
2. Refresh the app in the emulator/simulator to see changes
3. No need to rebuild the native app for code changes

### Syncing Native Code

Only sync when you:
- Add new Capacitor plugins
- Change Capacitor configuration
- Update native dependencies

```bash
bun run cap:sync
```

## 📝 Available Scripts

- `bun run dev` - Start Next.js development server
- `bun run build` - Build Next.js for production
- `bun run cap:sync` - Sync web app with native platforms
- `bun run cap:open:android` - Open Android Studio
- `bun run cap:open:ios` - Open Xcode
- `bun run cap:run:android` - Build and run on Android
- `bun run cap:run:ios` - Build and run on iOS

## 🔧 Configuration Files

- `capacitor.config.ts` - Main Capacitor configuration
- `android/` - Android native project
- `ios/` - iOS native project

## 🌐 Server URL Configuration

The app is currently configured to connect to `http://localhost:3000` during development.

For production, you'll need to:
1. Deploy your Next.js backend to a server
2. Update the API calls to point to your production backend URL
3. Remove or comment out the `url` field in `capacitor.config.ts` for production builds

## 📱 Testing on Physical Devices

### Android:
1. Enable USB debugging on your device
2. Connect via USB
3. Run from Android Studio

### iOS:
1. Connect your iOS device
2. Add your Apple Developer account in Xcode
3. Select your device and run

## 🔑 Permissions

The Geolocation plugin is already configured. Android will request location permissions at runtime.

For iOS, you'll need to add permission descriptions in `ios/App/App/Info.plist`:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby events</string>
```

## 📦 Adding More Capacitor Plugins

```bash
bun add @capacitor/[plugin-name]
bun run cap:sync
```

Popular plugins:
- `@capacitor/camera` - Camera access
- `@capacitor/push-notifications` - Push notifications
- `@capacitor/app` - App state management
- `@capacitor/status-bar` - Status bar styling

## 🐛 Troubleshooting

### App shows blank screen
- Make sure your Next.js dev server is running (`bun run dev`)
- Check that `http://localhost:3000` is accessible from your device
- For Android emulator, use `http://10.0.2.2:3000` instead if localhost doesn't work

### Sync errors
```bash
bunx cap sync --force
```

### Need to rebuild native projects
```bash
bunx cap sync
# Then rebuild in Android Studio or Xcode
```

## 📚 Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [Next.js Documentation](https://nextjs.org/docs)
