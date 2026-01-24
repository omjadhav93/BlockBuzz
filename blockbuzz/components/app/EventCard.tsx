import React from 'react';
import { MapPin, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Event = {
    id: string,
    title: string,
    daysLeft: string,
    distance: number,
    startTime: string,
    // image: string,
}

interface EventProps {
    recommended: boolean,
    event: Event,
}

function formatDate(date: string) {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
    });
}

function formatDistance(distance: number) {
    if (distance < 1) {
        return "<1 km";
    }
    return `${distance.toFixed(2)} km`;
}

const CompactEventCard = ({ recommended, event }: EventProps) => {

    const router = useRouter();

    return (
        /* Reduced max-width and rounded corners for a tighter feel */
        <div onClick={() => router.replace(`/events?role=User&eventId=${event.id}`)} className="w-[340px] bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-100 transition-transform active:scale-[0.98]">

            {/* Reduced Image Height */}
            <div className="relative h-36 w-full">
                <img
                    src="https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?cs=srgb&dl=pexels-teddy-2263436.jpg&fm=jpg"
                    alt="Outdoor Tech Workshop"
                    className="w-full h-full object-cover"
                />

                {/* Scaled Down Badges */}
                {recommended && (
                    <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
                        <div className="flex items-center gap-1 px-2 py-1 bg-[#EF835D] rounded-full">
                            <Sparkles size={12} className="text-white fill-white" />
                            <span className="text-[10px] font-bold text-white uppercase">For you</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Tighter Content Area */}
            <div className="p-3.5 space-y-2">
                <h2 className="text-base font-bold text-[#2D3344] leading-tight line-clamp-1">
                    {event.title}
                </h2>

                {/* Scaled Info Section */}
                <div className="flex items-center gap-3">
                    {!recommended && (
                        <div className="flex items-center gap-1 text-[#8E9AAF]">
                            <MapPin size={14} strokeWidth={2.5} />
                            <span className="text-xs font-semibold">{formatDistance(event.distance)}</span>
                        </div>
                    )}


                    <div className="flex items-center gap-1 text-[#8E9AAF]">
                        <Calendar size={14} strokeWidth={2.5} />
                        <span className="text-xs font-semibold">
                            {event.daysLeft === "Today" ? formatDate(event.startTime) : event.daysLeft === "Tomorrow" ? event.daysLeft + " at " + formatDate(event.startTime) : event.daysLeft}
                        </span>
                    </div>
                </div>

                {/* Secondary Info */}
                <p className="text-[#8E9AAF] text-xs font-medium">
                    2 hours
                </p>
            </div>
        </div>
    );
};

export default CompactEventCard;