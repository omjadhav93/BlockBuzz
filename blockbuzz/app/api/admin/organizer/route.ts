import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";

// Accept a organizer request.
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { admin_secret, organizerId } = body;

    if (!admin_secret || admin_secret !== process.env.ADMIN_SECRET) {
        return NextResponse.json(
            {
                success: false,
                error: "Unauthorized",
                message: "Invalid or missing admin secret",
            },
            { status: 401 }
        );
    }

    if (!organizerId) {
        return NextResponse.json(
            {
                success: false,
                error: "Missing organizer ID",
                message: "organizerId is required",
            },
            { status: 400 }
        );
    }

    const organizer = await prisma.organizer.findUnique({
        where: {
            id: organizerId!,
        },
        select: {
            verified: true
        }
    });

    if (!organizer) {
        return NextResponse.json({
            success: false,
            error: "Something wrong with the organizer request. No request found with this ID.",
            verified: false,
        }, { status: 400 });
    }

    if (organizer.verified) {
        return NextResponse.json({
            success: false,
            error: "The request is already accepted.",
            verified: true,
        }, { status: 400 });
    }

    const updatedOrganizer = await prisma.organizer.update({
        where: {
            id: organizerId!
        },
        data: {
            verified: true,
            host_score: 0.3
        },
        select: {
            verified: true
        }
    });

    return NextResponse.json({
        success: true,
        message: "The request has been accepted successfully.",
        verified: updatedOrganizer?.verified || false,
    });
}