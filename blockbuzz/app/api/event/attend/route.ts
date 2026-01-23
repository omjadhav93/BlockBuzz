import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/prisma/db";
import { addInteraction } from "@/lib/interaction";
import { InteractionType, RegistrationStatus } from "@/prisma/generated/enums";

export async function POST(request: NextRequest) {
    try {
        const { error, userId } = await getAuthUser(request);
        if (error) return error;

        const { eventId } = await request.json();

        const attendedEvent = await prisma.eventRegistration.update({
            where: {
                userId_eventId: {
                    userId: userId!,
                    eventId: eventId!,
                },
            },
            data: {
                status: RegistrationStatus.ATTENDED,
            },
            select: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                    }
                },
                status: true,
            }
        }).then(async () => {
            return await addInteraction(userId!, eventId!, InteractionType.ATTENDED);
        });

        return NextResponse.json({
            success: true,
            message: "Event attended successfully",
            data: attendedEvent,
        });
    } catch (error) {
        console.error("Error attending event:", error);
        return NextResponse.json(
            {
                success: false,
                error: error,
                message: "Failed to attend event",
            },
            { status: 500 }
        );
    }
}
