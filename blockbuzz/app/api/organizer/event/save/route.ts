import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/prisma/db";
import { getOrganizerId } from "@/lib/auth";
import { VolunteerRole, VenueType } from "@/prisma/generated/enums";

// Zod schema for event save validation
const eventSaveSchema = z.object({
    id: z.string().uuid().optional(), // Optional, used for updates
    title: z
        .string()
        .min(3, { message: "Title must be at least 3 characters long" })
        .max(200, { message: "Title must not exceed 200 characters" }),
    description: z
        .string()
        .max(5000, { message: "Description must not exceed 5000 characters" })
        .min(100, { message: "Description must not be less than 100 characters" })
        .optional()
        .nullable(),
    city: z
        .string()
        .max(100, { message: "City must not exceed 100 characters" })
        .min(3, { message: "City must not be less than 3 characters" })
        .optional()
        .nullable(),
    venue: z
        .string()
        .max(300, { message: "Venue must not exceed 300 characters" })
        .min(3, { message: "Venue must not be less than 3 characters" })
        .optional()
        .nullable(),
    venue_type: z
        .enum(VenueType, { message: "Venue type must be either INDOOR or OUTDOOR" })
        .optional()
        .nullable(),
    latitude: z
        .number()
        .min(-90, { message: "Latitude must be between -90 and 90" })
        .max(90, { message: "Latitude must be between -90 and 90" })
        .optional()
        .nullable(),
    longitude: z
        .number()
        .min(-180, { message: "Longitude must be between -180 and 180" })
        .max(180, { message: "Longitude must be between -180 and 180" })
        .optional()
        .nullable(),
    startTime: z
        .string()
        .datetime({ message: "Invalid start time format" })
        .optional()
        .nullable()
        .transform(val => val ? new Date(val) : null),
    endTime: z
        .string()
        .datetime({ message: "Invalid end time format" })
        .optional()
        .nullable()
        .transform(val => val ? new Date(val) : null),
    capacity: z
        .number()
        .int({ message: "Capacity must be an integer" })
        .positive({ message: "Capacity must be a positive number" })
        .optional()
        .nullable(),
    interests: z
        .array(z.string().uuid({ message: "Invalid interest ID" }))
        .optional()
        .default([]),
    volunteerRequirements: z
        .array(z.object({
            eventId: z.string().uuid({ message: "Invalid event ID" }),
            role: z.enum(VolunteerRole, { message: "Invalid role" }),
            other_role: z.string().min(2, { message: "Other role must not be less than 2 characters" }).optional().nullable(),
            requiredCount: z.number().int({ message: "Required count must be an integer" }).positive({ message: "Required count must be a positive number" }),
            skills: z.array(z.string().min(1, { message: "Skill must not be less than 1 characters" })).optional().default([]),
            description: z.string().min(5, { message: "Description must not be less than 5 characters" }).optional().nullable(),
        }))
        .optional()
        .default([]),
}).refine(
    (data) => {
        // Validate that endTime is after startTime if both are provided
        if (data.startTime && data.endTime) {
            return data.endTime > data.startTime;
        }
        return true;
    },
    {
        message: "End time must be after start time",
        path: ["endTime"],
    }
);

export async function POST(request: NextRequest) {
    try {
        // Check authentication and get organizer ID
        const { error, organizerId } = await getOrganizerId(request);
        if (error) return error;

        // Parse request body
        const body = await request.json();

        // Validate input using Zod
        const validationResult = eventSaveSchema.safeParse(body);

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

        const { id, title, description, city, venue, venue_type, latitude, longitude, startTime, endTime, capacity, interests, volunteerRequirements } = validationResult.data;

        // If id is provided, update existing event
        if (id) {
            // First, check if the event exists and belongs to this organizer
            const existingEvent = await prisma.event.findUnique({
                where: { id },
                select: { organizerId: true },
            });

            if (!existingEvent) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Event not found",
                        message: "The event you are trying to update does not exist",
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
                        message: "You do not have permission to update this event",
                    },
                    { status: 403 }
                );
            }

            // Update the event and its interests in a transaction
            const updatedEvent = await prisma.$transaction(async (tx) => {
                // Update event details and interests
                const event = await tx.event.update({
                    where: { id },
                    data: {
                        title,
                        description,
                        city,
                        venue,
                        venue_type,
                        latitude,
                        longitude,
                        startTime,
                        endTime,
                        capacity,
                        // Update interests using direct relation
                        interests: {
                            set: [], // First disconnect all
                            connect: interests && interests.length > 0
                                ? interests.map((interestId: string) => ({ id: interestId }))
                                : [],
                        },
                    }
                });

                for (const req of volunteerRequirements) {
                    await tx.volunteerRequirement.upsert({
                        where: {
                            eventId_role: {
                                eventId: event.id,
                                role: req.role
                            }
                        },
                        update: {
                            role: req.role,
                            other_role: req.other_role,
                            requiredCount: req.requiredCount,
                            skills: req.skills,
                            description: req.description,
                        },
                        create: {
                            eventId: event.id,
                            role: req.role,
                            other_role: req.other_role,
                            requiredCount: req.requiredCount,
                            skills: req.skills,
                            description: req.description,
                        }
                    });
                }

                const updatedEvent = await tx.event.findUnique({
                    where: { id: event.id },
                    include: {
                        interests: true,
                        volunteerRequirements: true,
                    }
                });

                return updatedEvent;
            }, {
                maxWait: 10000,
                timeout: 20000,
            });

            return NextResponse.json(
                {
                    success: true,
                    message: "Event updated successfully",
                    data: updatedEvent,
                },
                { status: 200 }
            );
        } else {
            // Create new event with interests in a transaction
            const newEvent = await prisma.$transaction(async (tx) => {
                // Create event with interests
                const event = await tx.event.create({
                    data: {
                        title,
                        description,
                        city,
                        venue,
                        venue_type,
                        latitude,
                        longitude,
                        startTime,
                        endTime,
                        capacity,
                        organizerId: organizerId!,
                        // Connect interests using direct relation
                        interests: {
                            connect: interests && interests.length > 0
                                ? interests.map((interestId: string) => ({ id: interestId }))
                                : [],
                        },
                    },
                });

                for (const req of volunteerRequirements) {
                    await tx.volunteerRequirement.create({
                        data: {
                            eventId: event.id,
                            role: req.role,
                            other_role: req.other_role,
                            requiredCount: req.requiredCount,
                            skills: req.skills,
                            description: req.description,
                        },
                    });
                }

                const newEvent = await tx.event.findUnique({
                    where: { id: event.id },
                    include: {
                        interests: true,
                        volunteerRequirements: true,
                    },
                });

                return newEvent;
            }, {
                maxWait: 10000,
                timeout: 20000,
            });

            return NextResponse.json(
                {
                    success: true,
                    message: "Event created successfully",
                    data: newEvent,
                },
                { status: 201 }
            );
        }
    } catch (error) {
        console.error("Event save error:", error);

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
