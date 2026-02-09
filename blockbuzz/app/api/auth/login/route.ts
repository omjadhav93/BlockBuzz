import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "@/prisma/db";
import jwt from "jsonwebtoken";
import { requireNoAuth } from "@/lib/auth";

// Zod schema for user login validation
const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

export async function POST(request: NextRequest) {
    // Check if user is already authenticated
    const authError = await requireNoAuth(request);
    if (authError) return authError;

    // Parse request body
    const body = await request.json();

    // Validate input using Zod
    const validationResult = loginSchema.safeParse(body);

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

    const { email, password } = validationResult.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
        return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "secret", {
        expiresIn: "7d",
    });

    const response = NextResponse.json({ success: true, message: "Login successful" }, { status: 200 });

    response.cookies.set("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
}
