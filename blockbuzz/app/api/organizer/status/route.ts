import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/prisma/db";

export async function GET(request: NextRequest) {
    const { error, userId } = await getAuthUser(request);
    if (error) return error;

    const Organizer = await prisma.organizer.findUnique({
        where: { userId: userId! },
    });

    if (!Organizer) {
        return NextResponse.json(
            {
                success: false,
                message: "The user is not an organizer",
            },
            { status: 404 }
        );
    }

    return NextResponse.json(
        {
            success: true,
            message: "Organizer verification status",
            verified: Organizer.verified,
        },
        { status: 200 }
    );
}
