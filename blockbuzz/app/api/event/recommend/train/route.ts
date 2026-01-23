import { NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import { exec } from "child_process";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

export async function GET() {
    try {
        // 1. Dump interactions
        const interactions = await prisma.interaction.findMany();

        const itr = interactions.flatMap((interaction) =>
            Array.from({ length: interaction.cnt }, () => ({
                event_id: interaction.eventId,
                user_id: interaction.userId,
                action: interaction.type,
                timestamp: interaction.createdAt,
            }))
        );

        const storageDir = path.join(
            process.cwd(),
            "../",
            "recommendation_system",
            "storage"
        );

        await fs.mkdir(storageDir, { recursive: true });

        await fs.writeFile(
            path.join(storageDir, "interactions.json"),
            JSON.stringify(itr, null, 2),
            "utf-8"
        );

        // 2. Python working directory
        const scriptDir = path.join(
            process.cwd(),
            "../",
            "recommendation_system"
        );

        // 3. Execute Python with correct cwd
        return new Promise((resolve) => {
            exec(
                "python -m learning.run_jobs",
                { cwd: scriptDir }, // ✅ THIS replaces `cd`
                (error, stdout, stderr) => {
                    if (error) {
                        resolve(
                            NextResponse.json(
                                { error: error.message },
                                { status: 500 }
                            )
                        );
                        return;
                    }

                    if (stderr) {
                        resolve(
                            NextResponse.json(
                                { error: stderr },
                                { status: 500 }
                            )
                        );
                        return;
                    }

                    try {
                        resolve(NextResponse.json(JSON.parse(stdout)));
                    } catch {
                        resolve(NextResponse.json({ output: stdout }));
                    }
                }
            );
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}