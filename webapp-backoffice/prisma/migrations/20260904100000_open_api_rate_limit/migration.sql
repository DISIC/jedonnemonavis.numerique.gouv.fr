-- Plafonnement des open API et garde anti-force brute.
-- Voir docs/open-api-protection.md et prisma/schema.prisma.

-- ── Coupure manuelle d'une clé ──────────────────────────────────────────────
-- Indépendante des quotas et de Redis : c'est le seul moyen de blocage qui
-- reste disponible quand le cache est éteint.
ALTER TABLE "ApiKey" ADD COLUMN IF NOT EXISTS "blocked_at"     TIMESTAMP(3);
ALTER TABLE "ApiKey" ADD COLUMN IF NOT EXISTS "blocked_reason" TEXT;

-- ── Mode observation ────────────────────────────────────────────────────────
-- `would_block` marque les appels qu'un mécanisme aurait rejetés, qu'il ait été
-- appliqué ou non. C'est ce qui permet de mesurer l'impact de seuils avant de
-- les activer.
ALTER TABLE "ApiKeyLog" ADD COLUMN IF NOT EXISTS "would_block"  BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ApiKeyLog" ADD COLUMN IF NOT EXISTS "block_reason" TEXT;

-- Index partiel : on interroge presque toujours « qu'est-ce qui aurait été
-- bloqué », jamais « qu'est-ce qui est passé ». Indexer la seule minorité utile
-- garde l'index minuscule.
CREATE INDEX IF NOT EXISTS "ApiKeyLog_would_block_created_at_idx"
  ON "ApiKeyLog"("created_at") WHERE "would_block";

-- ── Bannissements d'IP ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ApiIpBan" (
  "id"         SERIAL       NOT NULL,
  "ip"         TEXT         NOT NULL,
  "reason"     TEXT         NOT NULL,
  "created_by" TEXT         NOT NULL DEFAULT 'auto',
  "strike"     INTEGER      NOT NULL DEFAULT 1,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lifted_at"  TIMESTAMP(3),
  "lifted_by"  TEXT,

  CONSTRAINT "ApiIpBan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ApiIpBan_ip_expires_at_idx" ON "ApiIpBan"("ip", "expires_at");
CREATE INDEX IF NOT EXISTS "ApiIpBan_expires_at_idx"    ON "ApiIpBan"("expires_at");
