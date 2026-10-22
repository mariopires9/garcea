-- Captions were never used (0 of 21 gallery items had one when removed).
-- Apply only after the code without `caption` is deployed: the previous
-- deployment's Prisma client still selects this column.
ALTER TABLE "GalleryItem" DROP COLUMN "caption";
