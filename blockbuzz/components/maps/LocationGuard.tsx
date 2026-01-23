"use client";

import { useEffect, useState } from "react";
import { getUserLocation } from "@/lib/location";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function LocationGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    const [status, setStatus] = useState<"loading" | "granted" | "denied">("loading");

    useEffect(() => {
        checkLocation();
    }, []);

    const checkLocation = () => {
        setStatus("loading");
        getUserLocation()
            .then(() => setStatus("granted"))
            .catch(() => setStatus("denied"));
    };

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-slate-800">Finding your location</h2>
                <p className="text-slate-500 mt-2">Checking local permissions...</p>
            </div>
        );
    }

    if (status === "denied") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 max-w-md mx-auto text-center">
                <div className="bg-red-50 p-4 rounded-full mb-6">
                    <ShieldAlert className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Location Access Denied</h2>
                <p className="text-slate-600 mb-8 leading-relaxed">
                    We need your location to show events happening right near you.
                    Please enable location services in your browser settings to continue.
                </p>
                <button
                    onClick={checkLocation}
                    className="w-full py-3 px-6 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return <>{children}</>;
}