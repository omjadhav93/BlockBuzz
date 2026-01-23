"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNavbar from "@/components/app/BottomNavbar";
import { useRouter } from "next/navigation";
import {
    ChevronLeft, Calendar, MapPin, Users, Clock,
    MoreVertical, ArrowUpRight, BarChart3,
    CheckCircle2, AlertCircle, FileText, Loader2
} from "lucide-react";
import useSWR from "swr";
import Link from "next/link";
import { mockEventResponse } from "@/mockData/Event-Section";

/* -------------------- TYPES -------------------- */

interface EventData {
    id: string;
    title: string;
    description: string;
    city: string;
    venue: string;
    venue_type: string;
    startTime: string;
    endTime: string;
    capacity: number;
    published: boolean;
    cancelled: boolean;
    status?: string;
}

interface EventResponse {
    events: {
        Upcoming: EventData[];
        Attended: EventData[];
    }
}

/* -------------------- FETCHER -------------------- */

const fetcher = async (url: string): Promise<EventResponse> => {
    const res = await fetch(url, {
        method: "GET",
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch events");
    return res.json();
};

/* -------------------- PAGE -------------------- */

export default function EventPage() {
    const router = useRouter();
    // const { data, isLoading, error } = useSWR("/api/user/events", fetcher);

    const data = mockEventResponse;
    const upcomingEvents = data?.events?.Upcoming || [];
    const pastEvents = data?.events?.Attended || [];

    // if (isLoading) {
    //     return (
    //         <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCFBFA]">
    //             <Loader2 className="w-8 h-8 animate-spin text-[#EF835D] mb-2" />
    //             <p className="text-slate-400 text-sm font-medium">Loading events...</p>
    //         </div>
    //     );
    // }

    // if (error) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center bg-[#FCFBFA] text-red-500 font-medium">
    //             Failed to load events. Please try again later.
    //         </div>
    //     );
    // }

    return (
        <div className="min-h-screen bg-[#FCFBFA] pb-32 font-sans">
            {/* Header - Fixed Grid and Alignment */}
            <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-[#FCFBFA]/80 backdrop-blur-md z-50 border-b border-slate-100">
                <button
                    onClick={() => router.push("/profile")}
                    className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <ChevronLeft size={24} className="text-slate-800" />
                </button>
                <h1 className="text-sm font-black text-slate-500 tracking-[0.2em] uppercase">
                    My Events
                </h1>
                <div className="w-10" />
            </header>

            <main className="px-6 pt-6">
                <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-14 bg-slate-100 rounded-2xl p-1.5">
                        <TabsTrigger
                            value="upcoming"
                            className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-wider"
                        >
                            Upcoming ({upcomingEvents.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="past"
                            className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-wider"
                        >
                            History ({pastEvents.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="mt-8 space-y-6 outline-none">
                        {upcomingEvents.length ? (
                            upcomingEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))
                        ) : (
                            <EmptyState message="No upcoming events scheduled." />
                        )}
                    </TabsContent>

                    <TabsContent value="past" className="mt-8 space-y-6 outline-none">
                        {pastEvents.length ? (
                            pastEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))
                        ) : (
                            <EmptyState message="Your volunteer history is empty." />
                        )}
                    </TabsContent>
                </Tabs>
            </main>

            <BottomNavbar />
        </div>
    );
}

/* -------------------- COMPONENTS -------------------- */

function EventCard({ event }: { event: EventData }) {
    const start = new Date(event.startTime);
    const isPast = start < new Date();
    const isDraft = !event.published;
    const isCancelled = event.cancelled;

    const getStatusUI = () => {
        if (isCancelled) return { label: "Cancelled", color: "text-red-500", bg: "bg-red-50", icon: <AlertCircle size={12} /> };
        if (isDraft) return { label: "Draft", color: "text-amber-500", bg: "bg-amber-50", icon: <FileText size={12} /> };
        if (isPast) return { label: "Completed", color: "text-slate-400", bg: "bg-slate-50", icon: <CheckCircle2 size={12} /> };
        return { label: "Registered", color: "text-green-500", bg: "bg-green-50", icon: <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> };
    };

    const status = getStatusUI();
    const day = start.getDate();
    const month = start.toLocaleString('default', { month: 'short' });
    const time = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-2">
                    <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl w-14 h-14 border border-slate-100 shrink-0 group-hover:border-[#EF835D]/30 transition-colors">
                        <span className="text-[10px] font-black uppercase text-[#EF835D] tracking-tighter">{month}</span>
                        <span className="text-xl font-black text-slate-900 leading-none">{day}</span>
                    </div>

                    <div className="space-y-1 flex items-center">
                        <h3 className="font-bold text-slate-900 text-lg leading-tight  transition-colors line-clamp-1">
                            {event.title}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
                <DetailItem icon={<MapPin size={14} />} label={`${event.venue}, ${event.city}`} />
                <DetailItem icon={<Clock size={14} />} label={time} />
                <DetailItem icon={<Users size={14} />} label={`${event.capacity} Max`} />
                <DetailItem icon={<CheckCircle2 size={14} />} label={event.venue_type} />
            </div>

            <Link href={`/events?role=${"User"}&eventId=${event.id}`}>
                <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                    <button className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${isDraft ? "bg-amber-500 text-white shadow-amber-100" : "bg-slate-900 text-white shadow-slate-200"
                        }`}>
                        {isDraft ? "Complete Setup" : "Event Details"}
                        <ArrowUpRight size={14} />
                    </button>
                </div>
            </Link>
        </div >
    );
}

function DetailItem({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="flex items-center gap-2.5 text-slate-500 min-w-0">
            <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-[#EF835D] transition-colors shrink-0">
                {icon}
            </div>
            <span className="text-[11px] font-bold truncate text-slate-600 tracking-tight">{label}</span>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-dashed border-slate-200 rounded-[2rem]">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Calendar size={24} className="text-slate-200" />
            </div>
            <p className="text-slate-400 text-sm font-medium px-8">{message}</p>
        </div>
    );
}