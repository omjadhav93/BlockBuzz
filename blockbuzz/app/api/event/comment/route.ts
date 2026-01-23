import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import { getAuthUser } from "@/lib/auth";
import { z } from "zod";

export async function GET(request: NextRequest) {
    try {
        const eventId = request.nextUrl.searchParams.get("eventId");

        const comments = await prisma.comments.findMany({
            where: {
                eventId: eventId!,
            },
        });

        return NextResponse.json(
            {
                success: true,
                comments,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
            },
            { status: 500 }
        );
    }
}

const commentSchema = z.object({
    eventId: z.string().uuid("Invalid event ID"),
    comment: z.string().min(1, "Comment cannot be empty").max(500, "Comment cannot be longer than 500 characters"),
});

export async function POST(request: NextRequest) {
    try {
        const { error, userId } = await getAuthUser(request);
        if (error) return error;

        const body = await request.json();
        const { eventId, comment } = commentSchema.parse(body);

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

        const newComment = await prisma.comments.create({
            data: {
                eventId,
                userId: userId!,
                comment,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Comment added successfully",
                comment: newComment,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error adding comment:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
            },
            { status: 500 }
        );
    }
}