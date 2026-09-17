-- Index Review(form_id, created_at, id), requis par GET /api/open-api/avis.
--
-- POURQUOI CE SCRIPT PLUTÔT QU'UNE SIMPLE MIGRATION PRISMA
--
-- "Review" est partitionnée par mois sur created_at (une centaine et demie de
-- partitions, ~18 M de lignes). Deux contraintes s'ensuivent :
--
--   1. Postgres refuse CREATE INDEX CONCURRENTLY sur une table partitionnée
--      parente ("cannot create index on partitioned table ... concurrently").
--   2. Un CREATE INDEX nu sur le parent construit l'index sur toutes les
--      partitions dans une seule transaction, et garde donc un verrou SHARE
--      sur chacune jusqu'au commit. La partition du mois courant — celle où
--      atterrissent les nouveaux avis — reste bloquée en écriture pendant
--      toute la durée du build : les soumissions de formulaire échouent.
--
-- Et comme Prisma enveloppe chaque fichier de migration dans une transaction,
-- CONCURRENTLY ne peut de toute façon pas y vivre.
--
-- La recette ci-dessous indexe chaque partition sans bloquer les écritures,
-- puis rattache le tout à un index parent.
--
-- À EXÉCUTER AVANT `prisma migrate deploy`. La migration Prisma correspondante
-- utilise CREATE INDEX IF NOT EXISTS : elle deviendra un no-op instantané.
--
-- Usage : psql "$POSTGRESQL_ADDON_URI" -f add_review_form_id_index_concurrently.sql
--         (\gexec est une méta-commande psql : chaque ligne produite par le
--          SELECT qui précède est exécutée comme une instruction à part, hors
--          transaction — indispensable pour CONCURRENTLY.)

\set ON_ERROR_STOP on

-- 1. Un index par partition, sans blocage des écritures.
SELECT format(
	'CREATE INDEX CONCURRENTLY IF NOT EXISTS %I ON %I.%I (form_id, created_at, id);',
	c.relname || '_form_id_created_at_id_idx',
	n.nspname,
	c.relname
)
FROM pg_inherits i
JOIN pg_class c ON c.oid = i.inhrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_class p ON p.oid = i.inhparent
WHERE p.relname = 'Review'
ORDER BY c.relname
\gexec

-- 2. Aucun index de partition ne doit être resté invalide : CONCURRENTLY laisse
--    un index invalide derrière lui en cas d'échec, et un index invalide ne peut
--    pas être rattaché au parent.
DO $$
DECLARE invalides text;
BEGIN
	SELECT string_agg(c.relname, ', ')
	INTO invalides
	FROM pg_class c
	JOIN pg_index x ON x.indexrelid = c.oid
	WHERE c.relname LIKE 'Review_p%_form_id_created_at_id_idx'
	  AND NOT x.indisvalid;

	IF invalides IS NOT NULL THEN
		RAISE EXCEPTION
			'Index de partition invalides, à supprimer puis recréer avant de continuer : %',
			invalides;
	END IF;
END $$;

-- 3. Index parent, déclaré sur le seul parent. Il reste invalide — et donc
--    ignoré par le planificateur — jusqu'au rattachement de la dernière
--    partition, à l'étape 4.
CREATE INDEX IF NOT EXISTS "Review_form_id_created_at_id_idx"
	ON ONLY public."Review" (form_id, created_at, id);

-- 4. Rattachement. L'index parent devient valide au dernier ATTACH.
SELECT format(
	'ALTER INDEX public.%I ATTACH PARTITION %I.%I;',
	'Review_form_id_created_at_id_idx',
	n.nspname,
	c.relname || '_form_id_created_at_id_idx'
)
FROM pg_inherits i
JOIN pg_class c ON c.oid = i.inhrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_class p ON p.oid = i.inhparent
WHERE p.relname = 'Review'
ORDER BY c.relname
\gexec

-- 5. Contrôle final : l'index parent doit être valide, sinon le planificateur
--    ne s'en servira pas et l'endpoint restera lent sans que rien n'alerte.
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_class c
		JOIN pg_index x ON x.indexrelid = c.oid
		WHERE c.relname = 'Review_form_id_created_at_id_idx'
		  AND x.indisvalid
	) THEN
		RAISE EXCEPTION
			'Review_form_id_created_at_id_idx est invalide : une partition n''a pas été rattachée.';
	END IF;

	RAISE NOTICE 'Review_form_id_created_at_id_idx est valide sur toutes les partitions.';
END $$;

-- Les partitions créées après coup héritent automatiquement de l'index : rien à
-- rejouer lors de l'ajout du mois suivant.
