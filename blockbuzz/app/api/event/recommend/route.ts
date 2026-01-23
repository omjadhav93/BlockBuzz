import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import { getAuthUser } from "@/lib/auth";
import { fetchRecommendations } from "@/lib/recommand";

export async function POST(request: NextRequest) {
    try {
        const { error, userId } = await getAuthUser(request);
        if (error) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { size, latitude, longitude } = await request.json();
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
            .filter(Boolean).slice(0, size);

        const date = new Date();

        const formattedEvents = orderedEvents.map((event) => {
            const startTime = new Date(event!.startTime!);
            const daysLeft = startTime > date ? Math.floor((startTime.getTime() - date.getTime()) / 1000 / 60 / 60 / 24) : 0;
            let res = "";
            if (daysLeft == 0) res = "Today";
            else if (daysLeft == 1) res = "Tomorrow";
            else if (daysLeft > 1) res = `${daysLeft} days left`;
            return {
                ...event,
                days: daysLeft,
                daysLeft: res,
            };
        })

        return NextResponse.json({
            success: true,
            message: "Recommendations fetched successfully",
            events: formattedEvents
        }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            error: error,
            message: "Internal Server Error"
        }, { status: 500 });
    }
}
