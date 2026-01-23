import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { InteractionType } from "@/prisma/generated/enums";
import { addInteraction } from "@/lib/interaction";

export async function POST(request: NextRequest) {
    try {
        const { error, userId } = await getAuthUser(request);
        if (error) return error;

        const { eventId } = await request.json();

        const savedEvent = await addInteraction(userId!, eventId, InteractionType.SAVE);

        return NextResponse.json({
            success: true,
            message: "Event saved successfully",
            data: savedEvent,
        });
    } catch (error) {
        console.error("Error saving event:", error);
        return NextResponse.json(
            {
                success: false,
                error: error,
                message: "Failed to save event",
            },
            { status: 500 }
        );
    }
}