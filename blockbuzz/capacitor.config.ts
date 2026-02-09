import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blockbuzz.app',
  appName: 'BlockBuzz',
  webDir: 'out',
  server: {
    // For development - connect to local Next.js server
    // Comment out url for production build
    url: process.env.CAPACITOR_SERVER_URL || 'http://localhost:3000',
    cleartext: true, // Allow HTTP for local development
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    Geolocation: {
      // Request permissions when the app needs location
    }
  }
};

export default config;
