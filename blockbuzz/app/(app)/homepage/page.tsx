"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import BottomNavbar from "@/components/app/BottomNavbar";
import { Bell, Search, MapPin, SparklesIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import EventCard from "@/components/app/EventCard";
import { getGreeting } from "@/lib/greet";
import { mockEvents, Event } from "@/mockData/Event-Mock-Data";
import { useUserStore } from "@/app/store/user.store";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";

/* ---------------- TYPES ---------------- */
interface Location {
    lat: number;
    lng: number;
}

const defaultLoc: Location = { lat: 18.5195, lng: 73.8553 };

const fetcher = (url: string) =>
    fetch(url, { credentials: "include" }).then(res => res.json());

/* ================= PAGE ================= */
export default function HomePage() {
    const router = useRouter();
    const user = useUserStore((state) => state.user);

    /* ---------------- SEARCH ---------------- */
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 400);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchBoxRef = useRef<HTMLDivElement | null>(null);

    /* ---------------- LOCATION ---------------- */
    const [center] = useState<Location>(defaultLoc);
    const [radius] = useState(50);
    const [visibleCount, setVisibleCount] = useState(4);

    /* ---------------- DATA ---------------- */
    const { data } = useSWR(
        `/api/event/nearby?lat=${center.lat}&long=${center.lng}&radius=${radius}`,
        fetcher
    );

    const events: Event[] = data?.events || mockEvents;
    const [recommendations, setRecommendations] = useState<Event[]>([]);
    const [recommendLoading, setRecommendLoading] = useState<boolean>(false);

    const { data: searchData, isLoading: searching } = useSWR(
        debouncedSearch ? `/api/event/search?q=${debouncedSearch}` : null,
        fetcher
    );

    const searchEvents = searchData || [];

    /* ---------------- CLOSE DROPDOWN ON OUTSIDE CLICK ---------------- */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                searchBoxRef.current &&
                !searchBoxRef.current.contains(e.target as Node)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    /* ---------------- INFINITE SCROLL ---------------- */
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!loadMoreRef.current) return;

        const getRecommandations = async () => {
            try {
                setRecommendLoading(true);
                const response = await fetch("https://recommendation-model-dczc.onrender.com/api/event/recommend", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        size: 10,
                        latitude: center.lat,
                        longitude: center.lng
                    })
                });
                const data = await response.json();
                console.log("Recommendations:", data);
                if (data.events) {
                    setRecommendations(data.events);
                }
            } catch (error) {
                console.error("Error fetching recommendations:", error);
            } finally {
                setRecommendLoading(false);
            }
        }

        getRecommandations();

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setTimeout(() => {
                        setVisibleCount((prev) =>
                            Math.min(prev + 4, events.length)
                        );
                    }, 600);
                }
            },
            { rootMargin: "200px" }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [events, center.lat, center.lng]);

    if (recommendLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-4 w-4 animate-spin" />
            </div>
        )
    }

    /* ================= UI ================= */
    return (
        <div className="min-w-screen h-screen p-4 space-y-4 overflow-y-scroll">
            {/* ---------- HEADER ---------- */}
            <header className="sticky top-0 z-50 space-y-3 bg-white/70 backdrop-blur-md border-b border-slate-100/50">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                            {getGreeting()}, {user?.name} 👋
                        </span>
                        <h1 className="text-xl font-bold text-slate-900">
                            Discover Events
                        </h1>
                    </div>

                    <div className="w-11 h-11 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm">
                        <Bell size={20} />
                    </div>
                </div>

                {/* ---------- SEARCH WITH DROPDOWN ---------- */}
                <div ref={searchBoxRef} className="relative">
                    <Search
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <Input
                        placeholder="Search events, topics..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowDropdown(true);
                        }}
                        className="pl-11 h-12 bg-slate-100/50 border-none rounded-2xl"
                    />

                    {showDropdown && debouncedSearch && (
                        <div className="absolute top-[110%] left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                            {searching && (
                                <div className="px-4 py-3 text-sm text-slate-400">
                                    Searching…
                                </div>
                            )}

                            {!searching && searchEvents.length > 0 && (
                                searchEvents.slice(0, 5).map((event: any) => (
                                    <button
                                        key={event.id}
                                        onClick={() => {
                                            setSearchQuery(event.title);
                                            setShowDropdown(false);
                                            router.push(`/events?role=${"User"}&eventId=${event.id}`);
                                        }}
                                        className="w-full px-4 py-3 text-left hover:bg-slate-50 transition"
                                    >
                                        <p className="font-semibold text-slate-900">
                                            {event.title}
                                        </p>
                                        <p>{event.city}</p>
                                    </button>
                                ))
                            )}

                            {!searching && searchEvents.length === 0 && (
                                <div className="px-4 py-3 text-sm text-slate-400">
                                    No events found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* ---------- CONTENT ---------- */}
            <main>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FDF2ED] text-[#EF835D] font-semibold text-[11px]">
                    <MapPin size={12} /> Within {radius}km
                </span>

                {/* ---------- FOR YOU ---------- */}
                <div className="mt-8">
                    <div className="flex items-center justify-between px-4 mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 tracking-tight">
                            <SparklesIcon className="text-[#EF835D]" size={20} /> For You
                        </h2>
                    </div>
                    <div className="flex overflow-x-auto gap-4 px-4 pb-6 scrollbar-hide snap-x snap-mandatory">
                        {recommendations.slice(0, 4).map(e => (
                            <div key={e.id} className="snap-center shrink-0 first:pl-0 last:pr-4">
                                <EventCard event={e} recommended={true} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* ---------- NEARBY EVENTS ---------- */}
                <div className="mt-6 mb-20">
                    <h2 className="text-xl font-bold px-4 mb-4">
                        Nearby Events
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-4">
                        {events.slice(0, visibleCount).map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                recommended={false}
                            />
                        ))}
                    </div>

                    <div ref={loadMoreRef} />

                    {visibleCount < events.length && (
                        <p className="text-center text-gray-400 mt-4">
                            Loading more…
                        </p>
                    )}

                    {events.length === 0 && (
                        <p className="text-center text-gray-400 mt-10">
                            No events found 😕
                        </p>
                    )}
                </div>
            </main>

            {/* ---------- FOOTER ---------- */}
            <footer>
                <BottomNavbar />
            </footer>
        </div>
    );
}
