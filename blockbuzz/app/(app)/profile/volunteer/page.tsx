"use client";

import useSWR from "swr";
import { useState } from "react";
import BottomNavbar from "@/components/app/BottomNavbar";
import {
    Loader2,
    Star,
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

/* ---------------- EVENT CARD ---------------- */
const EventCard = ({ event }: { event: VolunteerEvent }) => {
    const isPast = event.status === "PAST";
    const eventDate = new Date(event.date);

    return (
        <div className="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-[#EF835D]/30 transition-all mb-4">
            <div className="flex gap-4">
                <div className="flex flex-col items-center justify-center bg-[#EF835D]/10 text-[#EF835D] rounded-xl w-14 h-16 flex-shrink-0 border border-[#EF835D]/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        {eventDate.toLocaleString("default", { month: "short" })}
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

            <p className="text-slate-500 text-xs mt-3 line-clamp-2 italic">
                "{event.description}"
            </p>

            <Link href={`/events?roles=Volunteer&eventId=${event.id}`}>
                <button className="w-full mt-4 py-2 rounded-xl border border-slate-100 text-xs font-semibold text-slate-600 group-hover:bg-[#EF835D] group-hover:text-white transition-all flex items-center justify-center gap-2">
                    {isPast ? "View Certificate" : "Event Logistics"}
                    <ArrowRight size={14} />
                </button>
            </Link>
        </div>
    );
};

/* ---------------- PAGE ---------------- */
export default function VolunteerPage() {
    const router = useRouter();
    const { user } = useUserStore();

    const isVolunteer = user?.isVolunteer;
    const [loading, setLoading] = useState(false);

    /* ✅ FIX: always call useSWR */
    const {
        data,
        isLoading: isVolunteerLoading,
    } = useSWR(
        isVolunteer ? "/api/user/volunteer" : null,
        fetcher
    );

    const upcomingEvents: VolunteerEvent[] =
        data?.Upcoming || [];

    const pastEvents: VolunteerEvent[] =
        data?.Past || [];

    const isPageLoading =
        isVolunteer == null || (isVolunteer && isVolunteerLoading);

    const beVolunteer = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/volunteer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user?.id,
                    admin_secret: "rndblockbuzz",
                }),
            });

            const result = await res.json();

            if (!result.success) {
                alert(result.message);
                return;
            }

            alert("You have been successfully registered as a volunteer");
            router.refresh();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (isPageLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#EF835D]" />
            </div>
        );
    }

    return (
        <div className="bg-[#FCFBFA] min-h-screen pb-24">
            <header className="px-6 py-4 grid grid-cols-3 items-center sticky top-0 bg-[#FCFBFA]/80 backdrop-blur-md z-50 border-b">
                <button onClick={() => router.push("/profile")}>
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-sm col-span-2 font-bold uppercase text-slate-500">
                    Volunteer Dashboard
                </h1>
            </header>

            <main className="px-6">
                {isVolunteer ? (
                    <Tabs defaultValue="upcoming" className="mt-6">
                        <TabsList className="grid grid-cols-2 h-14 bg-slate-100 rounded-2xl p-1.5">
                            <TabsTrigger value="upcoming">
                                Upcoming ({upcomingEvents.length})
                            </TabsTrigger>
                            <TabsTrigger value="past">
                                Past ({pastEvents.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="upcoming" className="mt-6">
                            {upcomingEvents.length ? (
                                upcomingEvents.map(e => (
                                    <EventCard key={e.id} event={e} />
                                ))
                            ) : (
                                <p className="text-center text-slate-400 py-10">
                                    No upcoming events scheduled.
                                </p>
                            )}
                        </TabsContent>

                        <TabsContent value="past" className="mt-6">
                            {pastEvents.length ? (
                                pastEvents.map(e => (
                                    <EventCard key={e.id} event={e} />
                                ))
                            ) : (
                                <p className="text-center text-slate-400 py-10">
                                    Your volunteer history is empty.
                                </p>
                            )}
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="mt-12 text-center space-y-4">
                        <Trophy size={40} className="mx-auto text-slate-300" />
                        <h2 className="text-xl font-bold">No impact yet?</h2>
                        <p className="text-slate-500 text-sm px-10">
                            Join our volunteer community and start contributing.
                        </p>
                        <button
                            onClick={beVolunteer}
                            disabled={loading}
                            className="bg-[#EF835D] text-white px-8 py-3 rounded-2xl font-bold"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Find Opportunities"
                            )}
                        </button>
                    </div>
                )}
            </main>

            <BottomNavbar />
        </div>
    );
}
