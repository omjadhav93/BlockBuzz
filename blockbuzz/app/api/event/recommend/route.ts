import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import { getAuthUser } from "@/lib/auth";
import { fetchRecommendations } from "@/lib/recommand";

export async function POST(request: NextRequest) {
    const { error, userId } = await getAuthUser(request);
    if (error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { latitude, longitude } = await request.json();
    if (!latitude || !longitude) {
        return NextResponse.json({ error: "Missing latitude or longitude" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId!,
        },
        include: {
            interests: true,
        }
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userDetails = {
        user_id: userId!,
        latitude: latitude,
        longitude: longitude,
        interests: user.interests.map((interest) => interest.name),
        engagement_score: user.engagement_score,
    }

    const recommandations = await fetchRecommendations(userDetails);
    const eventIds = recommandations.map((r) => r.event_id);

    const events = await prisma.event.findMany({
        where: {
            id: { in: eventIds },
        },
    });

    const eventMap = new Map(events.map(event => [event.id, event]));

    const orderedEvents = eventIds
        .map(id => eventMap.get(id))
        .filter(Boolean);

    return NextResponse.json(orderedEvents);
}
