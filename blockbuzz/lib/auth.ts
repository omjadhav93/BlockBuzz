import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/prisma/db";

// Interface for decoded JWT token
export interface DecodedToken {
    userId: string;
    iat: number;
    exp: number;
}

/**
 * Verifies the JWT token from cookies
 * Returns the decoded token if valid, or null if invalid/missing
 */
export async function verifyToken(request: NextRequest): Promise<DecodedToken | null> {
    try {
        const token = request.cookies.get("token")?.value;
        if (!token) {
            return null;
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "secret"
        ) as DecodedToken;

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            request.cookies.delete("token");
            return null;
        }

        return decoded;
    } catch (error) {
        console.error("Token verification error:", error);
        return null;
    }
}

/**
 * Middleware to require authentication
 * Returns an error response if user is not authenticated
 * Otherwise returns null to continue processing
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
    const decoded = await verifyToken(request);

    if (!decoded) {
        return NextResponse.json(
            {
                success: false,
                error: "Unauthorized",
                message: "You must be logged in to access this resource",
            },
            { status: 401 }
        );
    }

    return null; // Auth successful, continue
}

/**
 * Middleware to require NO authentication (for login/register routes)
 * Returns an error response if user is already authenticated
 * Otherwise returns null to continue processing
 */
export async function requireNoAuth(request: NextRequest): Promise<NextResponse | null> {
    const decoded = await verifyToken(request);

    if (decoded) {
        return NextResponse.json(
            {
                success: false,
                error: "Already authenticated",
                message: "You are already logged in",
            },
            { status: 400 }
        );
    }

    return null; // Not authenticated, continue
}

/**
 * Gets the current user ID from the JWT token
 * Returns the user ID if authenticated, or null otherwise
 */
export async function getCurrentUserId(request: NextRequest): Promise<string | null> {
    const decoded = await verifyToken(request);
    return decoded ? decoded.userId : null;
}

/**
 * Enhanced middleware that returns both auth check and user data
 * This is the RECOMMENDED way to protect routes and get user info
 * 
 * @returns Object with:
 *  - error: NextResponse if auth failed, null if successful
 *  - userId: string if authenticated, null otherwise
 *  - user: DecodedToken if authenticated, null otherwise
 * 
 * @example
 * const { error, userId } = getAuthUser(request);
 * if (error) return error;
 * 
 * // Now use userId safely
 * const data = await prisma.post.findMany({ where: { authorId: userId } });
 */
export async function getAuthUser(request: NextRequest): Promise<{
    error: NextResponse | null;
    userId: string | null;
}> {
    const decoded = await verifyToken(request);

    if (!decoded) {
        return {
            error: NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                    message: "You must be logged in to access this resource",
                },
                { status: 401 }
            ),
            userId: null,
        };
    }

    return {
        error: null,
        userId: decoded.userId,
    };
}

// Get organizer ID and verification status
export async function getOrganizerId(request: NextRequest): Promise<{
    error: NextResponse | null;
    organizerId: string | null;
    verified: boolean | null;
}> {
    const decoded = await verifyToken(request);
    if (!decoded) {
        return {
            error: NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                    message: "You must be logged in to access this resource",
                },
                { status: 401 }
            ),
            organizerId: null,
            verified: null,
        };
    }

    const Organizer = await prisma.organizer.findUnique({
        where: { userId: decoded.userId! },
        select: {
            id: true,
            verified: true,
        },
    });

    if (!Organizer) {
        return {
            error: NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                    message: "You must be an Organizer to access this resource",
                },
                { status: 401 }
            ),
            organizerId: null,
            verified: null,
        };
    }

    return {
        error: null,
        organizerId: Organizer.id,
        verified: Organizer.verified,
    };
}

// Get volunteer ID 
export async function getVolunteerId(request: NextRequest): Promise<{
    error: NextResponse | null;
    volunteerId: string | null;
    verified: boolean | null;
}> {
    const decoded = await verifyToken(request);
    if (!decoded) {
        return {
            error: NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                    message: "You must be logged in to access this resource",
                },
                { status: 401 }
            ),
            volunteerId: null,
            verified: null,
        };
    }

    let Volunteer = await prisma.volunteer.findUnique({
        where: { userId: decoded.userId! },
        select: {
            id: true,
            verified: true,
        },
    });

    if (!Volunteer) {
        Volunteer = await prisma.volunteer.create({
            data: {
                userId: decoded.userId!,
                verified: false,
            },
        });
    }

    return {
        error: null,
        volunteerId: Volunteer.id,
        verified: Volunteer.verified,
    };
}