import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    // Check if user is authenticated
    const authError = await requireAuth(request);
    if (authError) return authError;

    // Create a response
    const response = NextResponse.json(
        {
            success: true,
            message: "Logout successful"
        },
        { status: 200 }
    );

    // Clear the token cookie by setting it with an expired date
    response.cookies.set("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0, // Expire immediately
    });

    return response;
}
