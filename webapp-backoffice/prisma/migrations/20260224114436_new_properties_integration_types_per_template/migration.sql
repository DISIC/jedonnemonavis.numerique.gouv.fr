-- AlterTable
ALTER TABLE "FormTemplate" ADD COLUMN     "default_integration_type" "ButtonIntegrationTypes",
ADD COLUMN     "integration_types" "ButtonIntegrationTypes"[];

-- Set default values for the root template
UPDATE "FormTemplate"
SET
  integration_types = ARRAY['embed', 'button', 'link']::"ButtonIntegrationTypes"[],
  default_integration_type = 'button'::"ButtonIntegrationTypes",
  description = 'Permet de récolter une note sur la satisfaction globale, la clarté des informations et les aides apportées.'
WHERE slug = 'root'
  AND (integration_types IS NULL OR default_integration_type IS NULL OR description IS NULL);

-- Set default values for the bug template
UPDATE "FormTemplate"
SET
  integration_types = ARRAY['modal', 'link']::"ButtonIntegrationTypes"[],
  default_integration_type = 'modal'::"ButtonIntegrationTypes",
WHERE slug = 'bug'
  AND (integration_types IS NULL OR default_integration_type IS NULL);

