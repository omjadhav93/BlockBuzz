import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/prisma/db";
import { getOrganizerId } from "@/lib/auth";

export async function DELETE(request: NextRequest) {
    const { error, organizerId } = await getOrganizerId(request);
    if (error) return error;

    const eventId = request.nextUrl.searchParams.get("eventId");
    if (!eventId) {
        return NextResponse.json({
            success: false,
            error: "Event ID is required",
            message: "Please provide an event ID"
        }, { status: 400 });
    }
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
        return NextResponse.json({
            success: false,
            error: "Event not found",
            message: "The event you are trying to delete does not exist"
        }, { status: 404 });
    }
    if (event.organizerId !== organizerId) {
        return NextResponse.json({
            success: false,
            error: "You are not authorized to delete this event",
            message: "You do not have permission to delete this event"
        }, { status: 401 });
    }
    if (event.published && !event.cancelled) {
        return NextResponse.json({
            success: false,
            error: "Published Event can't be deleted",
            message: "Published Event should be cancelled first"
        }, { status: 400 });
    }
    await prisma.event.delete({ where: { id: eventId } });
    return NextResponse.json({
        success: true,
        message: "Event deleted successfully"
    }, { status: 200 });
}