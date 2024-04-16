import { getStatsColor, getStatsIcon } from '@/src/utils/stats';
import {
	formatDateToFrenchString,
	getSeverity,
	retrieveButtonName
} from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { ExtendedReview } from './interface';
import ReviewLineMoreInfos from './ReviewLineMoreInfos';

const ReviewLine = ({ review, search }: { review: ExtendedReview, search: string }) => {
	const { cx, classes } = useStyles();
	const [displayMoreInfo, setDisplayMoreInfo] = React.useState(search !== '' && review.verbatim?.answer_text?.toLowerCase().includes(search.toLowerCase()) || false);

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
				<div className={cx(classes.cellContainer)}>
					<div className={cx(classes.date)}>
						<span className={fr.cx('fr-hidden-lg')}>Date : </span>
						{formatDateToFrenchString(
							review.created_at?.toISOString().split('T')[0] || ''
						)}
					</div>
				</div>
				<div className={cx(classes.cellContainer)}>
					<div className={cx(classes.date)}>
						<span className={fr.cx('fr-hidden-lg')}>Heure : </span>
						{review.created_at?.toLocaleTimeString('fr-FR')}
					</div>
				</div>
				<div className={cx(classes.cellContainer)}>
					<div className={cx(classes.date)}>
						<span className={fr.cx('fr-hidden-lg')}>Id : </span>
						{review.id}
					</div>
				</div>
				<div className={cx(classes.cellContainer)}>
					{review.satisfaction && (
						<>
							<span className={cx(classes.badge, fr.cx('fr-hidden-lg'))}>
								Satisfaction :{' '}
							</span>
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
						</>
					)}
				</div>
				<div className={cx(classes.cellContainer)}>
					{review.easy && (
						<>
							<span className={cx(classes.badge, fr.cx('fr-hidden-lg'))}>
								Facilité :{' '}
							</span>
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
						</>
					)}
				</div>
				<div className={cx(classes.cellContainer)}>
					{review.comprehension && (
						<>
							<span className={cx(classes.badge, fr.cx('fr-hidden-lg'))}>
								Langage :{' '}
							</span>
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
						</>
					)}
				</div>
				<div className={cx(classes.cellContainer)}>
					<>
						<span className={cx(classes.badge, fr.cx('fr-hidden-lg'))}>
							Verbatim :{' '}
						</span>
						<Badge
							className={cx(classes.badge)}
							noIcon
							severity={review.verbatim ? 'info' : 'error'}
						>
							{review.verbatim ? 'Verbatim' : 'Non'}
						</Badge>
					</>
				</div>
				{review.button_id ? (
					<div className={cx(classes.cellContainer)}>
						<div className={cx(classes.badge)}>
							<span className={cx(classes.badge, fr.cx('fr-hidden-lg'))}>
								Source :{' '}
							</span>
							{retrieveButtonName(review.button_id)}
						</div>
					</div>
				) : (
					<div className={cx(classes.cellContainer)}>Pas de source</div>
				)}
				<div className={cx(classes.cellContainer)}>
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
			</div>
			{displayMoreInfo && <ReviewLineMoreInfos review={review} search={search} />}
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
		flexWrap: 'wrap',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 12
	},
	date: {
		fontSize: 12
	},
	cellContainer: {
		flex: '1 1 10%',
		[fr.breakpoints.down('lg')]: {
			flex: '50%',
			marginTop: 12
		},
		[fr.breakpoints.up('lg')]: {
			['&:nth-child(2), &:nth-child(3)']: {
				flex: "1 1 8%"
			},
			['&:nth-child(9)']: {
				flex: "1 1 14%"
			}
		},
	},
	badge: {
		fontSize: 11,
		paddingVertical: 4
	}
});

export default ReviewLine;
