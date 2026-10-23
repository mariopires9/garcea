-- Official contacts can be reordered like social links. Existing contacts
-- keep their current order (by creation date).
ALTER TABLE "OfficialContact" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

UPDATE "OfficialContact" AS c
SET "order" = ranked.position
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt", id) - 1 AS position
  FROM "OfficialContact"
) AS ranked
WHERE c.id = ranked.id;
