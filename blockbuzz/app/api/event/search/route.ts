import { prisma } from "@/prisma/db";
import { getEmbedding } from "@/lib/embeddings";

export const runtime = "nodejs";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q) {
        return Response.json({ error: "Query required" }, { status: 400 });
    }

    const queryEmbedding = await getEmbedding(q);

    const events = await prisma.$queryRaw<
        {
            id: string;
            title: string;
            description: string;
            city: string;
            venue: string;
            similarity: number;
        }[]
    >`
    SELECT
      id,
      title,
      description,
      city,
      venue,
      1 - (embedding <=> ${queryEmbedding}::vector) AS similarity
    FROM "Event"
    WHERE
      published = true
      AND cancelled = false
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${queryEmbedding}::vector
    LIMIT 20;
  `;

    return Response.json(events);
}