"use client";

import BottomNavbar from "@/components/app/BottomNavbar";
import useSWR from "swr";
import {
    Calendar,
    CircleQuestionMarkIcon,
    ShieldOff,
    HandshakeIcon,
    LogOut,
    Settings,
    Shield,
    UserCog,
    Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import router from "next/router";

/* ---------------------------------- */
/* Options                             */
/* ---------------------------------- */

const options = [
    { title: "Events History", icon: Calendar, Link: "/profile/events" },
    { title: "Volunteer", icon: HandshakeIcon, Link: "/profile/volunteer" },
    { title: "Organizer", icon: UserCog, Link: "/profile/organizer" },
    { title: "Privacy & Security", icon: Shield, Link: "/profile/privacy" },
    {
        title: "Help & Support",
        icon: CircleQuestionMarkIcon,
        Link: "/profile/support",
    },
];

/* ---------------------------------- */
/* Fetcher                             */
/* ---------------------------------- */

const fetcher = async (url: string) => {
    const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch profile");
    }

    return res.json();
};

/* ---------------------------------- */
/* Component                           */
/* ---------------------------------- */

export default function ProfilePage() {
    const { data, error, isLoading, isValidating } = useSWR(
        "/api/user/profile",
        fetcher
    );

    const user = data?.user;

    /* ---------------------------------- */
    /* Guards                             */
    /* ---------------------------------- */

    // if (isLoading) {
    //     return (
    //         <div className="flex items-center justify-center h-[60vh]">
    //             <Loader2 className="w-8 h-8 animate-spin text-[#EF835D]" />
    //         </div>
    //     );
    // }

    // if (error) {
    //     return (
    //         <div className="flex items-center justify-center h-[60vh] text-red-500">
    //             Failed to load profile
    //         </div>
    //     );
    // }

    /* ---------------------------------- */
    /* Derived data                       */
    /* ---------------------------------- */

    const stats = {
        eventsJoined: user?._count?.registrations ?? 0,
        eventsHosted: user?.organizer?.totalEvents ?? 0,
        trustScore: "80%",
    };

    const cards = [
        { title: "Events Joined", value: stats.eventsJoined },
        { title: "Events Hosted", value: stats.eventsHosted },
        { title: "Trust Score", value: stats.trustScore },
    ];

    const isHost = Boolean(user?.organizer?.verified);

    /* ---------------------------------- */
    /* Render                             */
    /* ---------------------------------- */

    const handleLogout = async () => {
        const res = await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Failed to logout");

        localStorage.removeItem("profile-cache");
        router.push("/SignIn");
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-24">
            {/* Header */}
            <header className="p-6 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <h1 className="text-3xl font-bold text-[#2D3344]">Profile</h1>

                <button
                    aria-label="Settings"
                    className="w-12 h-12 flex items-center justify-center bg-[#F2EDE4] rounded-2xl"
                >
                    <Settings size={24} />
                </button>
            </header>

            <main className="px-6">
                {/* Profile Info */}
                <div className="flex items-center gap-4 p-4 mt-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="relative w-20 h-20 shrink-0">
                        <div className="absolute inset-0 rounded-full border-2 border-[#EF835D] border-dashed opacity-20" />
                        <div className="absolute inset-1 rounded-full overflow-hidden border-2 border-white">
                            <Image
                                src="/pfp.jpg"
                                alt="Profile"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-[#2D3344]">
                            {user?.name}
                        </h1>
                        <p className="text-sm text-slate-500">{user?.email}</p>

                        {user?.volunteer?.verified ? (
                            <div className="mt-2 flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 w-fit">
                                <Shield size={12} strokeWidth={3} />
                                <span className="text-[10px] font-bold uppercase">
                                    Verified
                                </span>
                            </div>
                        ) : (
                            <div className="mt-2 flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-lg border border-red-100 w-fit">
                                <ShieldOff size={12} strokeWidth={3} />
                                <span className="text-[10px] font-bold uppercase">
                                    Not Verified
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 p-4 mt-2">
                    {cards.map((card) => (
                        <div
                            key={card.title}
                            className="w-24 h-24 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200"
                        >
                            <h1 className="text-2xl font-bold text-[#2D3344]">
                                {card.value}
                            </h1>
                            <p className="text-xs text-slate-500 text-center">
                                {card.title}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Options */}
                <div className="rounded-[1.5rem] overflow-hidden border border-slate-100 bg-white shadow-sm">
                    {options.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <Link href={item.Link} key={item.title}>
                                <div
                                    className={`flex items-center gap-4 p-4 active:bg-slate-50 transition ${index !== options.length - 1
                                        ? "border-b border-slate-50"
                                        : ""
                                        }`}
                                >
                                    <div className="w-11 h-11 flex items-center justify-center bg-[#F2EDE4] rounded-2xl shrink-0">
                                        <Icon size={22} strokeWidth={2} />
                                    </div>

                                    <h1 className="flex-1 font-semibold text-[#2D3344] tracking-tight">
                                        {item.title}
                                    </h1>

                                    <svg
                                        className="text-slate-300"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <path d="m9 18 6-6-6-6" />
                                    </svg>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Logout */}
                <button onClick={handleLogout} className="flex items-center w-full gap-4 p-4 mt-6 bg-red-100 rounded-xl text-red-400">
                    <div className="w-11 h-11 flex items-center justify-center bg-red-200 rounded-2xl">
                        <LogOut size={22} />
                    </div>
                    <h1 className="font-semibold">Logout</h1>
                </button>

                {isValidating && (
                    <p className="text-xs text-center text-slate-400 mt-4">
                        Syncing profile…
                    </p>
                )}
            </main>

            <BottomNavbar />
        </div>
    );
}
