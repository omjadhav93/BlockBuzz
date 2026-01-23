"use client";

import React, { useState } from "react";
import useSWR from "swr";
import dynamic from "next/dynamic";
import {
    ChevronLeft,
    Plus,
    Loader2,
    Sparkles,
    MapPin,
    Users,
    Clock,
    Trash2,
    Check,
    Globe,
    Home,
    Trees,
    CalendarDays,
    Timer,
    ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { VolunteerRole } from "@/types/volunteerRole";
import type { NominatimResult } from "@/lib/nearbyVenue";
import { searchCities } from "@/lib/nearbyVenue";
import { useDebouncedEffect } from "@/hooks/useDebounce";

const MapPicker = dynamic(() => import("@/components/maps/MapPicker"), {
    ssr: false,
    loading: () => (
        <div className="h-[200px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 text-xs">
            Loading Interactive Map...
        </div>
    ),
});


const VOLUNTEER_ROLES: VolunteerRole[] = [
    "LEAD", "CHECK_IN", "REGISTRATION", "EVENT_SUPPORT", "TECH_SUPPORT",
    "LOGISTICS", "MEDICAL", "SECURITY", "OTHER",
];

const fetcher = (url: string) =>
    fetch(url, { credentials: "include" }).then(res => res.json());

export default function CreateEventPage() {
    const router = useRouter();
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
        venue_type: "INDOOR",
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

    const addVolunteerRole = () => {
        setFormData((p) => ({
            ...p,
            volunteerRequirements: [
                ...p.volunteerRequirements,
                { role: "EVENT_SUPPORT", requiredCount: 1, description: "" },
            ],
        }));
    };

    const removeRole = (index: number) => {
        setFormData((p) => ({
            ...p,
            volunteerRequirements: p.volunteerRequirements.filter((_, i) => i !== index),
        }));
    };

    const { data, isLoading } = useSWR(`/api/admin/interest`, fetcher);
    const AVAILABLE_INTERESTS = data?.interests.slice(0, 10) || [];

    async function saveDraft(data: typeof formData) {
        if (!data.title || data.title.trim().length < 3) return;

        setIsSaving(true);
        try {
            // Combine date and time into ISO datetime strings
            const startTime = data.startDate && data.startTime
                ? new Date(`${data.startDate}T${data.startTime}`).toISOString()
                : null;
            const endTime = data.endDate && data.endTime
                ? new Date(`${data.endDate}T${data.endTime}`).toISOString()
                : null;

            const payload = {
                id: draftId,
                title: data.title || null,
                description: data.description || null,
                city: data.city || null,
                venue: data.venue || null,
                venue_type: data.venue_type || null,
                latitude: data.latitude,
                longitude: data.longitude,
                startTime,
                endTime,
                capacity: data.capacity,
                interests: data.interests,
                volunteerRequirements: data.volunteerRequirements,
            };

            const res = await fetch("/api/organizer/event/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await res.json();
            if (res.ok && result.data?.id) setDraftId(result.data.id);
        } catch (err) {
            console.error("Failed to save draft", err);
        } finally {
            setIsSaving(false);
        }
    }

    async function publishEvent(data: typeof formData) {
        if (!data.title || data.title.trim().length < 3) return;

        setIsSaving(true);
        try {
            // Combine date and time into ISO datetime strings
            const startTime = data.startDate && data.startTime
                ? new Date(`${data.startDate}T${data.startTime}`).toISOString()
                : null;
            const endTime = data.endDate && data.endTime
                ? new Date(`${data.endDate}T${data.endTime}`).toISOString()
                : null;

            const payload = {
                id: draftId,
                title: data.title,
                description: data.description,
                city: data.city,
                venue: data.venue,
                venue_type: data.venue_type,
                latitude: data.latitude,
                longitude: data.longitude,
                startTime,
                endTime,
                capacity: data.capacity,
                interests: data.interests,
                volunteerRequirements: data.volunteerRequirements,
            };

            const res = await fetch("/api/organizer/event/publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await res.json();
            if (res.ok) {
                alert("Event published successfully!");
                router.refresh();
            } else {
                alert(result.error || "Failed to publish event");
            }
        } catch (err) {
            console.error("Failed to publish event", err);
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="animate-spin" />
        </div>
    );

    return (
        <div className="bg-[#F8F9FA] min-h-screen pb-32 font-sans selection:bg-[#EF835D]/30">
            {/* STICKY NAV */}
            <header className="px-6 py-4 sticky top-0 bg-white/70 backdrop-blur-xl z-[100] border-b border-slate-200/50">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-white shadow-sm transition-all">
                            <ChevronLeft size={20} />
                        </Button>
                        <div>
                            <h1 className="text-lg font-black tracking-tight text-slate-900">Create Event</h1>
                            <p className="text-[10px] uppercase text-[#EF835D] font-bold tracking-widest">Organizer Studio</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-bold py-1">
                            {isSaving ? <Loader2 size={12} className="animate-spin mr-1" /> : <Check size={12} className="mr-1" />}
                            {isSaving ? "Syncing" : "Draft Saved"}
                        </Badge>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-3xl mx-auto space-y-12">

                {/* 1. IDENTITY SECTION */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-2 text-slate-400">
                        <Sparkles size={16} className="text-[#EF835D]" />
                        <h2 className="text-[11px] font-black uppercase tracking-wider">The Vision</h2>
                    </div>
                    <Card className="rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 ml-1">Campaign Title</Label>
                                <Input
                                    placeholder="Give your event a bold name..."
                                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 text-base focus-visible:ring-[#EF835D]"
                                    value={formData.title}
                                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 ml-1">Mission Description</Label>
                                <Textarea
                                    placeholder="What are we achieving together?"
                                    className="rounded-2xl min-h-[160px] border-slate-100 bg-slate-50/50 p-5 text-sm focus-visible:ring-[#EF835D] leading-relaxed"
                                    value={formData.description}
                                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* 2. TIME & SCHEDULE SECTION (NEW) */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-2 text-slate-400">
                        <Clock size={16} className="text-[#EF835D]" />
                        <h2 className="text-[11px] font-black uppercase tracking-wider">Schedule</h2>
                    </div>
                    <Card className="rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
                        <CardContent className="p-8">
                            <div className="relative space-y-10">
                                {/* Timeline vertical dash */}
                                <div className="absolute left-[19px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-slate-100" />

                                {/* Start Date/Time */}
                                <div className="relative flex gap-6 group">
                                    <div className="mt-1 h-10 w-10 rounded-full bg-white border-4 border-[#EF835D] shadow-sm z-10 flex items-center justify-center">
                                        <div className="h-2 w-2 rounded-full bg-[#EF835D]" />
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black text-[#EF835D] uppercase tracking-widest ml-1">Starts On</Label>
                                            <div className="relative">
                                                <Input type="date" value={formData.startDate} onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))} className="h-12 rounded-xl border-slate-100 bg-slate-50/50 pr-4 font-medium" />
                                                <CalendarDays className="absolute right-3 top-3.5 text-slate-300 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black text-[#EF835D] uppercase tracking-widest ml-1">At Time</Label>
                                            <div className="relative">
                                                <Input type="time" value={formData.startTime} onChange={(e) => setFormData(p => ({ ...p, startTime: e.target.value }))} className="h-12 rounded-xl border-slate-100 bg-slate-50/50 pr-4 font-medium" />
                                                <Timer className="absolute right-3 top-3.5 text-slate-300 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* End Date/Time */}
                                <div className="relative flex gap-6 group">
                                    <div className="mt-1 h-10 w-10 rounded-full bg-white border-4 border-slate-200 shadow-sm z-10 flex items-center justify-center">
                                        <div className="h-2 w-2 rounded-full bg-slate-300" />
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ends On</Label>
                                            <div className="relative">
                                                <Input type="date" value={formData.endDate} onChange={(e) => setFormData(p => ({ ...p, endDate: e.target.value }))} className="h-12 rounded-xl border-slate-100 bg-slate-50/50 pr-4 font-medium" />
                                                <CalendarDays className="absolute right-3 top-3.5 text-slate-300 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">At Time</Label>
                                            <div className="relative">
                                                <Input type="time" value={formData.endTime} onChange={(e) => setFormData(p => ({ ...p, endTime: e.target.value }))} className="h-12 rounded-xl border-slate-100 bg-slate-50/50 pr-4 font-medium" />
                                                <Timer className="absolute right-3 top-3.5 text-slate-300 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* 3. LOGISTICS SECTION */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-2 text-slate-400">
                        <MapPin size={16} className="text-[#EF835D]" />
                        <h2 className="text-[11px] font-black uppercase tracking-wider">Venue & Location</h2>
                    </div>
                    <Card className="rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 relative">
                                    <Label className="text-xs font-bold text-slate-500 ml-1">Base City</Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Search city..."
                                            value={selectedCity?.display_name || cityQuery}
                                            className="h-14 rounded-2xl pl-11 border-slate-100 bg-slate-50/50 focus-visible:ring-[#EF835D]"
                                            onChange={async (e) => {
                                                const val = e.target.value;
                                                setCityQuery(val);
                                                if (val.length > 2) {
                                                    try { setCityResults(await searchCities(val)); } catch { setCityResults([]); }
                                                }
                                            }}
                                        />
                                        <Globe className="absolute left-4 top-4 text-slate-400" size={18} />
                                    </div>
                                    {cityResults.length > 0 && (
                                        <Card className="absolute z-50 w-full mt-2 shadow-2xl border-slate-100 rounded-2xl overflow-hidden max-h-60 bg-white/95 backdrop-blur-md">
                                            {cityResults.map((c) => (
                                                <button key={c.place_id} onClick={() => {
                                                    setSelectedCity(c);
                                                    setCityResults([]);
                                                    setCityQuery("");
                                                    setFormData((p) => ({ ...p, city: c.display_name, latitude: +c.lat, longitude: +c.lon }));
                                                }} className="block w-full text-left px-5 py-4 hover:bg-slate-50 text-sm font-medium border-b last:border-none transition-colors">
                                                    {c.display_name}
                                                </button>
                                            ))}
                                        </Card>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 ml-1">Environment</Label>
                                    <div className="flex p-1.5 bg-slate-100/80 rounded-2xl h-14">
                                        {["INDOOR", "OUTDOOR"].map((type) => (
                                            <button key={type} type="button" onClick={() => setFormData({ ...formData, venue_type: type as "INDOOR" | "OUTDOOR" })} className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-black transition-all ${formData.venue_type === type ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"}`}>
                                                {type === "INDOOR" ? <Home size={14} /> : <Trees size={14} />} {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 ml-1">Venue Name</Label>
                                    <div className="relative">
                                        <Input placeholder="e.g. Central Park" value={formData.venue} className="h-14 rounded-2xl pl-11 border-slate-100 bg-slate-50/50 text-base" onChange={(e) => setFormData((p) => ({ ...p, venue: e.target.value }))} />
                                        <Home className="absolute left-4 top-4 text-slate-400" size={18} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 ml-1">Attendee Capacity</Label>
                                    <div className="relative">
                                        <Input type="number" placeholder="0" value={formData.capacity ?? ""} className="h-14 rounded-2xl pl-11 border-slate-100 bg-slate-50/50 font-bold" onChange={(e) => setFormData((p) => ({ ...p, capacity: e.target.value ? +e.target.value : null }))} />
                                        <Users className="absolute left-4 top-4 text-slate-400" size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner h-[240px]">
                                {typeof window !== "undefined" && (
                                    <MapPicker lat={formData.latitude} lon={formData.longitude} onChange={(lat, lon) => setFormData((p) => ({ ...p, latitude: lat, longitude: lon }))} />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* 4. CATEGORIES / INTEREST TAGS SECTION */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-2 text-slate-400">
                        <Check size={16} className="text-[#EF835D]" />
                        <h2 className="text-[11px] font-black uppercase tracking-wider">Interest Tags</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {AVAILABLE_INTERESTS.map((interest: any) => {
                            const isSelected = formData.interests.includes(interest.id);

                            const toggleInterest = () => {
                                setFormData((prev) => ({
                                    ...prev,
                                    interests: isSelected
                                        ? prev.interests.filter((id) => id !== interest.id)
                                        : [...prev.interests, interest.id],
                                }));
                            };

                            return (
                                <Badge
                                    key={interest.id}
                                    onClick={toggleInterest}
                                    className={`px-6 py-3 rounded-2xl cursor-pointer transition-all border-2 font-bold text-xs ${isSelected
                                        ? "bg-[#EF835D] border-[#EF835D] text-white shadow-lg shadow-[#EF835D]/20 scale-105"
                                        : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                                        }`}
                                >
                                    {interest.name}
                                </Badge>
                            );
                        })}
                    </div>
                </section>


                {/* PUBLISH ACTION */}
                <div className="pt-8">
                    <Button onClick={() => publishEvent(formData)} disabled={isSaving || !formData.title.trim()} className="w-full h-20 rounded-[2.5rem] bg-slate-900 hover:bg-slate-800 text-white text-xl font-black shadow-2xl transition-all active:scale-[0.98] group">
                        {isSaving ? <Loader2 className="animate-spin" /> : (
                            <span className="flex items-center gap-3">
                                PUBLISH EVENT <ArrowRight size={22} className="text-[#EF835D] group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>
                    <Button onClick={() => saveDraft(formData)} disabled={isSaving || !formData.title.trim()} className="w-full h-20 rounded-[2.5rem] bg-slate-900 hover:bg-slate-800 text-white text-xl font-black shadow-2xl transition-all active:scale-[0.98] group">
                        {isSaving ? <Loader2 className="animate-spin" /> : (
                            <span className="flex items-center gap-3">
                                SAVE DRAFT <ArrowRight size={22} className="text-[#EF835D] group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>
                </div>
            </main>
        </div>
    );
}