import { NextRequest, NextResponse } from "next/server";
import { getOrganizerId } from "@/lib/auth";
import { prisma } from "@/prisma/db";


export async function GET(request: NextRequest) {
    try {
        const { error, organizerId } = await getOrganizerId(request);
        if (error) return error;

        const events = await prisma.event.findMany({
            where: {
                organizerId: organizerId!,
            },
            select: {
                id: true,
                title: true,
                description: true,
                city: true,
                venue: true,
                venue_type: true,
                latitude: true,
                longitude: true,
                startTime: true,
                endTime: true,
                capacity: true,
                published: true,
                publishedAt: true,
                cancelled: true,
                cancelledAt: true,
                cancellationReason: true,
                interests: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        const formattedEvents = {
            "Upcoming": events.filter((event) => event.published && event.startTime! > new Date()),
            "Past": events.filter((event) => event.published && event.startTime! < new Date()),
            "Draft": events.filter((event) => !event.published),
        }

        return NextResponse.json({
            success: true,
            message: "Events fetched successfully",
            events: formattedEvents,
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal Server Error",
                message: "Failed to fetch events",
            },
            { status: 500 }
        );
    }
}