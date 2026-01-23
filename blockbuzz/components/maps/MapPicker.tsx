"use client";

import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

/* ---------------- FIX LEAFLET ICON ---------------- */
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ---------------- TYPES ---------------- */
type Props = {
    lat: number;
    lon: number;
    onChange: (lat: number, lon: number) => void;
};

/* ---------------- AUTO ZOOM CONTROLLER ---------------- */
function AutoCenter({ lat, lon }: { lat: number; lon: number }) {
    const map = useMap();

    useEffect(() => {
        map.flyTo([lat, lon], Math.max(map.getZoom(), 15), {
            animate: true,
            duration: 0.6,
        });
    }, [lat, lon, map]);

    return null;
}

/* ---------------- MARKER HANDLER ---------------- */
function LocationMarker({ lat, lon, onChange }: Props) {
    const [position, setPosition] = useState<[number, number]>([lat, lon]);

    useMapEvents({
        click(e) {
            const newPos: [number, number] = [
                e.latlng.lat,
                e.latlng.lng,
            ];
            setPosition(newPos);
            onChange(newPos[0], newPos[1]);
        },
    });

    useEffect(() => {
        setPosition([lat, lon]);
    }, [lat, lon]);

    return <Marker position={position} />;
}

/* ---------------- MAP PICKER ---------------- */
export default function MapPicker({ lat, lon, onChange }: Props) {
    return (
        <div className="w-full h-64 rounded-2xl overflow-hidden border">
            <MapContainer
                center={[lat, lon]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* 🔥 AUTO ZOOM + CENTER */}
                <AutoCenter lat={lat} lon={lon} />

                <LocationMarker lat={lat} lon={lon} onChange={onChange} />
            </MapContainer>
        </div>
    );
}
