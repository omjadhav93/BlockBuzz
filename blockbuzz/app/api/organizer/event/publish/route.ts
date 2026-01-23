import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/prisma/db";
import { getOrganizerId } from "@/lib/auth";
import { VolunteerRole, VenueType } from "@/prisma/generated/enums";
import { getEmbedding } from "@/lib/embeddings";

// Zod schema for event publish validation
// All fields (except id) are REQUIRED for publishing
const eventPublishSchema = z.object({
    id: z.string().uuid({ message: "Valid event ID is required" }).optional(), // Optional - if not provided, creates new event
    title: z
        .string()
        .min(3, { message: "Title must be at least 3 characters long" })
        .max(200, { message: "Title must not exceed 200 characters" }),
    description: z
        .string()
        .min(10, { message: "Description must be at least 100 characters long" })
        .max(5000, { message: "Description must not exceed 5000 characters" }),
    city: z
        .string()
        .min(3, { message: "City must be at least 3 characters long" })
        .max(100, { message: "City must not exceed 100 characters" }),
    venue: z
        .string()
        .min(3, { message: "Venue must be at least 3 characters long" })
        .max(300, { message: "Venue must not exceed 300 characters" }),
    venue_type: z
        .enum(VenueType, { message: "Venue type must be either INDOOR or OUTDOOR" }),
    latitude: z
        .number()
        .min(-90, { message: "Latitude must be between -90 and 90" })
        .max(90, { message: "Latitude must be between -90 and 90" }),
    longitude: z
        .number()
        .min(-180, { message: "Longitude must be between -180 and 180" })
        .max(180, { message: "Longitude must be between -180 and 180" }),
    startTime: z
        .string()
        .datetime({ message: "Valid start time is required" })
        .transform(val => new Date(val)),
    endTime: z
        .string()
        .datetime({ message: "Valid end time is required" })
        .transform(val => new Date(val)),
    capacity: z
        .number()
        .int({ message: "Capacity must be an integer" })
        .positive({ message: "Capacity must be a positive number" })
        .min(1, { message: "Capacity must be at least 1" }),
    interests: z
        .array(z.string().uuid({ message: "Invalid interest ID" }))
        .min(1, { message: "At least one interest is required for publishing" }),
    volunteerRequirements: z
        .array(z.object({
            eventId: z.string().uuid({ message: "Invalid event ID" }).optional(),
            role: z.enum(VolunteerRole, { message: "Invalid role" }),
            other_role: z.string().min(2, { message: "Other role must be at least 2 characters" }).optional().nullable(),
            requiredCount: z.number().int({ message: "Required count must be an integer" }).positive({ message: "Required count must be a positive number" }),
            skills: z.array(z.string().min(1, { message: "Skill must not be empty" })).optional().default([]),
            description: z.string().min(5, { message: "Description must be at least 5 characters" }).optional().nullable(),
        }))
        .default([]),
})

