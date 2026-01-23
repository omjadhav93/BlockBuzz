import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/prisma/db";

export async function GET(request: NextRequest) {
    const { error, userId } = await getAuthUser(request);
    if (error) return error;

    const organizer = await prisma.organizer.findUnique({
        where: {
            userId: userId!,
        },
        select: {
            id: true,
            verified: true,
            user: {
                select: {
                    name: true,
                    email: true,
                    locationCity: true,
                    engagement_score: true,
                }
            },
            events: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    createdAt: true,
                }
            },
            reports: {
                select: {
                    id: true,
                    eventId: true,
                    report: true,
                    verified: true,
                    createdAt: true,
                }
            },
            rating: true,
            totalEvents: true,
            host_score: true,
            trust_score: true,
        }
    });

    if (!organizer) {
        return NextResponse.json({
            success: false,
            error: "The user is not an organizer",
        }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        message: "Organizer profile",
        organizer,
    }, { status: 200 });
}
