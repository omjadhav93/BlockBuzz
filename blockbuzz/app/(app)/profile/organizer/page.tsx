"use client";

import useSWR from "swr";
import { useState, useMemo } from "react";
import BottomNavbar from "@/components/app/BottomNavbar";
import {
    ChevronLeft,
    Loader2,
    Plus,
    Users,
    Calendar,
    BarChart3,
    MoreVertical,
    ArrowUpRight,
    Clock,
    MapPin,
    CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserStore } from "@/app/store/user.store";

const fetcher = (url: string) =>
    fetch(url, { credentials: "include" }).then((res) => res.json());

type TabType = "upcoming" | "past" | "drafts";

export default function HostPage() {
    const router = useRouter();
    const { user } = useUserStore();
    const isHost = user?.isOrganizer;
    const { data, isLoading } = useSWR("/api/organizer/event/list", fetcher);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>("upcoming");
    // Replace with actual logic if needed

    const events = data?.events ?? {
        Upcoming: [],
        Past: [],
        Drafts: [],
    };

    const filteredEvents = useMemo(() => {
        if (activeTab === "upcoming") return events.Upcoming ?? [];
        if (activeTab === "past") return events.Past ?? [];
        if (activeTab === "drafts") return events.Drafts ?? [];
        return [];
    }, [activeTab, events]);

    const totalEvents =
        (events.Upcoming?.length ?? 0) +
        (events.Past?.length ?? 0) +
        (events.Drafts?.length ?? 0);

    const becomeHost = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/organizer/request", {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();
            if (data.success) {
                router.refresh();
            }
        } catch (error) {
            console.error("Error becoming host:", error);
        } finally {
            setLoading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#FCFBFA]">
                <Loader2 className="w-8 h-8 animate-spin text-[#EF835D]" />
            </div>
        );
    }

    return (
        <div className="bg-[#FCFBFA] min-h-screen pb-32 font-sans">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-[#FCFBFA]/80 backdrop-blur-md z-50 border-b border-slate-100">
                <button
                    onClick={() => router.push("/profile")}
                    className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} className="text-slate-800" />
                </button>
                <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Organizer Hub
                </h1>
                <button className="p-2 hover:bg-slate-100 rounded-full text-[#EF835D] transition-colors">
                    <BarChart3 size={20} />
                </button>
            </header>

            <main className="px-6 pt-6">
                {isHost ? (
                    <div className="space-y-8">
                        {/* Stats Bento */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#EF835D] p-5 rounded-[2.5rem] text-white shadow-lg shadow-[#EF835D]/20 relative overflow-hidden">
                                <Users size={20} className="mb-2 opacity-80" />
                                <p className="text-2xl font-black">0</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Volunteers</p>
                                <Users size={60} className="absolute -right-4 -bottom-4 opacity-10" />
                            </div>
                            <div className="bg-slate-900 p-5 rounded-[2.5rem] text-white shadow-lg relative overflow-hidden">
                                <Calendar size={20} className="mb-2 text-[#EF835D]" />
                                <p className="text-2xl font-black">{totalEvents}</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Total Events</p>
                                <Calendar size={60} className="absolute -right-4 -bottom-4 opacity-10" />
                            </div>
                        </div>

                        {/* Custom Segmented Control (Tabs) */}
                        <div className="flex p-1.5 bg-slate-100 rounded-[1.5rem] border border-slate-200/50">
                            {(["upcoming", "past", "drafts"] as TabType[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab
                                        ? "bg-white text-slate-900 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* List Header */}
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xl font-black text-slate-900 capitalize tracking-tight">
                                {activeTab} List
                            </h2>
                            {activeTab !== "past" && (
                                <Link href="/create-event">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-[#EF835D] text-white rounded-full shadow-md shadow-[#EF835D]/20 active:scale-95 transition-all">
                                        <Plus size={18} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Create</span>
                                    </button>
                                </Link>
                            )}
                        </div>

                        {/* List of Event Cards */}
                        <div className="space-y-6">
                            {filteredEvents.length === 0 ? (
                                <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="text-slate-200" size={24} />
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium">
                                        No {activeTab} events found
                                    </p>
                                </div>
                            ) : (
                                filteredEvents.map((event: any) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        activeTab={activeTab}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <EmptyState becomeHost={() => { becomeHost }} loading={loading} />
                )}
            </main>

            <BottomNavbar />
        </div>
    );
}

/* ---------------------------------- */
/* Sub-Component: EventCard           */
/* ---------------------------------- */

function EventCard({ event, activeTab }: { event: any; activeTab: TabType }) {
    const startDate = new Date(event.startTime);
    const day = startDate.getDate();
    const month = startDate.toLocaleString("en-US", { month: "short" });

    // Mocking progress - replace with actual counts if available in API
    const volunteerCount = event._count?.registrations ?? 0;
    const capacity = event.capacity || 1;
    const progress = Math.min((volunteerCount / capacity) * 100, 100);

    return (
        <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-5">
                <div className="flex gap-4">
                    {/* Visual Date Thumbnail */}
                    <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl w-14 h-14 border border-slate-100 shrink-0 group-hover:border-[#EF835D]/30 transition-colors">
                        <span className="text-[10px] font-black uppercase text-[#EF835D] tracking-tighter">
                            {month}
                        </span>
                        <span className="text-xl font-black text-slate-900 leading-none">
                            {day}
                        </span>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${activeTab === 'upcoming' ? 'bg-green-500 animate-pulse' :
                                activeTab === 'drafts' ? 'bg-amber-400' : 'bg-slate-300'
                                }`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {event.venue_type || "Event"}
                            </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-[#EF835D] transition-colors line-clamp-1">
                            {event.title}
                        </h3>
                    </div>
                </div>

                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Capacity Progress (Hidden for Drafts) */}
            {activeTab !== "drafts" && (
                <div className="mb-5">
                    <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-1.5">
                            <Users size={14} className="text-[#EF835D]" />
                            <span className="text-[11px] font-bold text-slate-600">
                                {volunteerCount} / {capacity} Registered
                            </span>
                        </div>
                        <span className="text-[10px] font-black text-[#EF835D]">
                            {Math.round(progress)}%
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${activeTab === 'past' ? 'bg-slate-300' : 'bg-[#EF835D]'
                                }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-slate-500 min-w-0">
                    <MapPin size={14} className="text-slate-300 shrink-0" />
                    <span className="text-xs font-medium truncate">{event.city}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 min-w-0">
                    <Clock size={14} className="text-slate-300 shrink-0" />
                    <span className="text-xs font-medium">
                        {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>

            {/* Adaptive Action Button */}
            <Link href={`/events?role=${"Organizer"}&eventId=${event.id}`}>
                <button
                    className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${activeTab === "drafts"
                        ? "bg-amber-500 text-white shadow-amber-100"
                        : "bg-slate-900 text-white shadow-slate-200"
                        }`}
                >
                    {activeTab === "drafts" ? "Complete Draft" : "Manage Event"}
                    <ArrowUpRight size={16} />
                </button>
            </Link>

        </div>
    );
}

function EmptyState({ becomeHost, loading }: { becomeHost: () => void; loading: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                <Users size={40} className="text-slate-200" />
            </div>
            <div>
                <h2 className="text-2xl font-black text-slate-900">Start Hosting</h2>
                <p className="text-slate-500 text-sm mt-2 px-10">Register as a host to start creating events and managing your community.</p>
            </div>
            <button
                onClick={becomeHost}
                className="bg-[#EF835D] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#EF835D]/30 active:scale-95 transition-all"
            >
                {loading ? "Registering..." : "Register as Host"}
            </button>
        </div>
    );
}