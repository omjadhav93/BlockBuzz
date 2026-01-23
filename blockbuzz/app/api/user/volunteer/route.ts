import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/prisma/db";

export async function GET(request: NextRequest) {
    const { error, userId } = await getAuthUser(request);
    if (error) return error;

    try {
        const volunteer = await prisma.volunteer.findUnique({
            where: { userId: userId! },
            select: {
                bio: true,
                experience: true,
                rating: true,
                verified: true,
                assignments: {
                    select: {
                        event: {
                            select: {
                                id: true,
                                title: true,
                                latitude: true,
                                longitude: true,
                                city: true,
                                venue: true,
                                startTime: true,
                                endTime: true,
                                capacity: true,
                            },
                        },
                        role: true,
                        status: true,
                        assignedAt: true,
                    },
                },
            },
        });

        if (!volunteer) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Volunteer profile not found",
                    message: "The authenticated user has no volunteer profile",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Volunteer profile fetched successfully",
                data: volunteer,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching volunteer profile:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
                message: "An error occurred while fetching the volunteer profile",
            },
            { status: 500 }
        );
    }
}
