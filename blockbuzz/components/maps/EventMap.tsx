"use client";

import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents, Tooltip, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "@/app/globals.css";
import { useEffect } from "react";

// ------------------ Map Event Listener ------------------
interface MapEventListenerProps {
    onRadiusChange: (radius: number) => void;
    onCenterChange: (center: { lat: number; lng: number }) => void;
}

export function MapEventListener({ onRadiusChange, onCenterChange }: MapEventListenerProps) {
    const map = useMapEvents({
        // Fires when zoom ends
        zoomend: () => {
            calculateAndSend();
        },
        // Fires when panning ends
        moveend: () => {
            calculateAndSend();
        },
    });

    const calculateAndSend = () => {
        const bounds = map.getBounds();
        const center = map.getCenter();
        const corner = bounds.getNorthEast();

        // Leaflet's distanceTo returns meters
        const distanceInKm = center.distanceTo(corner) / 1000;
        onRadiusChange(distanceInKm);
        onCenterChange(center);
    };

    // Calculate on mount
    useEffect(() => {
        calculateAndSend();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null; // This component doesn't render anything UI-wise
}

// ------------------ Fix default marker icons ------------------
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ------------------ Custom Icons ------------------
const userIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const eventIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 24 30">
  <path
    d="M12 0C6.9 0 2.7 4.2 2.7 9.3c0 7 9.3 20.7 9.3 20.7s9.3-13.7 9.3-20.7C21.3 4.2 17.1 0 12 0z"
    fill="#3b82f6"
  />
  <rect x="7" y="6" width="10" height="8" rx="1.5" fill="white"/>
  <line x1="7" y1="9" x2="17" y2="9" stroke="#3b82f6" stroke-width="1"/>
</svg>
`,
    className: "",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
});


function RecenterMap({ location }: { location: { lat: number; lng: number } }) {
    const map = useMap();
    useEffect(() => {
        if (!location) return;
        map.invalidateSize();
        map.setView([location.lat, location.lng], 13, { animate: true });
    }, [location, map]);
    return null;
}

export default function EventsMap({
    location,
    events,
    onRadiusChange,
    onCenterChange,
}: {
    location: { lat: number; lng: number } | null;
    events: any[];
    onRadiusChange?: (radius: number) => void;
    onCenterChange?: (center: { lat: number; lng: number }) => void;
}) {
    if (!location)
        return <div className="h-full flex items-center justify-center text-slate-400">Loading map…</div>;

    return (
        <MapContainer
            center={[location.lat, location.lng]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <RecenterMap location={location} />

            {/* Map Event Listener for radius calculation */}
            {onRadiusChange && onCenterChange && (
                <MapEventListener
                    onRadiusChange={onRadiusChange}
                    onCenterChange={onCenterChange}
                />
            )}

            {/* User location */}
            <Marker position={[location.lat, location.lng]} icon={userIcon}>
                <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                    You are here
                </Tooltip>
            </Marker>

            {/* Event markers */}
            {
                events
                    .filter(e => e.latitude && e.longitude)
                    .map(e => (
                        <Marker
                            key={e.id}
                            position={[Number(e.latitude), Number(e.longitude)]}
                            icon={eventIcon}
                        >
                            <Tooltip
                                direction="top"
                                offset={[0, -30]}
                                opacity={1}
                                permanent
                                className="leaflet-tooltip-custom"
                            >
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-md border border-white/20 rounded-full shadow-lg">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap">
                                        {e.title}
                                    </span>
                                </div>
                            </Tooltip>
                        </Marker>
                    ))
            }
        </MapContainer>
    );
}
