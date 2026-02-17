-- Mimic `seed.ts` behavior for form templates/buttons/variants directly in PostgreSQL.
-- Notes:
-- - Designed to be idempotent.
-- - Includes explicit created_at/updated_at because remote DB requires updated_at NOT NULL on FormTemplateButton.

DO $$
DECLARE
	root_template_id INT;
	bug_template_id INT;
	root_button_id INT;
	bug_button_id INT;
	was_inserted BOOLEAN;
	bug_rec RECORD;
BEGIN
	INSERT INTO "FormTemplate" (title, slug, created_at, updated_at)
	VALUES ('root', 'root', NOW(), NOW())
	ON CONFLICT (slug)
	DO UPDATE SET updated_at = NOW();

	INSERT INTO "FormTemplate" (title, slug, created_at, updated_at)
	VALUES ('bug', 'bug', NOW(), NOW())
	ON CONFLICT (slug)
	DO UPDATE SET updated_at = NOW();

	SELECT id INTO root_template_id
	FROM "FormTemplate"
	WHERE slug = 'root';

	SELECT id INTO bug_template_id
	FROM "FormTemplate"
	WHERE slug = 'bug';

	WITH upsert_root_button AS (
		INSERT INTO "FormTemplateButton" (
			form_template_id,
			label,
			slug,
			"order",
			"isDefault",
			created_at,
			updated_at
		)
		VALUES (
			root_template_id,
			'Je donne mon avis',
			'default',
			0,
			TRUE,
			NOW(),
			NOW()
		)
		ON CONFLICT (form_template_id, slug)
		DO UPDATE SET
			label = EXCLUDED.label,
			"order" = EXCLUDED."order",
			"isDefault" = EXCLUDED."isDefault",
			updated_at = NOW()
		RETURNING id
	)
	SELECT id INTO root_button_id
	FROM upsert_root_button;

	DELETE FROM "FormTemplateButtonVariant"
	WHERE form_template_button_id = root_button_id;

	INSERT INTO "FormTemplateButtonVariant" (
		form_template_button_id,
		style,
		theme,
		image_url,
		alt_text,
		created_at,
		updated_at
	)
	VALUES
		(
			root_button_id,
			'solid'::"FormTemplateButtonStyle",
			'light'::"FormTemplateButtonTheme",
			'https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu-clair.svg',
			'Je donne mon avis',
			NOW(),
			NOW()
		),
		(
			root_button_id,
			'solid'::"FormTemplateButtonStyle",
			'dark'::"FormTemplateButtonTheme",
			'https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu-sombre.svg',
			'Je donne mon avis',
			NOW(),
			NOW()
		),
		(
			root_button_id,
			'outline'::"FormTemplateButtonStyle",
			'light'::"FormTemplateButtonTheme",
			'https://jedonnemonavis.numerique.gouv.fr/static/bouton-blanc-clair.svg',
			'Je donne mon avis',
			NOW(),
			NOW()
		),
		(
			root_button_id,
			'outline'::"FormTemplateButtonStyle",
			'dark'::"FormTemplateButtonTheme",
			'https://jedonnemonavis.numerique.gouv.fr/static/bouton-blanc-sombre.svg',
			'Je donne mon avis',
			NOW(),
			NOW()
		);

	FOR bug_rec IN
		SELECT *
		FROM (
			VALUES
				('Une remarque ?', 'remark', 0, TRUE),
				('Faire un retour', 'feedback', 1, FALSE),
				('Signaler un problème', 'problem', 2, FALSE)
		) AS t(label, slug, ord, is_default)
	LOOP
		WITH upsert_bug_button AS (
			INSERT INTO "FormTemplateButton" (
				form_template_id,
				label,
				slug,
				"order",
				"isDefault",
				created_at,
				updated_at
			)
			VALUES (
				bug_template_id,
				bug_rec.label,
				bug_rec.slug,
				bug_rec.ord,
				bug_rec.is_default,
				NOW(),
				NOW()
			)
			ON CONFLICT (form_template_id, slug)
			DO UPDATE SET
				label = EXCLUDED.label,
				"order" = EXCLUDED."order",
				"isDefault" = EXCLUDED."isDefault",
				updated_at = NOW()
			RETURNING id, (xmax = 0) AS inserted
		)
		SELECT id, inserted
		INTO bug_button_id, was_inserted
		FROM upsert_bug_button;

		DELETE FROM "FormTemplateButtonVariant"
		WHERE form_template_button_id = bug_button_id;

		IF was_inserted THEN
			-- Mimic create branch from seed.ts: 4 themed image variants
			INSERT INTO "FormTemplateButtonVariant" (
				form_template_button_id,
				style,
				theme,
				image_url,
				alt_text,
				created_at,
				updated_at
			)
			VALUES
				(
					bug_button_id,
					'solid'::"FormTemplateButtonStyle",
					'light'::"FormTemplateButtonTheme",
					'https://jedonnemonavis.numerique.gouv.fr/static/buttons/button-' || bug_rec.slug || '-solid-light.svg',
					bug_rec.label,
					NOW(),
					NOW()
				),
				(
					bug_button_id,
					'outline'::"FormTemplateButtonStyle",
					'light'::"FormTemplateButtonTheme",
					'https://jedonnemonavis.numerique.gouv.fr/static/buttons/button-' || bug_rec.slug || '-outline-light.svg',
					bug_rec.label,
					NOW(),
					NOW()
				),
				(
					bug_button_id,
					'solid'::"FormTemplateButtonStyle",
					'dark'::"FormTemplateButtonTheme",
					'https://jedonnemonavis.numerique.gouv.fr/static/buttons/button-' || bug_rec.slug || '-solid-dark.svg',
					bug_rec.label,
					NOW(),
					NOW()
				),
				(
					bug_button_id,
					'outline'::"FormTemplateButtonStyle",
					'dark'::"FormTemplateButtonTheme",
					'https://jedonnemonavis.numerique.gouv.fr/static/buttons/button-' || bug_rec.slug || '-outline-dark.svg',
					bug_rec.label,
					NOW(),
					NOW()
				);
		ELSE
			-- Mimic update branch from seed.ts: 2 variants with theme NULL and empty image_url
			INSERT INTO "FormTemplateButtonVariant" (
				form_template_button_id,
				style,
				theme,
				image_url,
				alt_text,
				created_at,
				updated_at
			)
			VALUES
				(
					bug_button_id,
					'solid'::"FormTemplateButtonStyle",
					NULL,
					'',
					bug_rec.label,
					NOW(),
					NOW()
				),
				(
					bug_button_id,
					'outline'::"FormTemplateButtonStyle",
					NULL,
					'',
					bug_rec.label,
					NOW(),
					NOW()
				);
		END IF;
	END LOOP;
END
$$;
