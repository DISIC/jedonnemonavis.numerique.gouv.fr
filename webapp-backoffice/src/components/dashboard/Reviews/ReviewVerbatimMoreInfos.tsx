import { fr } from '@codegouvfr/react-dsfr';
import { ExtendedReview } from './interface';
import { tss } from 'tss-react/dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { getSeverity, retrieveButtonName } from '@/src/utils/tools';
import {
	displayIntention,
	getStatsColor,
	getStatsIcon
} from '@/src/utils/stats';
import ReviewCommonVerbatimLine from './ReviewCommonVerbatimLine';

const ReviewVerbatimMoreInfos = ({ review }: { review: ExtendedReview }) => {
	const { cx, classes } = useStyles();

	if (!review) return null;

	const displayFieldCodeText = (fieldCode: string) => {
		return review.answers?.find(answer => answer.field_code === fieldCode)
			?.answer_text;
	};

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
					<p className={cx(classes.subtitle)}>Horaire</p>
					<p className={cx(classes.content)}>
						{review.created_at &&
							new Date(review.created_at).getHours() +
								':' +
								new Date(review.created_at).getMinutes()}
					</p>
				</div>
				<div className={fr.cx('fr-col-6', 'fr-col-md-2')}>
					<p className={cx(classes.subtitle)}>Identifiant</p>
					<p className={cx(classes.content)}>{review.form_id && review.id}</p>
				</div>
				<div className={fr.cx('fr-col-6', 'fr-col-md-2')}>
					<p className={cx(classes.subtitle)}>Source</p>
					<p className={cx(classes.content)}>
						{review.button_id
							? retrieveButtonName(review.button_id)
							: 'Pas de source'}
					</p>
				</div>
				<ReviewCommonVerbatimLine
					review={review}
					type={'Line'}
				></ReviewCommonVerbatimLine>
			</div>
		</div>
	);
};

const useStyles = tss.create({
	container: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		height: '100%'
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
	},
	badge: {
		fontSize: 12,
		width: 100,
		paddingVertical: 4
	}
});

export default ReviewVerbatimMoreInfos;
