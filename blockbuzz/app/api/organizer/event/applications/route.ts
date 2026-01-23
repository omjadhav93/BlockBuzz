import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import { getOrganizerId } from "@/lib/auth";
import { AssignmentStatus } from "@/prisma/generated/enums";
import z from "zod";

export async function GET(request: NextRequest) {
    try {
        const { error, organizerId } = await getOrganizerId(request);
        if (error) return error;

        const eventId = request.nextUrl.searchParams.get("eventId") as string;

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

        if (event.organizerId !== organizerId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const applications = await prisma.assignment.findMany({
            where: {
                eventId: eventId,
            },
            include: {
                volunteer: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        bio: true,
                        rating: true,
                        verified: true,
                        experience: true,
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

        const formattedApps = applications.map((app) => {
            return {
                id: app.id,
                role: app.role,
                other_role: app.other_role,
                appliedAt: app.appliedAt,
                status: app.status,
                volunteer: {
                    id: app.volunteer.user.id,
                    name: app.volunteer.user.name,
                    email: app.volunteer.user.email,
                    bio: app.volunteer.bio,
                    rating: app.volunteer.rating,
                    verified: app.volunteer.verified,
                    experience: app.volunteer.experience,
                },
                event: {
                    id: app.event.id,
                    title: app.event.title,
                    description: app.event.description,
                    startTime: app.event.startTime,
                    endTime: app.event.endTime,
                },
            };
        });

        const pendingApps = formattedApps.filter((app) => app.status === AssignmentStatus.APPLIED);
        const acceptedApps = formattedApps.filter((app) => app.status === AssignmentStatus.APPROVED);
        const rejectedApps = formattedApps.filter((app) => app.status === AssignmentStatus.REJECTED);

        const requirements = await prisma.volunteerRequirement.findMany({
            where: {
                eventId: eventId,
            },
        });

        return NextResponse.json(
            {
                success: true,
                applications: {
                    pending: pendingApps,
                    accepted: acceptedApps,
                    rejected: rejectedApps,
                },
                requirements
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching applications:", error);
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

const applicationSchema = z.object({
    assignmentId: z.string(),
    status: z.enum([AssignmentStatus.APPROVED, AssignmentStatus.REJECTED]),
    feedback: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const { error, organizerId } = await getOrganizerId(request);
        if (error) return error;

        const body = await request.json();
        const result = applicationSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: result.error,
                    message: "Invalid request body",
                },
                { status: 400 }
            );
        }
        const { assignmentId, status, feedback } = result.data;

        const assignment = await prisma.assignment.findUnique({
            where: {
                id: assignmentId,
            },
            include: {
                event: {
                    select: {
                        organizerId: true,
                    },
                },
            },
        });

        if (!assignment) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Assignment not found",
                },
                { status: 404 }
            );
        }

        if (assignment.event.organizerId !== organizerId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const updatedAssignment = await prisma.assignment.update({
            where: {
                id: assignmentId,
            },
            data: {
                status: status as AssignmentStatus,
                feedback,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Application updated successfully",
                assignment: updatedAssignment,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating application:", error);
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