-- AlterTable
ALTER TABLE "User" ADD COLUMN "isOwner" BOOLEAN NOT NULL DEFAULT false;

-- The first account ever created becomes the owner (selected by creation
-- date rather than email so no personal data lives in the repository).
UPDATE "User"
SET "isOwner" = true
WHERE "id" = (SELECT "id" FROM "User" ORDER BY "createdAt" ASC LIMIT 1);
