import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/prisma/db";
import { getOrganizerId } from "@/lib/auth";

// Zod schema for event cancellation validation
const eventCancelSchema = z.object({
    eventId: z.string().uuid({ message: "Valid event ID is required" }),
    cancellationReason: z
        .string()
        .min(10, { message: "Cancellation reason must be at least 10 characters long" })
        .max(500, { message: "Cancellation reason must not exceed 500 characters" }),
});

export async function POST(request: NextRequest) {
    try {
        // Check authentication and get organizer ID
        const { error, organizerId } = await getOrganizerId(request);
        if (error) return error;

        // Parse request body
        const body = await request.json();

        // Validate input using Zod
        const validationResult = eventCancelSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Validation failed",
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const { eventId, cancellationReason } = validationResult.data;

        // Check if the event exists and belongs to this organizer
        const existingEvent = await prisma.event.findUnique({
            where: { id: eventId! },
            select: {
                organizerId: true,
                published: true,
                cancelled: true,
                startTime: true,
            },
        });

        if (!existingEvent) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Event not found",
                    message: "The event you are trying to cancel does not exist",
                },
                { status: 404 }
            );
        }

        // Check ownership
        if (existingEvent.organizerId !== organizerId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Forbidden",
                    message: "You do not have permission to cancel this event",
                },
                { status: 403 }
            );
        }

        // Check if event is already cancelled
        if (existingEvent.cancelled) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Event Already Cancelled",
                    message: "This event has already been cancelled",
                },
                { status: 400 }
            );
        }

        // Check if event is published
        if (!existingEvent.published) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Event Not Published",
                    message: "Only published events can be cancelled. You can delete unpublished events instead.",
                },
                { status: 400 }
            );
        }

        // Cancel the event
        const cancelledEvent = await prisma.$transaction(async (tx) => {
            const event = await tx.event.update({
                where: { id: eventId! },
                data: {
                    cancelled: true,
                    cancelledAt: new Date(),
                    cancellationReason,
                },
            });

            const organizer = await tx.organizer.update({
                where: { id: organizerId! },
                data: {
                    totalEvents: {
                        decrement: 1,
                    },
                },
            });

            if (organizer.totalEvents === 19) {
                await tx.organizer.update({
                    where: { id: organizerId! },
                    data: {
                        host_score: {
                            decrement: 0.25,
                        },
                    },
                });
            } else if (organizer.totalEvents === 4) {
                await tx.organizer.update({
                    where: { id: organizerId! },
                    data: {
                        host_score: {
                            decrement: 0.5,
                        },
                    },
                });
            }

            return event;
        });


        return NextResponse.json(
            {
                success: true,
                message: "Event cancelled successfully",
                data: {
                    id: cancelledEvent.id,
                    cancelled: cancelledEvent.cancelled,
                    cancelledAt: cancelledEvent.cancelledAt,
                    cancellationReason: cancelledEvent.cancellationReason,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Event cancel error:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error occurred",
            },
            { status: 500 }
        );
    }
}
