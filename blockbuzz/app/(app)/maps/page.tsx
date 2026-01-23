"use client";

import dynamic from "next/dynamic";
import LocationGuard from "@/components/maps/LocationGuard";
import BottomNavbar from "@/components/app/BottomNavbar";
import { MapPin, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

export const fetcher = (url: string) =>
    fetch(url, { credentials: "include" }).then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
    });

const EventsMap = dynamic(() => import("@/components/maps/EventMap"), {
    ssr: false,
});

interface Location {
    lat: number;
    lng: number;
}

interface Event {
    id: string;
    title: string;
    latitude: number;
    longitude: number;
    live: boolean;
    distance: number;
}

const defaultLoc: Location = {
    lat: 18.5195,
    lng: 73.8553,
};

export default function MapPage() {
    const [location] = useState<Location>(defaultLoc);
    const [center, setCenter] = useState<Location>(defaultLoc);
    const [radius, setRadius] = useState(50);

    const swrKey =
        radius && center
            ? `/api/event/nearby?lat=${center.lat}&long=${center.lng}&radius=${radius.toFixed(
                50
            )}`
            : null;

    const { data, isLoading, error } = useSWR(swrKey, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 30_000, // 30s cache
    });

    const events: Event[] = data?.events || [];

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center bg-white/70 backdrop-blur-lg border-b border-slate-200/50 z-20">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900">
                        Nearby Events {events.length}
                    </h1>
                    <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                        <MapPin size={12} />
                        <span>Current Location</span>
                    </div>
                </div>
                <button className="p-2 bg-white rounded-full shadow-sm border border-slate-200">
                    <SlidersHorizontal size={20} className="text-slate-600" />
                </button>
            </header>

            {/* Map */}
            <main className="flex-grow relative z-10 mt-20">
                <LocationGuard>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-[60vh]">
                            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                            <p className="mt-4 text-slate-500 font-medium">
                                Loading nearby events…
                            </p>
                        </div>
                    ) : error ? (
                        <div className="flex justify-center items-center h-[60vh] text-red-500">
                            Failed to load events
                        </div>
                    ) : (
                        <div className="h-[calc(100vh-64px)] w-full">
                            <EventsMap
                                location={location}
                                events={events}
                                onRadiusChange={setRadius}
                                onCenterChange={setCenter}
                            />
                        </div>
                    )}
                </LocationGuard>
            </main>

            {/* Bottom Navbar */}
            <footer className="fixed bottom-0 left-0 right-0 z-50">
                <BottomNavbar />
            </footer>
        </div>
    );
}
