import { NextRequest, NextResponse } from "next/server";
import { addInteraction } from "@/lib/interaction";
import { InteractionType } from "@/prisma/generated/enums";
import { prisma } from "@/prisma/db";
import { getAuthUser, getOrganizerId, getVolunteerId } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const eventId = request.nextUrl.searchParams.get("eventId")!;
    const role = request.nextUrl.searchParams.get("role");

    if (!eventId) {
        return NextResponse.json(
            {
                success: false,
                error: "Missing eventId parameter",
                message: "eventId query parameter is required",
            },
            { status: 400 }
        );
    }

    const event = await prisma.event.findUnique({
        where: {
            id: eventId,
        },
        include: {
            interests: true,
            _count: {
                select: {
                    registrations: true,
                }
            }
        }
    });

    if (!event) {
        return NextResponse.json(
            {
                success: false,
                error: "Event not found",
                message: "Event not found",
            },
            { status: 404 }
        );
    }

    const date = new Date();

    const formattedEvent = {
        ...event,
        interests: event.interests.map((interest) => interest.name),
        count: event._count.registrations,
        status: event.startTime! > date ? "Upcoming" : event.endTime! > date ? "Ongoing" : "Past",
        daysLeft: event.startTime! > date ? Math.floor((event.startTime!.getTime() - date.getTime()) / 1000 / 60 / 60 / 24) : 0,
    }

    if (role === "Organizer") {
        const { error, organizerId } = await getOrganizerId(request);
        if (error) return error;

        if (event.organizerId !== organizerId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "You are not authorized to view this event",
                    message: "You are not authorized to view this event",
                },
                { status: 403 }
            );
        }

        const assingments = await prisma.assignment.findMany({
            where: {
                eventId: eventId,
                status: "APPROVED",
            },
            select: {
                role: true,
                other_role: true,
                volunteer: {
                    select: {
                        user: {
                            select: {
                                name: true,
                            }
                        },
                    },
                },
            },
        });

        const OrganizerEvent = {
            ...formattedEvent,
            assignments: assingments.map((ass) => ({
                role: ass.role,
                other_role: ass.other_role,
                volunteer: ass.volunteer.user.name
            }))
        }

        return NextResponse.json({
            success: true,
            message: "Event viewed successfully",
            data: OrganizerEvent,
        });

    } else if (role === "Volunteer") {
        const { error, volunteerId } = await getVolunteerId(request);
        if (error) return error;

        const assignment = await prisma.assignment.findUnique({
            where: {
                volunteerId_eventId: {
                    eventId: eventId,
                    volunteerId: volunteerId!,
                },
            },
            select: {
                role: true,
                other_role: true,
                feedback: true,
            },
        });


        const VolunteerEvent = {
            ...formattedEvent,
            role: assignment?.role,
            other_role: assignment?.other_role,
            feedback: assignment?.feedback
        }

        return NextResponse.json({
            success: true,
            message: "Event viewed successfully",
            data: VolunteerEvent,
        });
    } else if (role === "User") {
        const { error, userId } = await getAuthUser(request);
        if (error) return error;

        const registration = await prisma.eventRegistration.findUnique({
            where: {
                userId_eventId: {
                    eventId: eventId,
                    userId: userId!,
                },
                status: "REGISTERED",
            }
        });

        await addInteraction(userId!, eventId, InteractionType.VIEW);

        const requirement = await prisma.volunteerRequirement.findMany({
            where: {
                eventId: eventId,
            },
        });

        const UserEvent = {
            ...formattedEvent,
            registered: registration ? true : false,
            requirement: requirement,
        }

        return NextResponse.json({
            success: true,
            message: "Event viewed successfully",
            data: UserEvent,
        });
    }


    return NextResponse.json({
        success: true,
        message: "Event viewed successfully",
        data: formattedEvent,
    });

}