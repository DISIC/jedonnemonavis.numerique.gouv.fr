import { fr } from '@codegouvfr/react-dsfr';
import { ExtendedReview } from './interface';
import { tss } from 'tss-react/dsfr';
import ReviewCommonVerbatimLine from './ReviewCommonVerbatimLine';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { FormConfigWithChildren } from '@/src/types/prismaTypesExtended';

const ReviewLineMoreInfos = ({
	review,
	search,
	formConfig
}: {
	review: ExtendedReview;
	search: string;
	formConfig?: FormConfigWithChildren;
}) => {
	const { cx, classes } = useStyles();

	if (!review) return null;

	const createMarkup = () => {
		if (review.verbatim?.answer_text) {
			const words = search.split(/\s+/).filter(Boolean);
			const regex = new RegExp(`(${words.join('|')})`, 'gi');
			const highlightedText = review.verbatim.answer_text
				.replace(regex, `<span>$1</span>`)
				.replace(/\n/g, '<br />');

			return { __html: highlightedText };
		}
		return { __html: '-' };
	};

	return (
		<div className={cx(fr.cx('fr-p-3v'), classes.container)}>
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
					formConfig={formConfig}
					search={search}
				></ReviewCommonVerbatimLine>
				<div className={fr.cx('fr-col-12')}>
					<h2 className={cx(classes.subtitle)}>
						Souhaitez-vous nous en dire plus ?
					</h2>
					<p
						className={cx(classes.content)}
						dangerouslySetInnerHTML={createMarkup()}
					/>
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
