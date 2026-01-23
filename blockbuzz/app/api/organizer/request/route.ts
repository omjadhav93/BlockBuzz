import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/prisma/db";

// Request be an organizer.
export async function POST(request: NextRequest) {
    const { error, userId } = await getAuthUser(request);
    if (error) return error;

    const organizer = await prisma.organizer.findUnique({
        where: {
            userId: userId!,
        },
        select: {
            verified: true,
            id: true
        }
    });

    if (organizer) {
        return NextResponse.json({
            success: false,
            error: (organizer?.verified || false) ? "You are already an organizer" : "You have already requested to be an organizer",
        }, { status: 400 });
    }

    const newOrganizer = await prisma.organizer.create({
        data: {
            userId: userId!
        },
        select: {
            verified: true,
            id: true
        }
    });

    return NextResponse.json({
        success: true,
        message: "Request to be an organizer has been submitted successfully",
        verified: newOrganizer?.verified || false,
        organizerId: newOrganizer?.id || null,
    });
}