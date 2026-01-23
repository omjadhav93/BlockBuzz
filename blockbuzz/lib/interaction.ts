import { prisma } from "@/prisma/db";
import { InteractionType } from "@/prisma/generated/enums";

const weight = {
    VIEW: 0.1,
    SAVE: 0.4,
    REGISTER: 0.7,
    ATTENDED: 1,
}

export async function addInteraction(userId: string, eventId: string, type: InteractionType) {
    const interaction = await prisma.$transaction(async (tx) => {
        const interaction = await tx.interaction.upsert({
            where: {
                userId_eventId_type: {
                    userId,
                    eventId,
                    type,
                },
            },
            update: {
                cnt: {
                    increment: 1,
                },
            },
            create: {
                userId,
                eventId,
                type,
                cnt: 1,
            },
        });

        await tx.user.update({
            where: {
                id: userId,
            },
            data: {
                engagement_score: {
                    increment: weight[type],
                },
            },
        });

        return interaction;
    });

    return interaction;
}
