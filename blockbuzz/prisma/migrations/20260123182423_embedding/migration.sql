-- AlterTable
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "Event" ADD COLUMN     "embedding" vector;
