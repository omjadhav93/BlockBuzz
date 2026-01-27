/*
  Warnings:

  - A unique constraint covering the columns `[volunteerId,eventId]` on the table `Assignment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Assignment_id_volunteerId_eventId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_volunteerId_eventId_key" ON "Assignment"("volunteerId", "eventId");
