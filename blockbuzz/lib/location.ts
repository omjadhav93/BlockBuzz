import { Geolocation } from '@capacitor/geolocation';

/**
 * Get the user's current location using Capacitor Geolocation plugin
 * Works on both web and native mobile platforms
 */
export async function getUserLocation(): Promise<{ lat: number; lng: number }> {
    try {
        // Request permissions first (will prompt user on first use)
        const permissions = await Geolocation.checkPermissions();

        if (permissions.location === 'denied') {
            // Try to request permissions
            const requested = await Geolocation.requestPermissions();
            if (requested.location === 'denied') {
                throw new Error('Location permission denied');
            }
        }

        // Get current position
        const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });

        return {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
    } catch (error) {
        console.error('Error getting location:', error);
        throw error;
    }
}

/**
 * Check if location permissions are granted
 */
export async function checkLocationPermissions(): Promise<boolean> {
    try {
        const permissions = await Geolocation.checkPermissions();
        return permissions.location === 'granted' || permissions.location === 'prompt';
    } catch (error) {
        console.error('Error checking location permissions:', error);
        return false;
    }
}

/**
 * Request location permissions
 */
export async function requestLocationPermissions(): Promise<boolean> {
    try {
        const permissions = await Geolocation.requestPermissions();
        return permissions.location === 'granted';
    } catch (error) {
        console.error('Error requesting location permissions:', error);
        return false;
    }
}