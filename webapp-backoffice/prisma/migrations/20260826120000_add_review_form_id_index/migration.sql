-- CreateIndex
--
-- "Review" est partitionnée : un CREATE INDEX nu sur le parent bloque les
-- écritures sur toutes les partitions le temps du build, et Postgres refuse
-- CONCURRENTLY sur une table partitionnée parente.
--
-- En production, jouer prisma/custom_migrations/add_review_form_id_index_concurrently.sql
-- AVANT `migrate deploy` : l'instruction ci-dessous devient alors un no-op.
-- Sur une base de développement ou de test, elle s'exécute instantanément.
CREATE INDEX IF NOT EXISTS "Review_form_id_created_at_id_idx" ON "Review"("form_id", "created_at", "id");
