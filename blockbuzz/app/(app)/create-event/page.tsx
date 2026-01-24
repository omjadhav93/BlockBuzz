"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import dynamic from "next/dynamic";
import {
    ChevronLeft,
    Loader2,
    Sparkles,
    MapPin,
    Users,
    Clock,
    Check,
    Globe,
    Home,
    Trees,
    CalendarDays,
    Timer,
    ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BottomNavbar from "@/components/app/BottomNavbar";

import type { VolunteerRole } from "@/types/volunteerRole";
import type { NominatimResult } from "@/lib/nearbyVenue";
import { searchCities } from "@/lib/nearbyVenue";

/* ---------------- MAP ---------------- */

const MapPicker = dynamic(() => import("@/components/maps/MapPicker"), {
    ssr: false,
    loading: () => (
        <div className="h-[200px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 text-xs">
            Loading Interactive Map...
        </div>
    ),
});

/* ---------------- DATA ---------------- */

const fetcher = (url: string) =>
    fetch(url, { credentials: "include" }).then((res) => res.json());

const VOLUNTEER_ROLES: VolunteerRole[] = [
    "LEAD",
    "CHECK_IN",
    "REGISTRATION",
    "EVENT_SUPPORT",
    "TECH_SUPPORT",
    "LOGISTICS",
    "MEDICAL",
    "SECURITY",
    "OTHER",
];

/* ---------------- PAGE ---------------- */

export default function CreateEventPage() {
    const router = useRouter();

    /* 🔐 hydration guard */
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [cityQuery, setCityQuery] = useState("");
    const [cityResults, setCityResults] = useState<NominatimResult[]>([]);
    const [selectedCity, setSelectedCity] = useState<NominatimResult | null>(null);

    const [draftId, setDraftId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        city: "",
        venue: "",
        venue_type: "INDOOR" as "INDOOR" | "OUTDOOR",
        latitude: 18.5362,
        longitude: 73.8958,
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        capacity: null as number | null,
        interests: [] as string[],
        volunteerRequirements: [] as any[],
    });

    /* ---------------- INTERESTS ---------------- */

    const { data, isLoading } = useSWR(
        "/api/admin/interest",
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    const AVAILABLE_INTERESTS = data?.interests?.slice(0, 10) || [];

    /* ---------------- SAVE / PUBLISH ---------------- */

    async function saveDraft(data: typeof formData) {
        if (!data.title.trim()) return;

        setIsSaving(true);
        try {
            const payload = {
                ...data,
                id: draftId,
                startTime:
                    data.startDate && data.startTime
                        ? new Date(`${data.startDate}T${data.startTime}`).toISOString()
                        : null,
                endTime:
                    data.endDate && data.endTime
                        ? new Date(`${data.endDate}T${data.endTime}`).toISOString()
                        : null,
            };

            const res = await fetch("/api/organizer/event/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (json?.data?.id) setDraftId(json.data.id);
        } finally {
            setIsSaving(false);
        }
    }

    async function publishEvent(data: typeof formData) {
        if (!data.title.trim()) return;

        setIsSaving(true);
        try {
            await fetch("/api/organizer/event/publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            router.replace("/organizer/events");
        } finally {
            setIsSaving(false);
        }
    }

    if (!mounted || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-[#F8F9FA] min-h-screen pb-32">
            {/* HEADER */}
            <header className="px-6 py-4 sticky top-0 bg-white/70 backdrop-blur-xl z-50 border-b">
                <div className="max-w-3xl mx-auto flex justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ChevronLeft />
                        </Button>
                        <div>
                            <h1 className="font-black">Create Event</h1>
                            <p className="text-[10px] text-[#EF835D] font-bold uppercase">
                                Organizer Studio
                            </p>
                        </div>
                    </div>

                    <Badge className="bg-slate-100">
                        {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        {isSaving ? "Syncing" : "Draft Saved"}
                    </Badge>
                </div>
            </header>

            <main className="p-6 max-w-3xl mx-auto space-y-12">

                {/* TITLE */}
                <Card className="rounded-[2.5rem]">
                    <CardContent className="p-8 space-y-6">
                        <Input
                            placeholder="Event title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData((p) => ({ ...p, title: e.target.value }))
                            }
                            className="h-14 rounded-2xl"
                        />
                        <Textarea
                            placeholder="Event description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData((p) => ({ ...p, description: e.target.value }))
                            }
                            className="rounded-2xl min-h-[150px]"
                        />
                    </CardContent>
                </Card>

                {/* MAP */}
                <Card className="rounded-[2.5rem]">
                    <CardContent className="p-6 space-y-4">
                        <Input
                            placeholder="Search city..."
                            value={selectedCity?.display_name || cityQuery}
                            onChange={async (e) => {
                                const v = e.target.value;
                                setCityQuery(v);
                                if (v.length > 2) {
                                    setCityResults(await searchCities(v));
                                }
                            }}
                        />

                        {cityResults.length > 0 && (
                            <Card className="absolute z-50 w-full">
                                {cityResults.map((c) => (
                                    <button
                                        key={c.place_id}
                                        onClick={() => {
                                            setSelectedCity(c);
                                            setCityResults([]);
                                            setFormData((p) => ({
                                                ...p,
                                                city: c.display_name,
                                                latitude: +c.lat,
                                                longitude: +c.lon,
                                            }));
                                        }}
                                        className="block w-full text-left px-4 py-3 hover:bg-slate-100"
                                    >
                                        {c.display_name}
                                    </button>
                                ))}
                            </Card>
                        )}

                        <div className="h-[240px] rounded-2xl overflow-hidden border">
                            <MapPicker
                                lat={formData.latitude}
                                lon={formData.longitude}
                                onChange={(lat, lon) =>
                                    setFormData((p) => ({ ...p, latitude: lat, longitude: lon }))
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* INTERESTS */}
                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_INTERESTS.map((i: any) => {
                        const active = formData.interests.includes(i.id);
                        return (
                            <Badge
                                key={i.id}
                                onClick={() =>
                                    setFormData((p) => ({
                                        ...p,
                                        interests: active
                                            ? p.interests.filter((id) => id !== i.id)
                                            : [...p.interests, i.id],
                                    }))
                                }
                                className={`cursor-pointer px-6 py-3 rounded-2xl ${active
                                    ? "bg-[#EF835D] text-white"
                                    : "bg-white text-slate-400"
                                    }`}
                            >
                                {i.name}
                            </Badge>
                        );
                    })}
                </div>

                {/* ACTIONS */}
                <Button
                    onClick={() => publishEvent(formData)}
                    disabled={isSaving}
                    className="w-full h-20 rounded-[2.5rem] text-xl font-black"
                >
                    Publish Event <ArrowRight />
                </Button>

                <Button
                    onClick={() => saveDraft(formData)}
                    disabled={isSaving}
                    className="w-full h-20 rounded-[2.5rem] text-xl font-black"
                >
                    Save Draft <ArrowRight />
                </Button>
            </main>

            <BottomNavbar />
        </div>
    );
}
