import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const { error, userId } = await getAuthUser(request);
        if (error) return error;

        const userInterests = await prisma.user.findUnique({
            where: {
                id: userId!,
            },
            include: {
                interests: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: "User interests fetched successfully",
            data: userInterests?.interests,
        });
    } catch (error) {
        console.error("Error fetching user interests:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal Server Error",
                message: "Failed to fetch user interests",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { error, userId } = await getAuthUser(request);
        if (error) return error;

        const { interests } = await request.json();
        console.log("interest from backend", interests)

        // Validate that interests is an array
        if (!Array.isArray(interests)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid input",
                    message: "Interests must be an array of interest IDs",
                },
                { status: 400 }
            );
        }


        // Use interactive transaction for atomicity
        const updatedUser = await prisma.$transaction(async (tx) => {
            // Delete existing interests
            const updatedUser = await tx.user.update({
                where: { id: userId! },
                data: {
                    interests: {
                        set: [],
                        connect: interests,
                    },
                },
                include: {
                    interests: true,
                },
            });

            return updatedUser;
        }, {
            maxWait: 10000, // Wait up to 10 seconds to start transaction
            timeout: 20000, // Allow transaction to run for up to 20 seconds
        });

        return NextResponse.json({
            success: true,
            message: "User interests updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user interest:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal Server Error",
                message: "Failed to update user interest",
            },
            { status: 500 }
        );
    }
}