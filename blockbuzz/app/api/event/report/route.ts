import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import { z } from "zod";

export async function GET(request: NextRequest) {
    try {
        const eventId = request.nextUrl.searchParams.get("eventId");

        const reports = await prisma.reports.findMany({
            where: {
                eventId: eventId!,
            },
            select: {
                id: true,
                report: true,
                createdAt: true,
                verified: true,
                organizer: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                event: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        startTime: true,
                        endTime: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                reports,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching reports:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { eventId, report } = reportSchema.parse(body);

        const event = await prisma.event.findUnique({
            where: {
                id: eventId,
            },
        });

        if (!event) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Event not found",
                },
                { status: 404 }
            );
        }

        const newReport = await prisma.reports.create({
            data: {
                eventId,
                organizerId: event.organizerId,
                report,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Report added successfully",
                report: newReport,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error adding report:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
            },
            { status: 500 }
        );
    }
}

const reportSchema = z.object({
    eventId: z.string().uuid("Invalid event ID"),
    report: z.string().min(1, "Report cannot be empty").max(500, "Report cannot be longer than 500 characters"),
});