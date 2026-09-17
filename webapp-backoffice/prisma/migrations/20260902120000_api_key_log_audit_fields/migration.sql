-- Journal d'audit des open API.
--
-- `ApiKeyLog` ne stockait que (apikey_id, url, created_at), écrit à la main par
-- chaque endpoint. On l'élargit en journal d'audit complet, alimenté par un point
-- de capture unique. Voir `prisma/schema.prisma` (model ApiKeyLog).
--
-- Toutes les colonnes sont nullables : les lignes historiques n'ont que `url`,
-- et un appel rejeté avant authentification n'a pas de clé.

-- ── apikey_id : nullable + SetNull ──────────────────────────────────────────
-- Nullable pour journaliser les appels sans clé valide (401).
-- SetNull plutôt que Cascade : supprimer une clé ne doit pas effacer la piste
-- d'audit qui la concerne.
ALTER TABLE "ApiKeyLog" ALTER COLUMN "apikey_id" DROP NOT NULL;

ALTER TABLE "ApiKeyLog" DROP CONSTRAINT IF EXISTS "ApiKeyLog_apikey_id_fkey";
ALTER TABLE "ApiKeyLog" ADD CONSTRAINT "ApiKeyLog_apikey_id_fkey"
  FOREIGN KEY ("apikey_id") REFERENCES "ApiKey"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ── Colonnes d'audit ────────────────────────────────────────────────────────
ALTER TABLE "ApiKeyLog" ADD COLUMN IF NOT EXISTS "key_hash"      TEXT;
ALTER TABLE "ApiKeyLog" ADD COLUMN IF NOT EXISTS "user_id"       INTEGER;
ALTER TABLE "ApiKeyLog" ADD COLUMN IF NOT EXISTS "ip"            TEXT;
ALTER TABLE "ApiKeyLog" ADD COLUMN IF NOT EXISTS "user_agent"    TEXT;
ALTER TABLE "ApiKeyLog" ADD COLUMN IF NOT EXISTS "method"        TEXT;
ALTER TABLE "ApiKeyLog" ADD COLUMN IF NOT EXISTS "route"         TEXT;
ALTER TABLE "ApiKeyLog" ADD COLUMN IF NOT EXISTS "request_body"  JSONB;
ALTER TABLE "ApiKeyLog" ADD COLUMN IF NOT EXISTS "status_code"   INTEGER;
ALTER TABLE "ApiKeyLog" ADD COLUMN IF NOT EXISTS "response_body" JSONB;
ALTER TABLE "ApiKeyLog" ADD COLUMN IF NOT EXISTS "error_message" TEXT;
ALTER TABLE "ApiKeyLog" ADD COLUMN IF NOT EXISTS "duration_ms"   INTEGER;

-- ── Index ───────────────────────────────────────────────────────────────────
-- Table non partitionnée et de taille modeste : un CREATE INDEX nu suffit,
-- contrairement à "Review".
--   (apikey_id, created_at) : historique d'une clé + "dernière utilisation" du BO
--   (ip, created_at)        : repérer une IP qui martèle depuis plusieurs clés
--   (route, created_at)     : volumétrie par API, base du futur plafonnement
--   (created_at)            : purge par rétention
CREATE INDEX IF NOT EXISTS "ApiKeyLog_apikey_id_created_at_idx" ON "ApiKeyLog"("apikey_id", "created_at");
CREATE INDEX IF NOT EXISTS "ApiKeyLog_ip_created_at_idx"        ON "ApiKeyLog"("ip", "created_at");
CREATE INDEX IF NOT EXISTS "ApiKeyLog_route_created_at_idx"     ON "ApiKeyLog"("route", "created_at");
CREATE INDEX IF NOT EXISTS "ApiKeyLog_created_at_idx"           ON "ApiKeyLog"("created_at");
