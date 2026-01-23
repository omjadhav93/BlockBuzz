"use client";

import React, { useState } from "react"; // Added useState
import useSWR from "swr";
import {
    ChevronLeft,
    MapPin,
    Calendar,
    Users,
    Check,
    Edit3,
    Users2,
    Loader2,
    Ticket,
    HandHelping,
    Info,
    QrCode,
    X // Added X for closing the list
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import ShareButton from "@/components/app/ShareButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fetcher = async (url: string) => {
    const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    return res.json();
};

export default function EventDetailPage() {
    const router = useRouter();
    const params = useSearchParams();
    const role = params.get("role");
    const eventId = params.get("eventId");

    // State to toggle Volunteer List visibility
    const [showVolunteers, setShowVolunteers] = useState(false);
    const [showPendingVolunteers, setShowPendingVolunteers] = useState(false);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [loadingRegister, setLoadingRegister] = useState(false)


    const { data, isLoading } = useSWR(
        `/api/event/view?eventId=${eventId}&role=${role}`,
        fetcher
    );

    const event = data?.data;

    let VolunteerData;
    let VolunteerLoading;
    if (role === "Organizer") {
        const { data: VolunteerData, isLoading: VolunteerLoading } = useSWR(
            `/api/organizer/event/applications?eventId=${eventId}`,
            fetcher
        );
    }


    const volunteerData = VolunteerData?.applications.accepted || [];
    const pendingVolunteerData = VolunteerData?.applications.pending || [];

    const isPageLoading = isLoading || (role === "Organizer" && VolunteerLoading);

    if (isPageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-lg font-bold">
                <Loader2 className="w-4 h-4 animate-spin" />
            </div>
        );
    }

    const handleVolunteerRequest = async (volunteerId: string, action: string) => {
        try {
            const response = await fetch(`/api/organizer/event/applications`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    assignmentId: volunteerId,
                    status: action
                })
            })

            const result = await response.json();
            if (!result.success) {
                alert("Error in adding volunteer", result.error);
            } else {
                alert("Volunteer added successfully");
                router.refresh();
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleRegisterToVolunteer = async () => {
        try {
            const res = await fetch(`/api/event/register`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    eventId
                })
            })

            const result = await res.json();
            if (!result.success) {
                alert("Error in registering to event", result.error);
            } else {
                alert("Registered successfully");
                router.refresh();
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="bg-[#FCFBFA] min-h-screen pb-32 font-sans relative">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-[#FCFBFA]/80 backdrop-blur-md z-50">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 bg-white border border-slate-100 rounded-full shadow-sm"
                >
                    <ChevronLeft size={20} />
                </button>

                {role === "Organizer" && (
                    <div className="flex gap-2">
                        <div>
                            <ShareButton title={event.title} description={event.description} url={window.location.href} />
                        </div>
                        <button className="p-2 bg-slate-900 text-white rounded-full shadow-lg">
                            <Edit3 size={18} />
                        </button>
                    </div>
                )}
            </header>

            <main className="px-6 pt-2">
                {/* Hero Section */}
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-[#EF835D]/10 text-[#EF835D] text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                            {event?.interests?.[0] || "Event"}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-500">
                            <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                            Active
                        </span>
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 leading-tight mb-4">
                        {event.title}
                    </h1>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        {event.description}
                    </p>
                </section>

                {/* Stats */}
                <section className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-[#EF835D] p-5 rounded-[2.5rem] text-white shadow-xl shadow-[#EF835D]/20 relative overflow-hidden">
                        <Users2 className="absolute -right-2 -bottom-2 opacity-10 w-20 h-20" />
                        <p className="text-sm font-bold opacity-80 mb-1">Registrations</p>
                        <p className="text-3xl font-black">{event.count || 0}</p>
                        <p className="text-[10px] opacity-70 mt-2 italic">Goal: {event.capacity}</p>
                    </div>

                    <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <p className="text-sm font-bold text-slate-400 mb-1">Days Left</p>
                        <p className="text-3xl font-black text-slate-900">{event.daysLeft || 0}</p>
                    </div>
                </section>

                {/* Metadata */}
                <section className="space-y-3 mb-8">
                    <MetaTile
                        icon={<Calendar />}
                        title="Event Date"
                        value={new Date(event.startTime).toLocaleDateString("en-US", {
                            month: "long", day: "numeric", year: "numeric",
                        })}
                        color="blue"
                    />
                    <MetaTile
                        icon={<MapPin />}
                        title="Location"
                        value={event.venue}
                        sub={`${event.city} • ${event.venue_type}`}
                        color="purple"
                    />
                </section>

                {/* Organizer tools */}
                {role === "Organizer" && (
                    <>
                        <h2 className="text-lg font-black text-slate-900 mb-4 px-1"> Management Tools </h2>
                        <div className="grid grid-cols-2 gap-3 mb-10">
                            <ControlBtn
                                icon={<Users />}
                                label="Volunteer List"
                                onClick={() => setShowVolunteers(true)}
                            />
                            <ControlBtn
                                icon={<Users />}
                                label="Pending Volunteers"
                                onClick={() => setShowPendingVolunteers(true)}
                            />
                        </div>
                    </>
                )}
            </main>

            {/* Volunteer List Overlay/Modal */}
            {showVolunteers && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-end">
                    <div className="bg-white w-full max-h-[80vh] rounded-t-[3rem] p-8 overflow-y-auto shadow-2xl transition-transform">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900">Volunteers</h2>
                            <button onClick={() => setShowVolunteers(false)} className="p-2 bg-slate-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {volunteerData && volunteerData?.length > 0 ? (
                                volunteerData?.map((vol: any, i: number) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                                            {vol.volunteer.name?.charAt(0) || "V"}
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-800">{vol.volunteer.name}</span><span className="text-xs ml-3 text-slate-500">({vol.role})</span>
                                            <p className="text-xs text-slate-500">{vol.volunteer.email || "Volunteer"}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-400 py-10">No volunteers registered yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Pending Volunteer List Overlay/Modal */}
            {showPendingVolunteers && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end sm:items-center sm:justify-center transition-all">
                    {/* Container: Slides up from bottom on mobile, centers on desktop */}
                    <div className="bg-white w-full sm:max-w-md max-h-[90vh] rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">

                        {/* Grab Handle for Mobile */}
                        <div className="flex justify-center py-4 sm:hidden">
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                        </div>

                        {/* Header: Focused and Clear */}
                        <div className="px-8 pb-4 flex justify-between items-center border-b border-slate-50">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Applicants</h2>
                                <p className="text-[10px] font-bold text-[#EF835D] uppercase tracking-widest">
                                    {pendingVolunteerData?.length || 0} waiting for review
                                </p>
                            </div>
                            <button
                                onClick={() => setShowPendingVolunteers(false)}
                                className="p-2.5 bg-slate-50 text-slate-400 rounded-full active:scale-90 transition-transform"
                            >
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Scrollable List */}
                        <div className="p-6 overflow-y-auto space-y-4">
                            {pendingVolunteerData && pendingVolunteerData.length > 0 ? (
                                pendingVolunteerData.map((vol: any, i: number) => (
                                    <div
                                        key={i}
                                        className="p-4 bg-slate-50/50 border border-slate-100 rounded-[2rem] space-y-4 transition-all active:bg-slate-100/50"
                                    >
                                        {/* Top Row: User Info */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center font-black text-[#EF835D] shadow-sm">
                                                {vol.volunteer.name?.charAt(0) || "V"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 truncate">{vol.volunteer.name}</span>
                                                    <Badge className="bg-[#EF835D]/10 text-[#EF835D] border-none text-[9px] font-black uppercase tracking-tighter hover:bg-[#EF835D]/10 px-2">
                                                        {vol.role}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-slate-400 truncate mt-0.5">{vol.volunteer.email}</p>
                                            </div>
                                        </div>

                                        {/* Bottom Row: Full-width Mobile Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    handleVolunteerRequest(vol.id, "REJECTED")
                                                }}
                                                className="flex-1 h-12 bg-white border border-slate-200 text-red-500 font-bold rounded-xl flex items-center justify-center gap-2 active:bg-red-50 transition-colors">
                                                <X size={18} strokeWidth={3} />
                                                <span className="text-[11px] uppercase tracking-wider">Decline</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleVolunteerRequest(vol.id, "APPROVED")
                                                }}
                                                className="flex-[2] h-12 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-slate-200">
                                                <Check size={18} strokeWidth={3} />
                                                <span className="text-[11px] uppercase tracking-wider">Approve Volunteer</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20">
                                    <Users className="mx-auto text-slate-200 mb-4" size={48} />
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Inbox is empty</p>
                                </div>
                            )}
                        </div>

                        {/* Sticky Footer Action */}
                        <div className="p-6 pt-2 pb-10 sm:pb-6 bg-white border-t border-slate-50">
                            <Button
                                onClick={() => setShowPendingVolunteers(false)}
                                variant="ghost"
                                className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]"
                            >
                                Close Application Manager
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
                {/* {role === "Organizer" && <PrimaryBtn icon={<BarChart3 />} text="View Attendee Analytics" />} */}
                {role === "User" && event.registered ? <PrimaryBtn onClick={() => setShowTicketModal(true)} icon={<Ticket />} text="View Ticket" /> : <PrimaryBtn onClick={handleRegisterToVolunteer} icon={<HandHelping />} text={loadingRegister ? "Registering..." : "Register Now"} />}
                {role === "Volunteer" && <PrimaryBtn icon={<HandHelping />} text="View Assignment" />}
            </div>

            {showTicketModal && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end sm:justify-center animate-in fade-in duration-300">
                    {/* Backdrop - darker for better ticket contrast */}
                    <div
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        onClick={() => setShowTicketModal(false)}
                    />

                    <div className="relative w-full max-w-sm px-4 pb-8 sm:pb-0 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-500">

                        {/* TICKET CARD */}
                        <div className="relative bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">

                            {/* TOP: Event Header */}
                            <div className="pt-10 px-8 pb-6 text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 mb-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#EF835D] animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Verified Entry</span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                                    {event.title}
                                </h2>
                                <div className="flex items-center justify-center gap-4 mt-3">
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Date</p>
                                        <p className="text-xs font-bold text-slate-700">
                                            {new Date(event.startTime).toLocaleString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>

                                    </div>
                                    <div className="w-px h-6 bg-slate-100" />
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Location</p>
                                        <p className="text-xs font-bold text-slate-700">{event.city}</p>
                                    </div>
                                </div>
                            </div>

                            {/* THE "TEAR" LINE (Visual Perforation) */}
                            <div className="relative flex items-center py-2">
                                <div className="absolute left-[-12px] w-6 h-6 bg-slate-950 rounded-full" />
                                <div className="absolute right-[-12px] w-6 h-6 bg-slate-950 rounded-full" />
                                <div className="w-full border-t-2 border-dashed border-slate-100" />
                            </div>

                            {/* MIDDLE: High-Brightness QR Area */}
                            <div className="px-8 py-8 flex flex-col items-center justify-center bg-white">
                                <div className="relative group">
                                    {/* QR Glow Effect */}
                                    <div className="absolute inset-0 bg-[#EF835D]/10 blur-2xl rounded-full group-hover:bg-[#EF835D]/20 transition-all" />

                                    <div className="relative p-5 bg-white rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-slate-50">
                                        <div className="w-48 h-48 flex items-center justify-center relative">
                                            <QrCode size={160} className="text-slate-900" strokeWidth={1} />
                                            {/* Scanning Laser Line */}
                                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#EF835D] shadow-[0_0_15px_#EF835D] animate-scan" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col items-center">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1">Access Code</p>
                                    <div className="px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                                        <code className="text-xs font-black text-slate-600 tracking-widest">
                                            {event.id?.slice(-8).toUpperCase() || "X-992-B2"}
                                        </code>
                                    </div>
                                </div>
                            </div>

                            {/* BOTTOM: Attendee Brief */}
                            <div className="px-8 pb-10">
                                {/* Quick Action Button for Mobile */}
                                <button
                                    onClick={() => setShowTicketModal(false)}
                                    className="w-full mt-6 h-16 rounded-[1.5rem] bg-slate-900 active:bg-slate-800 text-white font-black uppercase tracking-widest text-xs shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    Done
                                </button>
                            </div>
                        </div>

                        {/* Footer Tip */}
                        <div className="mt-6 flex items-center justify-center gap-2 text-white/50 animate-pulse">
                            <Info size={14} />
                            <p className="text-[10px] font-bold uppercase tracking-widest">
                                Screenshot this for offline use
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ---------------------------------- */
/* Helpers                            */
/* ---------------------------------- */

function MetaTile({ icon, title, value, sub, color }: any) {
    const colors = {
        blue: "bg-blue-50 text-blue-500",
        purple: "bg-purple-50 text-purple-500",
    };
    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color as keyof typeof colors]}`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-sm font-bold text-slate-800">{value}</p>
                {sub && <p className="text-xs text-slate-500">{sub}</p>}
            </div>
        </div>
    );
}

function ControlBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="bg-white p-4 rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition active:scale-95"
        >
            <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
            <span className="text-[11px] font-bold text-slate-700">{label}</span>
        </button>
    );
}

function PrimaryBtn({ text, icon, onClick }: { text: string; icon?: React.ReactNode; onClick?: () => void }) {
    return (
        <button onClick={onClick} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3">
            {text} {icon}
        </button>
    );
}