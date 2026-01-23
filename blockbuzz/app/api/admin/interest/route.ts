import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/prisma/db";

const interestSchema = z.object({
    name: z.string().min(3, { message: "Interest name must be at least 3 characters long" }).max(100, { message: "Interest name must not exceed 100 characters" }),
    main: z.boolean().default(false),
    parentId: z.string().optional().nullable(),
}).refine((data) => {
    if (!data.main && !data.parentId) {
        return false;
    }
    return true;
}, {
    message: "Parent ID is required for non-main interests",
    path: ["parentId"],
});

export async function GET() {
    try {
        const interests = await prisma.interest.findMany();
        return NextResponse.json({
            success: true,
            message: "Interests fetched successfully",
            interests,
        });
    } catch (error) {
        console.error("Error fetching interests:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal Server Error",
                message: "Failed to fetch interests",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const { admin_secret } = body;

        if (admin_secret !== process.env.ADMIN_SECRET) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const validationResult = interestSchema.safeParse(body);

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

        const { name, main, parentId } = validationResult.data;

        const interestExists = await prisma.interest.findUnique({
            where: {
                name,
            },
        });

        if (interestExists) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Interest already exists",
                },
                { status: 400 }
            );
        }

        let interest;

        if (main) {
            interest = await prisma.interest.create({
                data: {
                    name,
                    main
                },
            });
        } else {
            interest = await prisma.interest.create({
                data: {
                    name,
                    parentInterest: {
                        connect: {
                            id: parentId!
                        }
                    }
                },
            });
        }


        return NextResponse.json(
            {
                success: true,
                message: "Interest added successfully",
                data: interest,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Interest add error:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
            },
            { status: 500 }
        );
    }
};