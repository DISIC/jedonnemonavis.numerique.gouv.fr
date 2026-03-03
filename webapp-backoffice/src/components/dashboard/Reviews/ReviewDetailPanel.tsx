import { retrieveButtonName } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import { ReviewPartialWithRelations } from '@/prisma/generated/zod';
import ReviewDetailPanelRoot from './ReviewDetailPanelRoot';
import ReviewDetailPanelDynamic from './ReviewDetailPanelDynamic';
import {
	FormConfigWithChildren,
	FormTemplateWithElements
} from '@/src/types/prismaTypesExtended';
import { ExtendedReview } from './ReviewDetailPanelRoot';

const ReviewDetailPanel = ({
	review,
	formConfigHelper,
	hasManyVersions,
	search,
	formTemplate
}: {
	review: ReviewPartialWithRelations;
	formConfigHelper: {
		formConfig?: FormConfigWithChildren;
		versionNumber: number;
	};
	hasManyVersions: boolean;
	search: string;
	formTemplate: FormTemplateWithElements;
}) => {
	const { cx, classes } = useStyles();

	if (!review) return null;

	return (
		<div className={cx(fr.cx('fr-p-3v'), classes.container)}>
			<div
				className={fr.cx(
					'fr-grid-row',
					'fr-grid-row--gutters',
					'fr-grid-row--left',
					'fr-mb-1-5v'
				)}
			>
				<div className={fr.cx('fr-col-6', 'fr-col-md-2')}>
					<h2 className={cx(classes.subtitle)}>Horaire</h2>
					<p className={cx(classes.content)}>
						{review.created_at &&
							(() => {
								const date = new Date(review.created_at);
								const hours = String(date.getHours()).padStart(2, '0');
								const minutes = String(date.getMinutes()).padStart(2, '0');
								return `${hours}:${minutes}`;
							})()}
					</p>
				</div>
				{hasManyVersions && (
					<div className={fr.cx('fr-col-6', 'fr-col-md-2')}>
						<h2 className={cx(classes.subtitle)}>Formulaire</h2>
						<p className={cx(classes.content)}>
							Version {formConfigHelper.versionNumber}
						</p>
					</div>
				)}
				<div className={fr.cx('fr-col-6', 'fr-col-md-2')}>
					<h2 className={cx(classes.subtitle)}>Identifiant</h2>
					<p className={cx(classes.content)}>{review.form_id && review.id}</p>
				</div>
				<div className={fr.cx('fr-col-6', 'fr-col-md-2')}>
					<h2 className={cx(classes.subtitle)}>Source</h2>
					<p className={cx(classes.content)}>
						{review.button_id
							? retrieveButtonName(review.button_id)
							: 'Pas de source'}
					</p>
				</div>
				{formTemplate.slug === 'root' ? (
					<ReviewDetailPanelRoot
						review={review as ExtendedReview}
						type={'Line'}
						formConfig={formConfigHelper.formConfig}
						search={search}
					/>
				) : (
					<ReviewDetailPanelDynamic
						review={review}
						formTemplate={formTemplate}
					/>
				)}
			</div>
		</div>
	);
};

const useStyles = tss.create({
	container: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		height: '100%',
		width: '100%',
		marginTop: fr.spacing('2v'),
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default
	},
	subtitle: {
		...fr.typography[18].style,
		fontWeight: 'bold',
		marginBottom: 0
	},
	content: {
		...fr.typography[17].style,
		fontWeight: 400,
		marginBottom: 0
	}
});

export default ReviewDetailPanel;
