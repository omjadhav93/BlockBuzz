"use client";
import React from 'react';
import { Home, Map, Camera, User, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/app/store/user.store';

const BottomNavbar = () => {
    const pathname = usePathname();
    const { user } = useUserStore();

    const isHost = user?.isOrganizer || true;

    // Helper function to check if a link is active
    const isActive = (path: string) => pathname === path;

    const navItemClasses = (active: boolean) =>
        `flex flex-col items-center gap-1 group transition-all duration-300 ${active ? "text-[#EF835D]" : "text-slate-400"
        }`;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-100">

            {/* Home Section */}
            <Link href="/homepage" className={navItemClasses(isActive('/homepage'))}>
                <Home size={24} strokeWidth={isActive('/homepage') ? 2.5 : 2} />
                <span className={`text-xs ${isActive('/homepage') ? "font-semibold" : "font-medium"}`}>
                    Home
                </span>
            </Link>

            {/* Map Section */}
            <Link href="/maps" className={navItemClasses(isActive('/maps'))}>
                <Map size={24} strokeWidth={isActive('/maps') ? 2.5 : 2} />
                <span className={`text-xs ${isActive('/maps') ? "font-semibold" : "font-medium"}`}>
                    Maps
                </span>
            </Link>

            {/* Center Floating Action Button (FAB) */}
            <div className="relative -mt-12 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#EF835D] rounded-full blur-xl opacity-20 scale-150"></div>
                <Link href={isHost ? "/create-event" : "/profile/host"}>
                    <button className="relative bg-[#EF835D] p-4 rounded-full text-white shadow-lg shadow-orange-200 active:scale-90 transition-transform hover:bg-[#d9724a]">
                        <Plus size={32} strokeWidth={3} />
                    </button>
                </Link>
            </div>

            {/* Photos Section */}
            <Link href="/photos" className={navItemClasses(isActive('/photos'))}>
                <Camera size={24} strokeWidth={isActive('/photos') ? 2.5 : 2} />
                <span className={`text-xs ${isActive('/photos') ? "font-semibold" : "font-medium"}`}>
                    Photos
                </span>
            </Link>

            {/* Profile Section */}
            <Link href="/profile" className={navItemClasses(isActive('/profile'))}>
                <User size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
                <span className={`text-xs ${isActive('/profile') ? "font-semibold" : "font-medium"}`}>
                    Profile
                </span>
            </Link>

        </div>
    );
};

export default BottomNavbar;