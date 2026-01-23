import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getOrganizerId } from "@/lib/auth";
import { prisma } from "@/prisma/db";
import { addInteraction } from "@/lib/interaction";
import { InteractionType } from "@/prisma/generated/enums";

export async function POST(request: NextRequest) {
    try {
        const { error, userId } = await getAuthUser(request);
        const { error: organizerError, organizerId } = await getOrganizerId(request);
        if (error) return error;

        const { eventId } = await request.json();

        // Validate that eventId is provided
        if (!eventId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid input",
                    message: "Event ID is required",
                },
                { status: 400 }
            );
        }

        if (!organizerError) {
            // Validate that the user is not a organizer of same event
            const event = await prisma.event.findUnique({
                where: {
                    id: eventId,
                },
            });

            if (event?.organizerId === organizerId) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "User is not allowed to register for events",
                        message: "Why you are trying to register for your own event?",
                    },
                    { status: 400 }
                );
            }
        }



        // Check if user is already registered for the event
        const existingRegistration = await prisma.eventRegistration.findUnique({
            where: {
                userId_eventId: {
                    userId: userId!,
                    eventId,
                },
            },
        });

        if (existingRegistration) {
            return NextResponse.json(
                {
                    success: false,
                    error: "User already registered for this event",
                    message: "User already registered for this event",
                },
                { status: 400 }
            );
        }

        // Create registration
        const registration = await prisma.eventRegistration.create({
            data: {
                userId: userId!,
                eventId,
            },
        }).then(() => {
            // Add interaction
            return addInteraction(userId!, eventId, InteractionType.REGISTER);
        });

        return NextResponse.json({
            success: true,
            message: "Registration created successfully",
            data: registration,
        });
    } catch (error) {
        console.error("Error creating registration:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal Server Error",
                message: "Failed to create registration",
            },
            { status: 500 }
        );
    }
}