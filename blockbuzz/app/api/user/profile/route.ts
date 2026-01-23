import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import { getAuthUser } from "@/lib/auth";

/**
 * GET /api/user/profile
 * Retrieves the authenticated user's profile information
 * Requires JWT authentication via cookies
 */
export async function GET(request: NextRequest) {
    // Verify authentication and get user ID
    const { error, userId } = await getAuthUser(request);
    if (error) return error;

    try {
        // Fetch user profile with related data
        const user = await prisma.user.findUnique({
            where: { id: userId! },
            select: {
                id: true,
                name: true,
                email: true,
                locationCity: true,
                interests: {
                    select: {
                        name: true
                    }
                },
                organizer: {
                    select: {
                        verified: true,
                        rating: true,
                        totalEvents: true,
                    },
                },
                volunteer: {
                    select: {
                        bio: true,
                        experience: true,
                        rating: true,
                        verified: true,
                    },
                },
                _count: {
                    select: {
                        registrations: true
                    }
                }
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "User not found",
                    message: "The authenticated user no longer exists",
                },
                { status: 404 }
            );
        }

        // Transform the interests data for cleaner response
        const formattedUser = {
            ...user,
            interests: user.interests.map((ui) => ui.name)
        };

        return NextResponse.json(
            {
                success: true,
                user: formattedUser,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
                message: "An error occurred while fetching the user profile",
            },
            { status: 500 }
        );
    }
}
