import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";

// Accept a volunteer request.
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { admin_secret, userId } = body;

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

    if (!userId) {
        return NextResponse.json(
            {
                success: false,
                error: "Missing user ID",
                message: "userId is required",
            },
            { status: 400 }
        );
    }

    const volunteer = await prisma.volunteer.upsert({
        where: {
            userId: userId!,
        },
        select: {
            id: true,
            verified: true
        },
        update: {
            verified: true,
        },
        create: {
            userId: userId!,
            verified: true,
        }
    });

    return NextResponse.json({
        success: true,
        message: "The user is now a verified volunteer.",
        verified: volunteer?.verified || false,
        volunteerId: volunteer?.id || null,
    });
}