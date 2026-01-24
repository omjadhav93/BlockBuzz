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
                        id: true,
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
                                description: true,
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

        const structedVolunter = volunteer.assignments.map((assignment) => ({
            id: assignment.event.id,
            title: assignment.event.title,
            date: assignment.event.startTime?.getFullYear() + "-" + assignment.event.startTime?.getMonth() + "-" + assignment.event.startTime?.getDate(),
            time: assignment.event.startTime?.getHours() + ":" + assignment.event.startTime?.getMinutes() + " to " + assignment.event.endTime?.getHours() + ":" + assignment.event.endTime?.getMinutes(),
            location: assignment.event.venue + ", " + assignment.event.city,
            role: assignment.role,
            description: assignment.event.description,
            status: assignment.status,
            assignedAt: assignment.assignedAt,
        }))

        const formattedVolunteer = {
            "Upcoming": structedVolunter.filter((assignment) => assignment.status !== "COMPLETED"),
            "Past": structedVolunter.filter((assignment) => assignment.status === "COMPLETED"),
        }

        return NextResponse.json(
            {
                success: true,
                message: "Volunteer profile fetched successfully",
                data: formattedVolunteer,
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
