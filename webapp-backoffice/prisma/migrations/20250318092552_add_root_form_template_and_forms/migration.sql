-- Step 1: Create the form template if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "FormTemplate" WHERE slug = 'root') THEN
    INSERT INTO "FormTemplate" (title, slug, active, created_at, updated_at)
    VALUES ('Formulaire des démarches', 'root', true, NOW(), NOW());
  END IF;
END $$;

-- Step 2: Get the ID of the root form template
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