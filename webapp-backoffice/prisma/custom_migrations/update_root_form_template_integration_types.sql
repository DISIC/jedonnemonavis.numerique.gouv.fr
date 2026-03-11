BEGIN;

UPDATE "FormTemplate"
SET
  integration_types = ARRAY['embed', 'button', 'link']::"ButtonIntegrationTypes"[],
  default_integration_type = 'button'::"ButtonIntegrationTypes",
  description = 'Permet de récolter une note sur la satisfaction globale, la clarté des informations et les aides apportées.'
WHERE slug = 'root';

COMMIT;
