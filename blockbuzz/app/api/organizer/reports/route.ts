import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import { getOrganizerId } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const { error, organizerId } = await getOrganizerId(request);
        if (error) return error;

        const reports = await prisma.reports.findMany({
            where: {
                organizerId: organizerId!,
            },
            select: {
                id: true,
                report: true,
                createdAt: true,
                verified: true,
                organizer: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                event: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        startTime: true,
                        endTime: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                reports,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching reports:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                error: error,
            },
            { status: 500 }
        );
    }
}