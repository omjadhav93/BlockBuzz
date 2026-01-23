"use client";
import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import BottomNavbar from "@/components/app/BottomNavbar";
import { Bell, Search, MapPin, SparklesIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import EventCard from "@/components/app/EventCard";
import { getGreeting } from "@/lib/greet";
import { mockEvents } from "@/mockData/Event-Mock-Data"
interface Location { lat: number; lng: number; }
import { Event } from "@/mockData/Event-Mock-Data"
// interface Event { id: string; title: string; daysLeft: string, startTime: string, latitude: number; longitude: number; live: boolean; distance: number; }

const defaultLoc: Location = { lat: 18.5195, lng: 73.8553 };

const fetcher = (url: string) =>
    fetch(url, { credentials: "include" }).then(res => res.json());

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [center] = useState<Location>(defaultLoc);
    const [radius] = useState(50);
    const [visibleCount, setVisibleCount] = useState(4);

    const { data } = useSWR(`/api/event/nearby?lat=${center.lat}&long=${center.lng}&radius=${radius}`, fetcher);
    const events: Event[] = data?.events || mockEvents;

    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!loadMoreRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            setVisibleCount((prev) => Math.min(prev + 4, events.length));
                        }, 1000);
                    }
                });
            },
            { rootMargin: "200px" }
        );

        observer.observe(loadMoreRef.current);

        return () => observer.disconnect();
    }, [events]);


    return (
        <div className="min-w-screen h-screen p-4 space-y-4 overflow-y-scroll">
            {/* Header */}
            <header className="sticky top-0 z-50 space-y-3 bg-white/70 backdrop-blur-md border-b border-slate-100/50">
                <div className="flex justify-between items-center">
                    <div className="flex-1">
                        <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                            {getGreeting()}, Rahul 👋
                        </span>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Discover Events</h1>
                    </div>
                    <div className="relative">
                        <div className="w-11 h-11 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm">
                            <Bell size={20} className="text-slate-800" />
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="relative">
                        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search event, topics ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 h-12 bg-slate-100/50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-[#EF835D]/50 placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </header>

            <main>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FDF2ED] text-[#EF835D] font-semibold text-[11px] border border-[#EF835D]/10">
                    <MapPin size={12} strokeWidth={2.5} /> Within {radius}km
                </span>

                {/* For You */}
                <div className="mt-8">
                    <div className="flex items-center justify-between px-4 mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 tracking-tight">
                            <SparklesIcon className="text-[#EF835D]" size={20} /> For You
                        </h2>
                    </div>
                    {/* <div className="flex overflow-x-auto gap-4 px-4 pb-6 scrollbar-hide snap-x snap-mandatory">
                        {events.slice(0, 4).map(e => (
                            <div key={e.id} className="snap-center shrink-0 first:pl-0 last:pr-4">
                                <EventCard event={e} recommended={true} />
                            </div>
                        ))}
                    </div> */}
                </div>

                {/* Nearby */}
                <div className="mt-6 mb-20">
                    <div className="flex items-center justify-between px-4 mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 tracking-tight">Nearby Events</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-4">
                        {events.slice(0, visibleCount).map(e => (
                            <EventCard key={e.id} event={e} recommended={false} />
                        ))}
                    </div>
                    <div ref={loadMoreRef} />
                    {visibleCount < events.length && (
                        <p className="text-center text-gray-400 mt-2">Loading more...</p>
                    )}
                    {visibleCount === events.length && (
                        <p className="text-center text-gray-400 mt-2">No more events</p>
                    )}
                </div>
            </main>

            <footer>
                <BottomNavbar />
            </footer>
        </div>
    );
}
