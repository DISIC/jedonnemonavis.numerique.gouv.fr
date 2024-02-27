import { fr } from '@codegouvfr/react-dsfr';
import { ExtendedReview } from './interface';
import { tss } from 'tss-react/dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { getSeverity, retrieveButtonName } from '@/src/utils/tools';
import { displayIntention, getStatsColor, getStatsIcon } from '@/src/utils/stats';
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
				<div className={fr.cx('fr-col-1')}>
					<p className={cx(classes.subtitle)}>Horaire</p>
					<p className={cx(classes.content)}>
						{review.created_at &&
							new Date(review.created_at).getHours() +
								':' +
								new Date(review.created_at).getMinutes()}
					</p>
				</div>
				<div className={fr.cx('fr-col-2')}>
					<p className={cx(classes.subtitle)}>Identifiant</p>
					<p className={cx(classes.content)}>{review.form_id && review.id}</p>
				</div>
				<div className={fr.cx('fr-col-2')}>
					<p className={cx(classes.subtitle)}>Source</p>
					<p className={cx(classes.content)}>
						{review.button_id ? (
							<div className={cx(classes.badge)}>
								{retrieveButtonName(review.button_id)}
							</div>
						) : (
							<div className={cx(classes.badge)}>Pas de source</div>
						)}
					</p>
				</div>
				<div className={fr.cx('fr-col-2')}>
					<p className={cx(classes.subtitle)}>Satisfaction</p>
					<p className={cx(classes.content)}>
						{review.satisfaction && (
							<Badge
								className={cx(classes.badge)}
								small={true}
								noIcon={true}
								severity={getSeverity(review.satisfaction.intention || '')}
							>
								<i
									className={fr.cx(
										getStatsIcon({
											intention: review.satisfaction.intention ?? 'neutral'
										})
									)}
									style={{
										color: getStatsColor({
											intention: review.satisfaction.intention ?? 'neutral'
										})
									}}
								/>
								{displayIntention(review.satisfaction.intention ?? 'neutral')}
							</Badge>
						)}
					</p>
				</div>
				<div className={fr.cx('fr-col-2')}>
					<p className={cx(classes.subtitle)}>Facilité</p>
					<p className={cx(classes.content)}>
						{review.easy && (
							<Badge
								className={cx(classes.badge)}
								small={true}
								noIcon={true}
								severity={getSeverity(review.easy.intention || '')}
							>
								<i
									className={fr.cx(
										getStatsIcon({
											intention: review.easy.intention ?? 'neutral'
										})
									)}
									style={{
										color: getStatsColor({
											intention: review.easy.intention ?? 'neutral'
										})
									}}
								/>
								{displayIntention(review.easy.intention ?? 'neutral')}
							</Badge>
						)}
					</p>
				</div>
				<div className={fr.cx('fr-col-2')}>
					<p className={cx(classes.subtitle)}>Langage</p>
					<p className={cx(classes.content)}>
						{review.comprehension && (
							<Badge
								className={cx(classes.badge)}
								small={true}
								noIcon={true}
								severity={getSeverity(review.comprehension.intention || '')}
							>
								<i
									className={fr.cx(
										getStatsIcon({
											intention: review.comprehension.intention ?? 'neutral'
										})
									)}
									style={{
										color: getStatsColor({
											intention: review.comprehension.intention ?? 'neutral'
										})
									}}
								/>
								{displayIntention(review.comprehension.intention ?? 'neutral')}
							</Badge>
						)}
					</p>
				</div>
			</div>
			<ReviewCommonVerbatimLine review={review} type={'Verbatim'}></ReviewCommonVerbatimLine>
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
		fontSize: 12,
		fontWeight: 'bold',
		marginBottom: 0
	},
	content: {
		fontSize: 12,
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
