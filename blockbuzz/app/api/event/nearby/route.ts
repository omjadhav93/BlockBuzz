import { NextResponse } from "next/server";
import { prisma } from "@/prisma/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const lat = Number(searchParams.get("lat"));
        const lng = Number(searchParams.get("long"));
        const radiusKm = Number(searchParams.get("radius")) || 50;

        if (isNaN(lat) || isNaN(lng)) {
            return NextResponse.json(
                { error: "Latitude and longitude are required" },
                { status: 400 }
            );
        }

        const events = await prisma.$queryRaw<
            {
                id: string;
                title: string;
                latitude: number;
                longitude: number;
                startTime: string;
                distance: number;
                live: boolean;
            }[]
        >`
            SELECT
            id,
            title,
            latitude,
            longitude,
            "startTime",
            CASE
                WHEN "startTime" <= CURRENT_TIMESTAMP
                AND "endTime" >= CURRENT_TIMESTAMP
                THEN TRUE
                ELSE FALSE
            END AS live,
            (
                6371 * acos(
                cos(radians(${lat}))
                * cos(radians(latitude))
                * cos(radians(longitude) - radians(${lng}))
                + sin(radians(${lat}))
                * sin(radians(latitude))
                )
            ) AS distance
            FROM "Event"
            WHERE
            published = true
            AND cancelled = false
            AND latitude IS NOT NULL
            AND longitude IS NOT NULL
            AND "endTime" > CURRENT_TIMESTAMP
            AND (
                6371 * acos(
                cos(radians(${lat}))
                * cos(radians(latitude))
                * cos(radians(longitude) - radians(${lng}))
                + sin(radians(${lat}))
                * sin(radians(latitude))
                )
            ) <= ${radiusKm}
            ORDER BY distance ASC;
        `;

        const date = new Date();

        const formattedEvents = events.map((event) => {
            const startTime = new Date(event.startTime);
            const daysLeft = startTime > date ? Math.floor((startTime.getTime() - date.getTime()) / 1000 / 60 / 60 / 24) : 0;
            let res = "";
            if (daysLeft == 0) res = "Today";
            else if (daysLeft == 1) res = "Tomorrow";
            else if (daysLeft > 1) res = `${daysLeft} days left`;
            return {
                ...event,
                days: daysLeft,
                daysLeft: res,
            };
        }).sort((a, b) => a.days - b.days);

        return NextResponse.json({
            success: true,
            message: "Nearby events fetched successfully",
            events: formattedEvents,
        });
    } catch (error) {
        console.error("Error fetching nearby events:", error);
        return NextResponse.json(
            { error: "Failed to fetch nearby events", message: error },
            { status: 500 }
        );
    }
}
