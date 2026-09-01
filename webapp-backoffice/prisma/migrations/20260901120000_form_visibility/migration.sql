-- AlterEnum
ALTER TYPE "TypeAction" ADD VALUE 'service_form_stats_visibility_update';

-- AlterTable: mark which form templates expose a statistics screen
ALTER TABLE "FormTemplate" ADD COLUMN "hasStats" BOOLEAN NOT NULL DEFAULT false;

UPDATE "FormTemplate" SET "hasStats" = true WHERE "slug" = 'root';

-- AlterTable: move statistics visibility from Product to Form
ALTER TABLE "Form" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: every stats-capable form of a currently public service becomes public,
-- closed forms included so already-shared links keep working
UPDATE "Form" f
SET "isPublic" = true
FROM "Product" p, "FormTemplate" ft
WHERE f.product_id = p.id
  AND f.form_template_id = ft.id
  AND ft."hasStats" = true
  AND p."isPublic" = true;

-- Warn about public services that have no stats-capable form to carry the flag
DO $$
DECLARE
  unmigrated_product RECORD;
BEGIN
  FOR unmigrated_product IN
    SELECT p.id, p.title
    FROM "Product" p
    WHERE p."isPublic" = true
      AND NOT EXISTS (
        SELECT 1
        FROM "Form" f
        JOIN "FormTemplate" ft ON ft.id = f.form_template_id
        WHERE f.product_id = p.id
          AND ft."hasStats" = true
      )
  LOOP
    RAISE WARNING 'Product % (%) is public but has no stats-capable form to flag', unmigrated_product.id, unmigrated_product.title;
  END LOOP;
END $$;

-- AlterTable: drop the product-level visibility and the write-only Top250 history
ALTER TABLE "Product" DROP COLUMN "isPublic";
ALTER TABLE "Product" DROP COLUMN "hasBeenTop250";