export async function POST(request: NextRequest) {
    try {
        // Check authentication and get organizer ID with verification status
        const { error, organizerId, verified } = await getOrganizerId(request);
        if (error) return error;

        // Check if organizer is verified
        if (!verified) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Organizer Not Verified",
                    message: "Only verified organizers can publish events. Please complete your verification process.",
                },
                { status: 403 }
            );
        }

        // Parse request body
        const body = await request.json();

        // Validate input using Zod
        const validationResult = eventPublishSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Validation failed",
                    message: "All event details are required to publish an event",
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const { id, title, description, city, venue, venue_type, latitude, longitude, startTime, endTime, capacity, interests, volunteerRequirements } = validationResult.data;

        // If id is provided, update existing event
        if (id) {
            // Check if the event exists and belongs to this organizer
            const existingEvent = await prisma.event.findUnique({
                where: { id },
                select: {
                    organizerId: true,
                    published: true,
                },
            });

            if (!existingEvent) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Event not found",
                        message: "The event you are trying to publish does not exist",
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
                        message: "You do not have permission to publish this event",
                    },
                    { status: 403 }
                );
            }

            // Check if event is already published
            if (existingEvent.published) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Event Already Published",
                        message: "This event is already published",
                    },
                    { status: 400 }
                );
            }

            const text = `
                ${title}
                ${description}
                ${city}
                ${venue}
                ${interests.join(", ")}
                `;
            const embedding = await getEmbedding(text);
            // Format embedding as PostgreSQL array: [0.1,0.2,0.3]
            const embeddingStr = `[${embedding.join(',')}]`;

            // Update the event with all details and set published to true
            const publishedEvent = await prisma.$transaction(async (tx) => {
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
                        published: true,
                        publishedAt: new Date(),
                        // Update interests using direct relation
                        interests: {
                            set: [], // First disconnect all
                            connect: interests.map((interestId: string) => ({ id: interestId })),
                        },
                    },
                });

                // Update embedding separately using raw SQL (Prisma doesn't support Unsupported types in TypeScript)
                await tx.$executeRaw`
                    UPDATE "Event" 
                    SET embedding = ${embeddingStr}::vector 
                    WHERE id = ${event.id}
                `;

                // Handle volunteer requirements
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

                // Update organizer's totalEvents count
                const organizer = await tx.organizer.update({
                    where: { id: organizerId! },
                    data: {
                        totalEvents: {
                            increment: 1,
                        }
                    },
                    select: {
                        totalEvents: true,
                        host_score: true,
                    }
                });

                if (organizer.totalEvents === 20) {
                    await tx.organizer.update({
                        where: { id: organizerId! },
                        data: {
                            host_score: {
                                increment: 0.15,
                            }
                        }
                    });
                } else if (organizer.totalEvents === 50) {
                    await tx.organizer.update({
                        where: { id: organizerId! },
                        data: {
                            host_score: {
                                increment: 0.25,
                            }
                        }
                    });
                }

                // Return updated event with relations
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

            // Increment totalEvents count for organizer
            await prisma.organizer.update({
                where: { id: organizerId! },
                data: {
                    totalEvents: {
                        increment: 1,
                    },
                },
            });

            return NextResponse.json(
                {
                    success: true,
                    message: "Event published successfully",
                    data: publishedEvent,
                },
                { status: 200 }
            );
        } else {
            // No id provided - create a new event and publish it directly
            const text = `
                ${title}
                ${description}
                ${city}
                ${venue}
                ${interests.join(", ")}
                `;
            const embedding = await getEmbedding(text);
            // Format embedding as PostgreSQL array: [0.1,0.2,0.3]
            const embeddingStr = `[${embedding.join(',')}]`;

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
                        published: true,
                        publishedAt: new Date(),
                        organizerId: organizerId!,
                        // Connect interests using direct relation
                        interests: {
                            connect: interests.map((interestId: string) => ({ id: interestId })),
                        },
                    },
                });

                // Update embedding separately using raw SQL (Prisma doesn't support Unsupported types in TypeScript)
                await tx.$executeRaw`
                    UPDATE "Event" 
                    SET embedding = ${embeddingStr}::vector 
                    WHERE id = ${event.id}
                `;

                // Create volunteer requirements
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

                // Return created event with relations
                const createdEvent = await tx.event.findUnique({
                    where: { id: event.id },
                    include: {
                        interests: true,
                        volunteerRequirements: true,
                    },
                });

                return createdEvent;
            }, {
                maxWait: 10000,
                timeout: 20000,
            });

            // Increment totalEvents count for organizer
            await prisma.organizer.update({
                where: { id: organizerId! },
                data: {
                    totalEvents: {
                        increment: 1,
                    },
                },
            });

            return NextResponse.json(
                {
                    success: true,
                    message: "Event created and published successfully",
                    data: newEvent,
                },
                { status: 201 }
            );
        }
    } catch (error) {
        console.error("Event publish error:", error);

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
