import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/prisma/db";

export async function GET(request: NextRequest) {
    try {
        const { error, userId } = await getAuthUser(request);
        if (error) return error;

        const user = await prisma.user.findUnique({
            where: {
                id: userId!
            },
            select: {
                id: true,
                name: true,
                email: true,
                organizer: {
                    select: {
                        verified: true
                    }
                },
                volunteer: {
                    select: {
                        verified: true
                    }
                },
            }
        })

        const formattedUser = {
            id: user?.id,
            name: user?.name,
            email: user?.email,
            isOrganizer: user?.organizer?.verified || false,
            isVolunteer: user?.volunteer?.verified || false,
        }

        return NextResponse.json(
            {
                success: true,
                message: "User details fetched successfully.",
                user: formattedUser
            },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}