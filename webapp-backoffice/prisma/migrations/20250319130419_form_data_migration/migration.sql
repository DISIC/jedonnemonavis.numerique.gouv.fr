-- Step 1: Create the form template if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "FormTemplate" WHERE slug = 'root') THEN
    INSERT INTO "FormTemplate" (title, slug, active, created_at, updated_at)
    VALUES ('Formulaire d’évaluation de la satisfaction usager', 'root', true, NOW(), NOW());
  END IF;
END $$;

-- Step 2: Get the ID of the root form template and create forms for each product
DO $$
DECLARE
  root_template_id INTEGER;
BEGIN
  -- Get the ID of the root form template
  SELECT id INTO root_template_id FROM "FormTemplate" WHERE slug = 'root';

  -- Create a form for each product if it doesn't already have one linked to the root template
  INSERT INTO "Form" (product_id, form_template_id, created_at, updated_at)
  SELECT p.id, root_template_id, NOW(), NOW()
  FROM "Product" p
  WHERE NOT EXISTS (
    SELECT 1 
    FROM "Form" f 
    WHERE f.product_id = p.id 
    AND f.form_template_id = root_template_id
  );
END $$;

-- Step 3: Add form_id column to Button table without NOT NULL constraint initially
ALTER TABLE "Button" ADD COLUMN "form_id" INTEGER;

-- Step 4: Update the form_id for all buttons based on their product_id
UPDATE "Button" b
SET form_id = f.id
FROM "Form" f
JOIN "Product" p ON f.product_id = p.id
WHERE b.product_id = p.id;

-- Step 5: Add foreign key constraint for form_id
ALTER TABLE "Button" 
ADD CONSTRAINT "Button_form_id_fkey" 
FOREIGN KEY ("form_id") REFERENCES "Form"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 6: Make form_id NOT NULL after populating it
ALTER TABLE "Button" ALTER COLUMN "form_id" SET NOT NULL;

-- Step 7: Drop the foreign key constraint for product_id
ALTER TABLE "Button" DROP CONSTRAINT "Button_product_id_fkey";

-- Step 8: Drop the product_id column
ALTER TABLE "Button" DROP COLUMN "product_id";