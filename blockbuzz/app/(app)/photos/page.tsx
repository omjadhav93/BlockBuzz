"use client";

import { useState, useEffect } from "react";
import {
    ArrowLeft,
    Plus,
    MapPin,
    Calendar,
    ChevronRight,
    ImageIcon,
    Download, // Replaced Heart with Download
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import BottomNavbar from "@/components/app/BottomNavbar";

const ALBUMS = [
    {
        id: "ev-1",
        title: "Community Clean-up",
        location: "Central Park",
        date: "Oct 12",
        photoCount: 12,
        photos: [
            { url: "https://images.unsplash.com/photo-1558522195-e1201b090344?w=800&q=80", height: "h-64" },
            { url: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80", height: "h-40" },
            { url: "https://images.unsplash.com/photo-1561489413-985b06da5bee?w=800&q=80", height: "h-52" },
            { url: "https://images.unsplash.com/photo-1618477462146-050d2767eac4?w=800&q=80", height: "h-72" },
            { url: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=800&q=80", height: "h-48" },
            { url: "https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=800&q=80", height: "h-60" },
        ]
    },
    {
        id: "ev-2",
        title: "Food Drive 2025",
        location: "Shelter House",
        date: "Nov 05",
        photoCount: 15,
        photos: [
            { url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80", height: "h-40" },
            { url: "https://images.unsplash.com/photo-1594708767771-a7502209ff51?w=800&q=80", height: "h-72" },
            { url: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80", height: "h-60" },
            { url: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80", height: "h-48" },
        ]
    }
];

export default function PhotosPage() {
    const [selectedAlbum, setSelectedAlbum] = useState<typeof ALBUMS[0] | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [selectedAlbum]);

    // Helper function to handle image downloading
    const handleDownload = async (imageUrl: string, filename: string) => {
        setDownloadingId(imageUrl);
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${filename}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed", error);
        } finally {
            setDownloadingId(null);
        }
    };

    // View 1: Pinterest-style Masonry
    if (selectedAlbum) {
        return (
            <div className="bg-white min-h-screen pb-24">
                <header className="p-6 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-30">
                    <button
                        onClick={() => setSelectedAlbum(null)}
                        className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl active:scale-90 transition"
                    >
                        <ArrowLeft size={20} className="text-[#2D3344]" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-lg font-bold text-[#2D3344] leading-tight">{selectedAlbum.title}</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Event Gallery</p>
                    </div>
                    <div className="w-10" />
                </header>

                <main className="px-4">
                    <div className="columns-2 gap-4 [column-fill:_balance]">
                        {selectedAlbum.photos.map((photo, i) => (
                            <div key={`${selectedAlbum.id}-photo-${i}`} className="mb-4 break-inside-avoid">
                                <div className={`relative w-full ${photo.height} rounded-[1.5rem] overflow-hidden shadow-sm group`}>
                                    <Image
                                        src={photo.url}
                                        alt="Gallery"
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="50vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {/* Download Button */}
                                    <button
                                        onClick={() => handleDownload(photo.url, `photo-${selectedAlbum.title}-${i}`)}
                                        disabled={downloadingId === photo.url}
                                        className="absolute bottom-3 right-3 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-[#2D3344] opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                                    >
                                        <Download size={16} className={downloadingId === photo.url ? "animate-bounce" : ""} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
                <BottomNavbar />
            </div>
        );
    }

    // View 2: Folder View
    return (
        <div className="bg-slate-50 min-h-screen pb-32">
            <header className="p-6 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                    <Link href="/profile">
                        <button className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl shadow-sm">
                            <ArrowLeft size={20} />
                        </button>
                    </Link>
                    <h1 className="text-2xl font-bold text-[#2D3344]">Photos</h1>
                </div>
                <button className="w-11 h-11 flex items-center justify-center bg-[#F2EDE4] rounded-2xl active:scale-95 transition">
                    <Plus size={22} className="text-[#2D3344]" />
                </button>
            </header>

            <main className="px-6 space-y-6 pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Albums</p>

                <div className="space-y-8">
                    {ALBUMS.map((event) => (
                        <div key={event.id} className="group cursor-pointer" onClick={() => setSelectedAlbum(event)}>
                            <div className="flex justify-between items-end mb-4 px-1">
                                <div>
                                    <h2 className="text-xl font-bold text-[#2D3344] tracking-tight">{event.title}</h2>
                                    <div className="flex items-center gap-2 text-slate-400 mt-1">
                                        <MapPin size={12} className="text-[#EF835D]" />
                                        <span className="text-[11px] font-semibold tracking-tight">{event.location} • {event.date}</span>
                                    </div>
                                </div>
                                <button className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors hover:bg-blue-100">
                                    View All
                                </button>
                            </div>

                            <div className="bg-white p-3 rounded-[2.5rem] border border-slate-100 shadow-sm relative active:scale-[0.99] transition-transform">
                                <div className="grid grid-cols-3 gap-2">
                                    {event.photos.slice(0, 3).map((photo, index) => (
                                        <div key={`preview-${event.id}-${index}`} className="relative rounded-[1.2rem] overflow-hidden bg-slate-100 aspect-[4/5]">
                                            <Image src={photo.url} alt="Preview" fill className="object-cover" sizes="30vw" />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between mt-4 px-2">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                                <Image src={`https://i.pravatar.cc/100?u=${event.id}${i}`} width={28} height={28} alt="User" />
                                            </div>
                                        ))}
                                        <div className="w-7 h-7 rounded-full border-2 border-white bg-[#F2EDE4] flex items-center justify-center text-[9px] font-bold text-[#2D3344]">
                                            +{event.photoCount - 3}
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-slate-300" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <BottomNavbar />
        </div>
    );
}