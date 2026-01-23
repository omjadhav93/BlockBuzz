import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";
import { prisma } from "@/prisma/db";
import { requireNoAuth } from "@/lib/auth";

// Zod schema for user registration validation
const registerSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Name must be at least 2 characters long" })
        .max(100, { message: "Name must not exceed 100 characters" }),
    email: z
        .string()
        .email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(100, { message: "Password must not exceed 100 characters" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
    locationCity: z
        .string()
        .min(2, { message: "City name must be at least 2 characters long" })
        .max(100, { message: "City name must not exceed 100 characters" })
        .optional(),
});

export async function POST(request: NextRequest) {
    try {
        // Check if user is already authenticated
        const authError = await requireNoAuth(request);
        if (authError) return authError;

        // Parse request body
        const body = await request.json();

        // Validate input using Zod
        const validationResult = registerSchema.safeParse(body);

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

        const { name, email, password, locationCity } = validationResult.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: "User with this email already exists",
                },
                { status: 409 }
            );
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                locationCity,
            }
        });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "secret", {
            expiresIn: "7d",
        });

        const response = NextResponse.json({ success: true, message: "User registered successfully" }, { status: 200 });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error) {
        console.error("Registration error:", error);

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
