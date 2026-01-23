"use client";

import useSWR from "swr";
import BottomNavbar from "@/components/app/BottomNavbar";
import {
    Loader2,
    Star,
    Share2,
    ChevronLeft,
    MapPin,
    Clock,
    Trophy,
    ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useUserStore } from "@/app/store/user.store";

const fetcher = (url: string) =>
    fetch(url, { credentials: "include" }).then(res => res.json());

interface VolunteerEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    status: "UPCOMING" | "PAST";
    rating?: number;
}

// --- MOCK DATA ---
export const upcomingEvents: VolunteerEvent[] = [
    {
        id: "evt_101",
        title: "Community Health Camp",
        date: "2026-02-10",
        time: "09:00 AM – 01:00 PM",
        location: "City Community Hall, Indore",
        description: "Assist doctors and manage patient registrations at the free health camp.",
        status: "UPCOMING",
    },
    {
        id: "evt_102",
        title: "Beach Clean-Up Drive",
        date: "2026-02-18",
        time: "06:30 AM – 09:30 AM",
        location: "Silver Beach",
        description: "Help clean the beach and spread awareness about plastic pollution.",
        status: "UPCOMING",
    },
    {
        id: "evt_103",
        title: "Tree Plantation Program",
        date: "2026-03-02",
        time: "08:00 AM – 11:00 AM",
        location: "Central Park",
        description: "Plant saplings and assist the environmental team with logistics.",
        status: "UPCOMING",
    },
];

export const pastEvents: VolunteerEvent[] = [
    {
        id: "evt_001",
        title: "Blood Donation Camp",
        date: "2025-11-12",
        time: "10:00 AM – 04:00 PM",
        location: "Government Hospital",
        description: "Managed donor queues and assisted hospital staff.",
        status: "PAST",
        rating: 4.5,
    },
    {
        id: "evt_002",
        title: "Food Distribution Drive",
        date: "2025-10-05",
        time: "07:00 PM – 09:00 PM",
        location: "Old City Shelter",
        description: "Distributed food packets to underprivileged families.",
        status: "PAST",
        rating: 5,
    },
];

// --- SUB-COMPONENT: EVENT CARD ---
const EventCard = ({ event }: { event: VolunteerEvent }) => {
    const isPast = event.status === "PAST";
    const eventDate = new Date(event.date);

    return (
        <div className="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-[#EF835D]/30 transition-all mb-4">
            <div className="flex gap-4">
                {/* Date Badge */}
                <div className="flex flex-col items-center justify-center bg-[#EF835D]/10 text-[#EF835D] rounded-xl w-14 h-16 flex-shrink-0 border border-[#EF835D]/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        {eventDate.toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-xl font-black">{eventDate.getDate()}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-800 truncate pr-2 group-hover:text-[#EF835D] transition-colors">
                            {event.title}
                        </h3>
                        {isPast && event.rating && (
                            <div className="flex items-center gap-1 text-amber-500 shrink-0">
                                <Star size={12} fill="currentColor" />
                                <span className="text-xs font-bold">{event.rating}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1 mt-2">
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <MapPin size={13} className="text-[#EF835D]" />
                            <span className="text-xs truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <Clock size={13} className="text-[#EF835D]" />
                            <span className="text-xs">{event.time}</span>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-slate-500 text-xs mt-3 line-clamp-2 leading-relaxed italic">
                "{event.description}"
            </p>

            <Link href={`/events?roles=Volunteer&eventId=${event.id}`}>
                <button className="w-full mt-4 py-2 rounded-xl border border-slate-100 text-xs font-semibold text-slate-600 group-hover:bg-[#EF835D] group-hover:text-white group-hover:border-[#EF835D] transition-all flex items-center justify-center gap-2">
                    {isPast ? "View Certificate" : "Event Logistics"}
                    <ArrowRight size={14} />
                </button>
            </Link>
        </div>
    );
};

export default function VolunteerPage() {
    const router = useRouter();
    const { user } = useUserStore();

    const isVolunteer = !!user?.isVolunteer || true;

    if (isVolunteer == null) {
        return <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-[#EF835D]" />
        </div>
    }

    return (
        <div className="bg-[#FCFBFA] min-h-screen pb-24 font-sans text-slate-900">
            <header className="px-6 py-4 grid grid-cols-3 items-center sticky top-0 bg-[#FCFBFA]/80 backdrop-blur-md z-50 border-b border-slate-100">
                <button onClick={() => router.push('/profile')} className="p-2 -ml-2 rounded-full transition-colors">
                    <ChevronLeft size={24} className="text-slate-800" />
                </button>
                <h1 className="text-sm col-span-2 font-bold text-slate-500 tracking-tight uppercase">Volunteer Dashboard</h1>
            </header>

            <main className="px-6">
                {isVolunteer ? (
                    <div className="space-y-6">
                        {/* Profile Header */}
                        <div className="bg-[#EF835D] rounded-[2rem] p-6 text-white shadow-lg shadow-[#EF835D]/20 relative overflow-hidden">
                            <div className="relative z-10 flex justify-between items-end">
                                <div>
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Verified Volunteer</span>
                                    <h2 className="text-2xl font-black mt-3">{user?.name || "Volunteer"}</h2>
                                    <p className="text-white/80 text-xs mt-1">Impact Maker since 2025</p>
                                </div>
                                <div className="text-right">
                                    <Trophy size={24} className="ml-auto mb-2 text-white/50" />
                                    <p className="text-3xl font-black">1.2k</p>
                                    <p className="text-[10px] uppercase font-bold opacity-80 tracking-tighter">Points</p>
                                </div>
                            </div>
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />
                        </div>

                        <Tabs className="w-full" defaultValue="upcoming">
                            <TabsList className="grid w-full grid-cols-2 h-14 bg-slate-100 rounded-2xl p-1.5">
                                <TabsTrigger
                                    value="upcoming"
                                    className="rounded-xl text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#EF835D] transition-all"
                                >
                                    Upcoming ({upcomingEvents.length})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="past"
                                    className="rounded-xl text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#EF835D] transition-all"
                                >
                                    Past History ({pastEvents.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="upcoming" className="mt-6 space-y-4 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {upcomingEvents.length > 0 ? (
                                    <>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Confirmed Enrollments</p>
                                        {upcomingEvents.map((event) => (
                                            <EventCard key={event.id} event={event} />
                                        ))}
                                    </>
                                ) : (
                                    <p className="text-center text-slate-400 py-10 text-sm">No upcoming events scheduled.</p>
                                )}
                            </TabsContent>

                            <TabsContent value="past" className="mt-6 space-y-4 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {pastEvents.length > 0 ? (
                                    pastEvents.map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))
                                ) : (
                                    <p className="text-center text-slate-400 py-10 text-sm">Your volunteer history is empty.</p>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                ) : (
                    <div className="mt-12 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                            <Trophy size={40} />
                        </div>
                        <h2 className="text-xl font-bold">No impact yet?</h2>
                        <p className="text-slate-500 text-sm px-10 leading-relaxed">
                            Join our community of volunteers and start earning points for your social contributions.
                        </p>
                        <button className="bg-[#EF835D] text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-[#EF835D]/30 active:scale-95 transition-transform">
                            Find Opportunities
                        </button>
                    </div>
                )}
            </main>

            <BottomNavbar />
        </div>
    );
}