import { prisma } from "@/prisma/db";

type Recommendation = {
    event_id: string;
    score: number;
    explanation: string[],
    debug: string[],
}

type UserDetails = {
    user_id: string,
    latitude: number
    longitude: number,
    interests: string[],
    engagement_score: number
}

// async function computeHostScore(organizerId: string) {
//     const host = await prisma.organizer.findUnique({
//         where: {
//             id: organizerId,
//         }
//     })

//     if (!host) return -1;

//     let score = 0;

//     // experience
//     if (host.totalEvents >= 10) score += 0.4;
//     else if (host.totalEvents >= 5) score += 0.25;
//     else score += 0.1;

//     // // success rate
//     // score += host.rating * 0.3;

//     // verification
//     if (host.verified) score += 0.2;

//     // rating (out of 5)
//     score += (host.rating / 5) * 0.1;

//     return Math.min(score, 1.0);
// }

export const fetchRecommendations = async (userId: UserDetails): Promise<Recommendation[]> => {
    const events = await prisma.event.findMany({
        include: {
            organizer: true,
            interests: true,
        }
    });
    const structuredEvents = await Promise.all(events.map(async (event) => {
        return {
            event_id: event.id,
            latitude: event.latitude,
            longitude: event.longitude,
            category: event.interests.map((interest) => interest.name),
            start_time: event.startTime?.toDateString(),
            host_score: event.organizer.host_score,
            trust_score: event.organizer.trust_score
        }
    }));
    const recommendations = await fetch("http://localhost:8000/api/recommend", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userId}`,
        },
        body: JSON.stringify({
            user: userId,
            events: structuredEvents,
        })
    })
    const result = await recommendations.json();
    return result.results;
};
