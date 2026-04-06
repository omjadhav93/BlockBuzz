// Prisma configuration - used by Prisma CLI (generate, migrate, etc.)
// DATABASE_URL is loaded at runtime from environment variables (.env / Vercel env)
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
});
