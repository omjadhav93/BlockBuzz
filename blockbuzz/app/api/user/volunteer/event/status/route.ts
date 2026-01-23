import { NextRequest, NextResponse } from "next/server";
import { getVolunteerId } from "@/lib/auth";
import { prisma } from "@/prisma/db";


export async function GET(request: NextRequest) {
    const { error, volunteerId, verified } = await getVolunteerId(request);
    if (error) return error;
    if (!verified) {
        return NextResponse.json(
            {
                success: false,
                error: "Unauthorized",
                message: "You must be verified to apply for events",
            },
            { status: 401 }
        );
    }


    const applicationId = request.nextUrl.searchParams.get("applicationId");

    if (!applicationId) {
        return NextResponse.json(
            {
                success: false,
                error: "Missing applicationId parameter",
                message: "applicationId query parameter is required",
            },
            { status: 400 }
        );
    }

    const assignment = await prisma.assignment.findFirst({
        where: {
            id: applicationId,
            volunteerId: volunteerId!,
        }
    });

    if (!assignment) {
        return NextResponse.json(
            {
                success: false,
                error: "Assignment not found",
                message: "Assignment not found",
            },
            { status: 404 }
        );
    }

    return NextResponse.json(
        {
            success: true,
            assignment: assignment,
        },
        { status: 200 }
    );
}