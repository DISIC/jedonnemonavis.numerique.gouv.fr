import { ReviewPartialWithRelations } from '@/prisma/generated/zod';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';

type Pol = 'positif' | 'negatif';

/**
 * Verbatim classification à FACETTES : affiche/édite les objets, les thématiques site et la
 * polarité (multi-valeur) et enregistre le tout via `classification.validate` (source=validated).
 * L'état initial reflète la validation si elle existe, sinon la prédiction IA.
 *
 * Monter avec `key={review.id}` pour réinitialiser la sélection en changeant d'avis.
 */
const ClassificationEditor = ({
	review
}: {
	review: ReviewPartialWithRelations;
}) => {
	const { cx, classes } = useStyles();
	const utils = trpc.useUtils();

	const { data: catalogueData } = trpc.classification.getCatalogue.useQuery();
	const facetsRef = catalogueData?.data ?? [];
	const objetsRef = facetsRef.filter(
		f => f.axis === 'objet' && (f.product_id == null || f.product_id === review.product_id)
	);
	const themesRef = facetsRef.filter(f => f.axis === 'thematique_site');

	const classification = review.classification;
	const assigned = classification?.facets ?? [];
	const hasValidated = assigned.some(f => f.source === 'validated');
	const effective = assigned.filter(f =>
		hasValidated ? f.source === 'validated' : f.source === 'predicted'
	);

	const codesForAxis = (axis: 'objet' | 'thematique_site') =>
		effective
			.filter(f => f.axis === axis)
			.map(f => f.code)
			.filter((c): c is string => !!c);
	const [selObjets, setSelObjets] = useState<string[]>(codesForAxis('objet'));
	const [selThemes, setSelThemes] = useState<string[]>(
		codesForAxis('thematique_site')
	);
	const [selPol, setSelPol] = useState<Pol[]>(
		(classification?.polarite as Pol[] | undefined) ?? []
	);

	const validate = trpc.classification.validate.useMutation({
		onSuccess: () => {
			utils.review.getList.invalidate();
		}
	});

	const toggle =
		(list: string[], set: (v: string[]) => void) => (code: string) =>
			set(list.includes(code) ? list.filter(c => c !== code) : [...list, code]);
	const togglePol = (p: Pol) =>
		setSelPol(selPol.includes(p) ? selPol.filter(x => x !== p) : [...selPol, p]);

	const handleSave = () => {
		if (review.id === undefined || !review.created_at) return;
		validate.mutate({
			review_id: review.id,
			review_created_at: new Date(review.created_at).toISOString(),
			objets: selObjets,
			thematiques: selThemes,
			polarite: selPol
		});
	};

	return (
		<div className={cx(classes.section)}>
			<span className={fr.cx('fr-text--sm', 'fr-text--bold', 'fr-mb-0')}>
				Classification IA (facettes){' '}
				{classification?.status === 'validated' || classification?.status === 'corrected'
					? '— validée'
					: classification
					? "— prédiction à valider/corriger"
					: '— non classé'}
			</span>
			{classification?.pourquoi ? (
				<p className={cx(classes.pourquoi, fr.cx('fr-text--xs', 'fr-mb-0'))}>
					{classification.pourquoi}
				</p>
			) : null}

			<Checkbox
				legend="Polarité"
				orientation="horizontal"
				small
				options={(['positif', 'negatif'] as Pol[]).map(p => ({
					label: p,
					nativeInputProps: {
						checked: selPol.includes(p),
						onChange: () => togglePol(p)
					}
				}))}
			/>

			{objetsRef.length > 0 && (
				<Checkbox
					legend="Produits / objets"
					small
					options={objetsRef.map(f => ({
						label: f.label,
						nativeInputProps: {
							checked: selObjets.includes(f.code),
							onChange: () => toggle(selObjets, setSelObjets)(f.code)
						}
					}))}
				/>
			)}

			<Checkbox
				legend="Thématiques site"
				small
				options={themesRef.map(f => ({
					label: f.label,
					nativeInputProps: {
						checked: selThemes.includes(f.code),
						onChange: () => toggle(selThemes, setSelThemes)(f.code)
					}
				}))}
			/>

			<Button
				size="small"
				priority="secondary"
				disabled={validate.isLoading}
				onClick={handleSave}
			>
				{validate.isLoading ? 'Enregistrement…' : 'Valider la classification'}
			</Button>

			{validate.isSuccess && (
				<p className={cx(classes.feedback, fr.cx('fr-text--sm'))}>Classification validée.</p>
			)}
			{validate.isError && (
				<p className={cx(classes.feedbackError, fr.cx('fr-text--sm'))} role="alert">
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
	pourquoi: {
		fontStyle: 'italic',
		color: fr.colors.decisions.text.mention.grey.default
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
