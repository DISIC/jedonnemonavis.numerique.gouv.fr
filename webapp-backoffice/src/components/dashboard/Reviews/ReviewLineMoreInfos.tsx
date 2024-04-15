import { fr } from '@codegouvfr/react-dsfr';
import { ExtendedReview } from './interface';
import { tss } from 'tss-react/dsfr';
import ReviewCommonVerbatimLine from './ReviewCommonVerbatimLine';

const ReviewLineMoreInfos = ({ review, search }: { review: ExtendedReview, search: string }) => {
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
				<div className={fr.cx('fr-col-6', 'fr-col-md-1')}>
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
				<div className={fr.cx('fr-col-12', 'fr-col-md-9')}>
					<p className={cx(classes.subtitle)}>Verbatim</p>
					<p className={cx(classes.content)} dangerouslySetInnerHTML={{ 
						__html: `${review.verbatim ? review.verbatim.answer_text?.replace(new RegExp(search, 'gi'), `<span>${search}</span>`) : 'Non renseigné'}` 
					}}></p>
				</div>
			</div>
			<ReviewCommonVerbatimLine
				review={review}
				type={'Line'}
			></ReviewCommonVerbatimLine>
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
		fontSize: 12,
		fontWeight: 'bold',
		marginBottom: 0
	},
	content: {
		fontSize: 12,
		fontWeight: 400,
		marginBottom: 0,
		'span': {
			backgroundColor: 'yellow'
		}
	}
});

export default ReviewLineMoreInfos;
