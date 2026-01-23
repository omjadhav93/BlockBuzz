import { NextRequest, NextResponse } from "next/server";
import { getOrganizerId, getVolunteerId } from "@/lib/auth";
import { prisma } from "@/prisma/db";
import { VolunteerRole, AssignmentStatus } from "@/prisma/generated/enums";
import { z } from "zod";

const volunteerAssignmentSchema = z.object({
    eventId: z.string().uuid({ message: "Invalid event ID" }),
    role: z.enum(VolunteerRole, { message: "Invalid role" }),
    other_role: z.string().min(2, { message: "Other role must be at least 2 characters" }).optional().nullable(),
})

export async function POST(request: NextRequest) {
    const { error, volunteerId, verified } = await getVolunteerId(request);
    const { error: organizerError, organizerId } = await getOrganizerId(request);
    if (error) return error;
    if (!verified) {
        return NextResponse.json(
            {
                success: false,
                error: "Unauthorized",
                message: "You must be verified to apply for events",
            },
            { status: 401 }
        );
    }

    const body = await request.json();
    const { eventId, role, other_role } = volunteerAssignmentSchema.parse(body);
    if (!eventId) {
        return NextResponse.json(
            {
                success: false,
                error: "Missing event ID",
                message: "Event ID is required",
            },
            { status: 400 }
        );
    }

    const event = await prisma.event.findUnique({
        where: { id: eventId },
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

    if (!organizerError && event.organizerId === organizerId) {
        return NextResponse.json(
            {
                success: false,
                error: "You can't apply for this event",
                message: "Why are you trying to apply for your own event?",
            },
            { status: 401 }
        );
    }

    const assignment = await prisma.assignment.create({
        data: {
            volunteerId: volunteerId!,
            eventId: eventId!,
            role: role!,
            other_role: other_role,
            status: AssignmentStatus.APPLIED,
        },
    });

    return NextResponse.json(
        {
            success: true,
            message: "Event applied successfully",
            assignment: assignment,
        },
        { status: 200 }
    );
}