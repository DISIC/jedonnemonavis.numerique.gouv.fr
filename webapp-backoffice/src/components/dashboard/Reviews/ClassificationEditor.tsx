import { ReviewPartialWithRelations } from '@/prisma/generated/zod';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { Button } from '@codegouvfr/react-dsfr/Button';
import Select from '@codegouvfr/react-dsfr/Select';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';

/**
 * Verbatim classification: shows the current class (validated value taking precedence over
 * the LLM prediction + its confidence) and lets a user validate/correct it via
 * `classification.validate`. On success the review list is invalidated so the badge updates.
 *
 * Mount with `key={review.id}` so the selected code resets when navigating between reviews.
 */
const ClassificationEditor = ({
	review
}: {
	review: ReviewPartialWithRelations;
}) => {
	const { cx, classes } = useStyles();
	const utils = trpc.useUtils();

	const { data: catalogueData } = trpc.classification.getCatalogue.useQuery();
	const categories = catalogueData?.data ?? [];
	const themes = categories.filter(c => c.level === 1);
	const labelByCode = new Map(categories.map(c => [c.code, c.label] as const));

	const classification = review.classification;
	const currentCode =
		classification?.validated_code ?? classification?.predicted_code ?? '';
	const [code, setCode] = useState(currentCode);

	const validate = trpc.classification.validate.useMutation({
		onSuccess: () => {
			utils.review.getList.invalidate();
		}
	});

	const dirty = code !== '' && code !== currentCode;

	const handleSave = () => {
		if (review.id === undefined || !review.created_at) return;
		validate.mutate({
			review_id: review.id,
			review_created_at: new Date(review.created_at).toISOString(),
			validated_code: code
		});
	};

	return (
		<div className={cx(classes.section)}>
			<span className={fr.cx('fr-text--sm', 'fr-mb-2v')}>
				Catégorie (classification IA)
			</span>

			{classification ? (
				<div className={cx(classes.current)}>
					{classification.validated_code ? (
						<Badge noIcon severity="success" small>
							✓ Validé : {labelByCode.get(classification.validated_code) ??
								classification.validated_code}
						</Badge>
					) : (
						<Badge
							noIcon
							severity={
								(classification.predicted_score ?? 1) < 0.5 ? 'warning' : 'info'
							}
							small
						>
							Prédit :{' '}
							{labelByCode.get(classification.predicted_code ?? '') ??
								classification.predicted_code}{' '}
							({((classification.predicted_score ?? 0) * 100).toFixed(0)}%)
						</Badge>
					)}
				</div>
			) : (
				<p className={fr.cx('fr-text--sm', 'fr-mb-2v')}>
					Pas encore classé.
				</p>
			)}

			<Select
				label=""
				nativeSelectProps={{
					value: code,
					onChange: e => setCode(e.target.value),
					'aria-label': 'Choisir la catégorie'
				}}
			>
				<option value="" disabled>
					Choisir une catégorie…
				</option>
				{themes.map(theme => (
					<optgroup key={theme.id} label={theme.label}>
						{categories
							.filter(c => c.parent_id === theme.id)
							.map(c => (
								<option key={c.id} value={c.code}>
									{c.label}
								</option>
							))}
					</optgroup>
				))}
			</Select>

			<Button
				size="small"
				priority="secondary"
				disabled={!dirty || validate.isLoading}
				onClick={handleSave}
			>
				{validate.isLoading ? 'Enregistrement…' : 'Valider la catégorie'}
			</Button>

			{validate.isSuccess && (
				<p className={cx(classes.feedback, fr.cx('fr-text--sm'))}>
					Catégorie validée.
				</p>
			)}
			{validate.isError && (
				<p
					className={cx(classes.feedbackError, fr.cx('fr-text--sm'))}
					role="alert"
				>
					Erreur : {validate.error.message}
				</p>
			)}
		</div>
	);
};

const useStyles = tss.withName('ClassificationEditor').create(() => ({
	section: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('2v'),
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
		padding: fr.spacing('4v'),
		marginTop: fr.spacing('4v')
	},
	current: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: fr.spacing('1v')
	},
	feedback: {
		color: fr.colors.decisions.text.default.success.default,
		margin: 0
	},
	feedbackError: {
		color: fr.colors.decisions.text.default.error.default,
		margin: 0
	}
}));

export default ClassificationEditor;
