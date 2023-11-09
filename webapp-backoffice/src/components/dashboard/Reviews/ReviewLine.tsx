import {
	ReviewPartialWithRelations,
	AnswerPartialWithRelations
} from '@/prisma/generated/zod';
import { getStatsColor, getStatsIcon } from '@/src/utils/stats';
import { formatDateToFrenchString } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { Skeleton } from '@mui/material';
import { tss } from 'tss-react/dsfr';

interface ExtendedReview extends ReviewPartialWithRelations {
	satisfaction: AnswerPartialWithRelations | undefined;
	easy: AnswerPartialWithRelations | undefined;
	comprehension: AnswerPartialWithRelations | undefined;
	verbatim: AnswerPartialWithRelations | undefined;
}

const ReviewLine = ({ review }: { review: ExtendedReview }) => {
	const { cx, classes } = useStyles();
	console.log('review', review);

	const getSeverity = (intention: string) => {
		switch (intention) {
			case 'bad':
				return 'error';
			case 'medium':
				return 'new';
			case 'good':
				return 'success';
			case 'neutral':
				return 'info';
			default:
				return 'info';
		}
	};

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

	const retrieveButtonName = (buttonId: number) => {
		const { data: button } = trpc.button.getById.useQuery({
			id: buttonId
		});
		if (button?.data) return button.data?.title || '';
	};

	return (
		<div className={cx(classes.lineContainer)}>
			<div
				className={cx(
					fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-grid-row--middle'),
					classes.grid
				)}
			>
				<div className={cx(fr.cx('fr-col-2'), classes.date)}>
					{formatDateToFrenchString(
						review.created_at?.toISOString().split('T')[0] || ''
					)}
				</div>
				{review.satisfaction && (
					<Badge
						className={cx(fr.cx('fr-col-2'), classes.badge)}
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
				{review.easy && (
					<Badge
						className={cx(fr.cx('fr-col-2'), classes.badge)}
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
				{review.comprehension && (
					<Badge
						className={cx(fr.cx('fr-col-2'), classes.badge)}
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
				<Badge
					className={cx(fr.cx('fr-col-2'), classes.badge)}
					severity={review.verbatim ? 'info' : 'error'}
				>
					{review.verbatim ? 'Verbatim' : 'Non'}
				</Badge>
				{review.button_id ? (
					<div className={cx(fr.cx('fr-col-2'))}>
						{retrieveButtonName(review.button_id)}
					</div>
				) : (
					<div className={fr.cx('fr-col-2')}>Pas de source</div>
				)}
			</div>
			<div className={cx(classes.button)}>
				<Button
					priority="secondary"
					iconPosition="right"
					iconId="fr-icon-arrow-down-s-fill"
					size="small"
				>
					{' '}
					Plus d'infos
				</Button>
			</div>
		</div>
	);
};

const useStyles = tss.create({
	lineContainer: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		border: '1px solid',
		borderColor: fr.colors.decisions.border.default.grey.default,
		padding: 12,
		marginBottom: 12
	},
	grid: {
		flexGrow: 1,
		alignItems: 'center',
		gap: 12
	},
	date: {
		fontSize: 12
	},
	badge: {
		fontSize: 12,
		paddingVertical: 4
	},
	button: {
		marginLeft: 12
	}
});

export default ReviewLine;
