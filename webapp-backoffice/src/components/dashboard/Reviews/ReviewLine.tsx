import { getStatsColor, getStatsIcon } from '@/src/utils/stats';
import { formatDateToFrenchString, getSeverity, retrieveButtonName } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { ExtendedReview } from './interface';
import ReviewLineMoreInfos from './ReviewLineMoreInfos';

const ReviewLine = ({ review }: { review: ExtendedReview }) => {
	const { cx, classes } = useStyles();
	const [displayMoreInfo, setDisplayMoreInfo] = React.useState(false);

	const displayIntention = (intention: string) => {
		switch (intention) {
			case 'bad':
				return 'Mauvais';
			case 'medium':
				return 'Moyen';
			case 'good':
				return 'Très bien';
			case 'neutral':
				return 'Neutre';
			default:
				return '';
		}
	};

	return (
		<div className={cx(classes.container)}>
			<div className={cx(classes.lineContainer)}>
				<div className={cx(classes.date)}>
					{formatDateToFrenchString(
						review.created_at?.toISOString().split('T')[0] || ''
					)}
				</div>
				<div className={cx(classes.badge)}>
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
				</div>
				<div className={cx(classes.badge)}>
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
				</div>
				<div className={cx(classes.badge)}>
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
				</div>
				<Badge
					className={cx(classes.badge)}
					noIcon
					severity={review.verbatim ? 'info' : 'error'}
				>
					{review.verbatim ? 'Verbatim' : 'Non'}
				</Badge>
				{review.button_id ? (
					<div className={cx(classes.badge)}>
						{retrieveButtonName(review.button_id)}
					</div>
				) : (
					<div className={cx(classes.badge)}>Pas de source</div>
				)}
				<Button
					priority="secondary"
					iconPosition="right"
					iconId="fr-icon-arrow-down-s-fill"
					size="small"
					onClick={() => {
						setDisplayMoreInfo(!displayMoreInfo);
					}}
				>
					{' '}
					Plus d'infos
				</Button>
			</div>
			{displayMoreInfo && <ReviewLineMoreInfos review={review} />}
		</div>
	);
};

const useStyles = tss.create({
	container: {
		display: 'flex',
		flexDirection: 'column',
		border: '1px solid',
		borderColor: fr.colors.decisions.border.default.grey.default,
		marginBottom: 12
	},
	lineContainer: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 12,
		gap: 12
	},
	date: {
		fontSize: 12,
		width: 100
	},
	badge: {
		fontSize: 12,
		width: 100,
		paddingVertical: 4
	}
});

export default ReviewLine;
