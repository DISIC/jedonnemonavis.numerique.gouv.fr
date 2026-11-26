-- À lancer après la migration Prisma 20261118100000_add_consent_block_type ET
-- le déploiement de webapp-form : l'ancien code rendrait l'étape Email
-- obligatoire pour tous les usagers. Rejouable sans effet.

BEGIN;

WITH bug AS (
  SELECT id FROM "FormTemplate" WHERE slug = 'bug'
), new_step AS (
  INSERT INTO "FormTemplateStep" (title, position, description, "isHideable", form_template_id)
  SELECT 'Email', 2, 'Cette étape permet à l’usager de laisser son adresse email s’il accepte d’être recontacté.', false, id
  FROM bug
  WHERE NOT EXISTS (
    SELECT 1 FROM "FormTemplateStep" s WHERE s.form_template_id = bug.id AND s.title = 'Email'
  )
  RETURNING id, form_template_id
)
UPDATE "FormTemplateBlock" b
SET form_template_step_id = new_step.id,
    position = 0,
    label = 'Adresse email',
    content = NULL,
    "isRequired" = true,
    updated_at = now()
FROM new_step, "FormTemplateStep" s
WHERE b.form_template_step_id = s.id
  AND s.form_template_id = new_step.form_template_id
  AND b.field_code = 'contact_email';

WITH comment_step AS (
  SELECT s.id
  FROM "FormTemplateStep" s
  JOIN "FormTemplate" t ON t.id = s.form_template_id AND t.slug = 'bug'
  WHERE s.position = 1
), consent AS (
  INSERT INTO "FormTemplateBlock" (form_template_step_id, position, type_bloc, label, "isHideable")
  SELECT id, 1, 'consent', 'J''accepte d''être recontacté par l''administration dans le cadre de l''amélioration du service', true
  FROM comment_step
  WHERE NOT EXISTS (
    SELECT 1 FROM "FormTemplateBlock" b
    WHERE b.form_template_step_id = comment_step.id AND b.type_bloc = 'consent'
  )
  RETURNING id
), email AS (
  UPDATE "FormTemplateBlock" b
  SET "isHideable" = false, updated_at = now()
  FROM "FormTemplateStep" s
  JOIN "FormTemplate" t ON t.id = s.form_template_id AND t.slug = 'bug'
  WHERE b.form_template_step_id = s.id AND b.field_code = 'contact_email'
  RETURNING b.id
)
UPDATE "FormConfigDisplay" d
SET parent_id = consent.id, updated_at = now()
FROM consent, email
WHERE d.kind = 'block' AND d.parent_id = email.id;

SELECT s.position AS step, s.title, b.position, b.type_bloc, b.field_code, b."isHideable", b."isRequired"
FROM "FormTemplateStep" s
JOIN "FormTemplate" t ON t.id = s.form_template_id AND t.slug = 'bug'
LEFT JOIN "FormTemplateBlock" b ON b.form_template_step_id = s.id
ORDER BY s.position, b.position;

COMMIT;
