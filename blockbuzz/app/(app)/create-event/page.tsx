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
    Plus,
    Trash2,
    AlertCircle,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BottomNavbar from "@/components/app/BottomNavbar";
import { useUserStore } from "@/app/store/user.store";

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

interface VolunteerRequirement {
    role: VolunteerRole;
    other_role?: string;
    requiredCount: number;
    skills: string[];
    _skillInput?: string; // local UI state only
}

interface FieldErrors {
    [key: string]: string[];
}

/* ---------------- PAGE ---------------- */

export default function CreateEventPage() {
    const router = useRouter();
    const { user } = useUserStore();
    const isHost = user?.isOrganizer;

    /* 🔐 hydration guard */
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    /* Redirect non-organizers */
    useEffect(() => {
        if (mounted && user !== undefined && !isHost) {
            router.replace("/profile/organizer");
        }
    }, [mounted, user, isHost, router]);

    const [cityQuery, setCityQuery] = useState("");
    const [cityResults, setCityResults] = useState<NominatimResult[]>([]);
    const [selectedCity, setSelectedCity] = useState<NominatimResult | null>(null);

    const [draftId, setDraftId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Error state
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [globalError, setGlobalError] = useState<string | null>(null);

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
        volunteerRequirements: [] as VolunteerRequirement[],
    });

    /* ---------------- INTERESTS ---------------- */

    const { data, isLoading } = useSWR(
        `${process.env.NEXT_PUBLIC_API_BASE}api/admin/interest`,
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    const AVAILABLE_INTERESTS = data?.interests?.slice(0, 10) || [];

    /* ---------------- VOLUNTEER REQUIREMENTS ---------------- */

    function addVolunteerRequirement() {
        setFormData((p) => ({
            ...p,
            volunteerRequirements: [
                ...p.volunteerRequirements,
                { role: "EVENT_SUPPORT", requiredCount: 1, skills: [], _skillInput: "" },
            ],
        }));
    }

    function removeVolunteerRequirement(index: number) {
        setFormData((p) => ({
            ...p,
            volunteerRequirements: p.volunteerRequirements.filter((_, i) => i !== index),
        }));
    }

    function updateVolunteerRequirement(index: number, patch: Partial<VolunteerRequirement>) {
        setFormData((p) => ({
            ...p,
            volunteerRequirements: p.volunteerRequirements.map((r, i) =>
                i === index ? { ...r, ...patch } : r
            ),
        }));
    }

    function addSkill(index: number) {
        const req = formData.volunteerRequirements[index];
        const skill = req._skillInput?.trim();
        if (!skill) return;
        updateVolunteerRequirement(index, {
            skills: [...req.skills, skill],
            _skillInput: "",
        });
    }

    function removeSkill(reqIndex: number, skillIndex: number) {
        const req = formData.volunteerRequirements[reqIndex];
        updateVolunteerRequirement(reqIndex, {
            skills: req.skills.filter((_, i) => i !== skillIndex),
        });
    }

    /* ---------------- ERROR HELPERS ---------------- */

    function clearErrors() {
        setFieldErrors({});
        setGlobalError(null);
    }

    function fieldError(key: string) {
        return fieldErrors[key]?.[0];
    }

    /* ---------------- SAVE / PUBLISH ---------------- */

    function buildPayload(data: typeof formData, id?: string | null) {
        // Strip local-only UI fields from volunteerRequirements
        const cleanedReqs = data.volunteerRequirements.map(({ _skillInput, ...rest }) => rest);

        return {
            ...(id ? { id } : {}),
            title: data.title,
            description: data.description,
            city: data.city,
            venue: data.venue,
            venue_type: data.venue_type,
            latitude: data.latitude,
            longitude: data.longitude,
            startTime:
                data.startDate && data.startTime
                    ? new Date(`${data.startDate}T${data.startTime}`).toISOString()
                    : null,
            endTime:
                data.endDate && data.endTime
                    ? new Date(`${data.endDate}T${data.endTime}`).toISOString()
                    : null,
            capacity: data.capacity,
            interests: data.interests,
            volunteerRequirements: cleanedReqs,
        };
    }

    async function saveDraft(data: typeof formData) {
        if (!data.title.trim()) return;
        clearErrors();
        setIsSaving(true);
        try {
            const payload = buildPayload(data, draftId);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}api/organizer/event/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            });

            const json = await res.json();
            if (json?.data?.id) setDraftId(json.data.id);

            if (!res.ok) {
                if (json?.details) setFieldErrors(json.details);
                else setGlobalError(json?.message || "Failed to save draft.");
            }
        } catch {
            setGlobalError("Network error. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    async function publishEvent(data: typeof formData) {
        if (!data.title.trim()) {
            setFieldErrors({ title: ["Title is required"] });
            return;
        }
        clearErrors();
        setIsSaving(true);
        try {
            const payload = buildPayload(data, draftId);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}api/organizer/event/publish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            });

            const json = await res.json();

            if (!res.ok) {
                if (json?.details) setFieldErrors(json.details);
                else setGlobalError(json?.message || "Failed to publish event.");
                return;
            }

            router.replace("/profile/organizer");
        } catch {
            setGlobalError("Network error. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    if (!mounted || isLoading || user === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    // Don't render the form while redirect is pending
    if (!isHost) return null;

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

            <main className="p-6 max-w-3xl mx-auto space-y-8">

                {/* GLOBAL ERROR BANNER */}
                {globalError && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <p className="text-sm flex-1">{globalError}</p>
                        <button onClick={() => setGlobalError(null)}>
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* TITLE & DESCRIPTION */}
                <Card className="rounded-[2.5rem]">
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-1">
                            <Input
                                placeholder="Event title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData((p) => ({ ...p, title: e.target.value }))
                                }
                                className={`h-14 rounded-2xl ${fieldError("title") ? "border-red-400" : ""}`}
                            />
                            {fieldError("title") && (
                                <p className="text-xs text-red-500 flex items-center gap-1 pl-1">
                                    <AlertCircle size={12} /> {fieldError("title")}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Textarea
                                placeholder="Event description (min 10 characters)"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData((p) => ({ ...p, description: e.target.value }))
                                }
                                className={`rounded-2xl min-h-[150px] ${fieldError("description") ? "border-red-400" : ""}`}
                            />
                            {fieldError("description") && (
                                <p className="text-xs text-red-500 flex items-center gap-1 pl-1">
                                    <AlertCircle size={12} /> {fieldError("description")}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* LOCATION */}
                <Card className="rounded-[2.5rem]">
                    <CardContent className="p-6 space-y-4">
                        <h2 className="font-bold text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <MapPin size={14} /> Location
                        </h2>

                        {/* City search */}
                        <div className="relative space-y-1">
                            <Input
                                placeholder="Search city..."
                                value={selectedCity?.display_name || cityQuery}
                                onChange={async (e) => {
                                    const v = e.target.value;
                                    setSelectedCity(null);
                                    setCityQuery(v);
                                    if (v.length > 2) {
                                        setCityResults(await searchCities(v));
                                    } else {
                                        setCityResults([]);
                                    }
                                }}
                                className={fieldError("city") ? "border-red-400" : ""}
                            />
                            {fieldError("city") && (
                                <p className="text-xs text-red-500 flex items-center gap-1 pl-1">
                                    <AlertCircle size={12} /> {fieldError("city")}
                                </p>
                            )}

                            {cityResults.length > 0 && (
                                <Card className="absolute z-50 w-full top-full mt-1 shadow-lg">
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
                                            className="block w-full text-left px-4 py-3 hover:bg-slate-100 text-sm"
                                        >
                                            {c.display_name}
                                        </button>
                                    ))}
                                </Card>
                            )}
                        </div>

                        {/* Venue name */}
                        <div className="space-y-1">
                            <Input
                                placeholder="Venue name (e.g. PDEU Auditorium)"
                                value={formData.venue}
                                onChange={(e) =>
                                    setFormData((p) => ({ ...p, venue: e.target.value }))
                                }
                                className={fieldError("venue") ? "border-red-400" : ""}
                            />
                            {fieldError("venue") && (
                                <p className="text-xs text-red-500 flex items-center gap-1 pl-1">
                                    <AlertCircle size={12} /> {fieldError("venue")}
                                </p>
                            )}
                        </div>

                        {/* Venue type */}
                        <div className="flex gap-3">
                            {(["INDOOR", "OUTDOOR"] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFormData((p) => ({ ...p, venue_type: type }))}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-sm font-semibold transition-all ${formData.venue_type === type
                                        ? "border-[#EF835D] bg-[#EF835D]/10 text-[#EF835D]"
                                        : "border-slate-200 text-slate-400 hover:border-slate-300"
                                        }`}
                                >
                                    {type === "INDOOR" ? <Home size={16} /> : <Trees size={16} />}
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* Map */}
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

                {/* DATE & TIME */}
                <Card className="rounded-[2.5rem]">
                    <CardContent className="p-6 space-y-5">
                        <h2 className="font-bold text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <CalendarDays size={14} /> Date & Time
                        </h2>

                        {/* Start */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Start
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, startDate: e.target.value }))
                                        }
                                        className={fieldError("startTime") ? "border-red-400" : ""}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, startTime: e.target.value }))
                                        }
                                        className={fieldError("startTime") ? "border-red-400" : ""}
                                    />
                                </div>
                            </div>
                            {fieldError("startTime") && (
                                <p className="text-xs text-red-500 flex items-center gap-1 pl-1">
                                    <AlertCircle size={12} /> {fieldError("startTime")}
                                </p>
                            )}
                        </div>

                        {/* End */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                End
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) =>
                                        setFormData((p) => ({ ...p, endDate: e.target.value }))
                                    }
                                    className={fieldError("endTime") ? "border-red-400" : ""}
                                />
                                <Input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) =>
                                        setFormData((p) => ({ ...p, endTime: e.target.value }))
                                    }
                                    className={fieldError("endTime") ? "border-red-400" : ""}
                                />
                            </div>
                            {fieldError("endTime") && (
                                <p className="text-xs text-red-500 flex items-center gap-1 pl-1">
                                    <AlertCircle size={12} /> {fieldError("endTime")}
                                </p>
                            )}
                        </div>

                        {/* Capacity */}
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Capacity
                            </Label>
                            <div className="relative">
                                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input
                                    type="number"
                                    min={1}
                                    placeholder="Max attendees"
                                    value={formData.capacity ?? ""}
                                    onChange={(e) =>
                                        setFormData((p) => ({
                                            ...p,
                                            capacity: e.target.value ? parseInt(e.target.value) : null,
                                        }))
                                    }
                                    className={`pl-9 ${fieldError("capacity") ? "border-red-400" : ""}`}
                                />
                            </div>
                            {fieldError("capacity") && (
                                <p className="text-xs text-red-500 flex items-center gap-1 pl-1">
                                    <AlertCircle size={12} /> {fieldError("capacity")}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* INTERESTS */}
                <div className="space-y-3">
                    <h2 className="font-bold text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                        <Sparkles size={14} /> Interests
                    </h2>
                    {fieldError("interests") && (
                        <p className="text-xs text-red-500 flex items-center gap-1 pl-1">
                            <AlertCircle size={12} /> {fieldError("interests")}
                        </p>
                    )}
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
                </div>

                {/* VOLUNTEER REQUIREMENTS */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="font-bold text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Users size={14} /> Volunteer Requirements
                        </h2>
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl gap-1"
                            onClick={addVolunteerRequirement}
                        >
                            <Plus size={14} /> Add Role
                        </Button>
                    </div>

                    {formData.volunteerRequirements.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-4 bg-white rounded-2xl border border-dashed">
                            No volunteer roles yet. Add one if needed.
                        </p>
                    )}

                    {formData.volunteerRequirements.map((req, index) => (
                        <Card key={index} className="rounded-3xl">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                        Role #{index + 1}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => removeVolunteerRequirement(index)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>

                                {/* Role select */}
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">Role</Label>
                                    <select
                                        value={req.role}
                                        onChange={(e) =>
                                            updateVolunteerRequirement(index, {
                                                role: e.target.value as VolunteerRole,
                                            })
                                        }
                                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#EF835D]/30"
                                    >
                                        {VOLUNTEER_ROLES.map((r) => (
                                            <option key={r} value={r}>
                                                {r.replace(/_/g, " ")}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Other role (shown only when role is OTHER) */}
                                {req.role === "OTHER" && (
                                    <div className="space-y-1">
                                        <Label className="text-xs text-slate-500">Custom Role Name</Label>
                                        <Input
                                            placeholder="Describe the role..."
                                            value={req.other_role || ""}
                                            onChange={(e) =>
                                                updateVolunteerRequirement(index, { other_role: e.target.value })
                                            }
                                            className="rounded-xl"
                                        />
                                    </div>
                                )}

                                {/* Required count */}
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">Required Count</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={req.requiredCount}
                                        onChange={(e) =>
                                            updateVolunteerRequirement(index, {
                                                requiredCount: parseInt(e.target.value) || 1,
                                            })
                                        }
                                        className="rounded-xl"
                                    />
                                </div>

                                {/* Skills */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-500">Skills (optional)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="e.g. First Aid, Python..."
                                            value={req._skillInput || ""}
                                            onChange={(e) =>
                                                updateVolunteerRequirement(index, { _skillInput: e.target.value })
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addSkill(index);
                                                }
                                            }}
                                            className="rounded-xl flex-1"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl px-3"
                                            onClick={() => addSkill(index)}
                                        >
                                            <Plus size={14} />
                                        </Button>
                                    </div>
                                    {req.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {req.skills.map((skill, si) => (
                                                <span
                                                    key={si}
                                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs"
                                                >
                                                    {skill}
                                                    <button
                                                        onClick={() => removeSkill(index, si)}
                                                        className="text-slate-400 hover:text-red-500"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* ACTIONS */}
                <div className="space-y-3 pt-4">
                    <Button
                        onClick={() => publishEvent(formData)}
                        disabled={isSaving}
                        className="w-full h-16 rounded-[2.5rem] text-lg font-black bg-[#EF835D] hover:bg-[#e0724e]"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                        Publish Event <ArrowRight className="ml-2" />
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => saveDraft(formData)}
                        disabled={isSaving}
                        className="w-full h-14 rounded-[2.5rem] text-base font-bold"
                    >
                        Save Draft
                    </Button>
                </div>
            </main>

            <BottomNavbar />
        </div>
    );
}