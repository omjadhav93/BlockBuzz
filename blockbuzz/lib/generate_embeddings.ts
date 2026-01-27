import { prisma } from "../prisma/db.js";
import { getEmbedding } from "./embeddings.js";

async function run() {
  console.log("🔄 Fetching events without embeddings...");

  const events = await prisma.$queryRaw<Array<{
    id: string;
    title: string;
    description: string | null;
    city: string | null;
    venue: string | null;
  }>>`
    SELECT id, title, description, city, venue
    FROM "Event"
    WHERE embedding IS NULL
  `;

  for (const event of events) {
    const eventWithInterests = await prisma.event.findUnique({
      where: { id: event.id },
      include: { interests: true },
    });

    if (!eventWithInterests) continue;

    const text = [
      event.title,
      event.description,
      event.city,
      event.venue,
      eventWithInterests.interests.map(i => i.name).join(", "),
    ]
      .filter(Boolean)
      .join(" ");

    const embedding = await getEmbedding(text);

    // pgvector expects: [0.1,0.2,...]
    const embeddingStr = `[${embedding.join(",")}]`;

    await prisma.$executeRaw`
      UPDATE "Event"
      SET embedding = ${embeddingStr}::vector
      WHERE id = ${event.id};
    `;

    console.log(`✅ Embedded: ${event.title}`);
  }

  console.log("🎉 All embeddings generated");
  process.exit(0);
}

run().catch(err => {
  console.error("❌ Embedding failed:", err);
  process.exit(1);
});
