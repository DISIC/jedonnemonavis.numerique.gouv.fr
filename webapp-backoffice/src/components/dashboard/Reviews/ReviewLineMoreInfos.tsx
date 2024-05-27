import { fr } from '@codegouvfr/react-dsfr';
import { ExtendedReview } from './interface';
import { tss } from 'tss-react/dsfr';
import ReviewCommonVerbatimLine from './ReviewCommonVerbatimLine';
import Badge from '@codegouvfr/react-dsfr/Badge';

const ReviewLineMoreInfos = ({
	review,
	search
}: {
	review: ExtendedReview;
	search: string;
}) => {
	const { cx, classes } = useStyles();

	if (!review) return null;

	return (
		<div className={cx(fr.cx('fr-p-3v'), classes.container)}>
			<div className={cx(classes.container)}>
				<div
					className={fr.cx(
						'fr-grid-row',
						'fr-grid-row--gutters',
						'fr-grid-row--left'
					)}
				>
					<ReviewCommonVerbatimLine
						review={review}
						type={'Line'}
					></ReviewCommonVerbatimLine>
					<div className={fr.cx('fr-col-12')}>
						<h2 className={cx(classes.subtitle)}>
							Souhaitez-vous nous en dire plus ?
						</h2>
						<p className={cx(classes.content)}>
							{review.verbatim
								? `${search ? review.verbatim.answer_text?.replace(new RegExp(search, 'gi'), `<span>${search}</span>`) : review.verbatim.answer_text}`
								: '-'}
						</p>
					</div>
				</div>
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
		marginBottom: 0,
		span: {
			backgroundColor: 'yellow'
		}
	},
	badge: {
		...fr.typography[17].style,
		paddingVertical: 4,
		textTransform: 'initial'
	}
});

export default ReviewLineMoreInfos;
