-- AlterTable: add isTop250 on Form
ALTER TABLE "Form" ADD COLUMN "isTop250" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: mark the root form of currently Top250 services
UPDATE "Form" f
SET "isTop250" = true
FROM "Product" p, "FormTemplate" ft
WHERE f.product_id = p.id
  AND f.form_template_id = ft.id
  AND ft.slug = 'root'
  AND p."isTop250" = true;

-- AlterTable: drop isTop250 from Product
ALTER TABLE "Product" DROP COLUMN "isTop250";
