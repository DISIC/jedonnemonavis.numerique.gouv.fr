-- AlterTable: add isTop250 on Form
ALTER TABLE "Form" ADD COLUMN "isTop250" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: mark the active root form of currently Top250 services
UPDATE "Form" f
SET "isTop250" = true
FROM "Product" p, "FormTemplate" ft
WHERE f.product_id = p.id
  AND f.form_template_id = ft.id
  AND ft.slug = 'root'
  AND p."isTop250" = true
  AND COALESCE(f."isDeleted", false) = false;

-- Warn about Top250 products that have no active root form to flag
DO $$
DECLARE
  unmigrated_product RECORD;
BEGIN
  FOR unmigrated_product IN
    SELECT p.id, p.title
    FROM "Product" p
    WHERE p."isTop250" = true
      AND NOT EXISTS (
        SELECT 1
        FROM "Form" f
        JOIN "FormTemplate" ft ON ft.id = f.form_template_id
        WHERE f.product_id = p.id
          AND ft.slug = 'root'
          AND COALESCE(f."isDeleted", false) = false
      )
  LOOP
    RAISE WARNING 'Product % (%) is Top250 but has no active root form to flag', unmigrated_product.id, unmigrated_product.title;
  END LOOP;
END $$;

-- AlterTable: drop isTop250 from Product
ALTER TABLE "Product" DROP COLUMN "isTop250";
