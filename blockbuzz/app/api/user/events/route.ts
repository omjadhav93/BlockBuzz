import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const { error, userId } = await getAuthUser(request);
    if (error) return error;

    try {
        const events = await prisma.eventRegistration.findMany({
            where: {
                userId: userId!,
                event: {
                    startTime: {
                        gte: new Date()
                    }
                }
            },
            include: {
                event: true
            }
        });

        const formattedEvents = {
            "Attended": events.filter((event) => event.status === "ATTENDED").map((event) => event.event),
            "Upcoming": events.filter((event) => event.status === "REGISTERED").map((event) => event.event),
        }

        return NextResponse.json({
            success: true,
            events: formattedEvents
        });
    } catch (error) {
        console.error("Error fetching user events:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
                message: "An error occurred while fetching the user events",
            },
            { status: 500 }
        );
    }
}
