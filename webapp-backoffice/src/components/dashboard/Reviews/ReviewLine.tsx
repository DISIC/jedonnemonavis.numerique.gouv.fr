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
import React, { useEffect } from 'react';
import { tss } from 'tss-react/dsfr';
import { ExtendedReview } from './interface';
import ReviewLineMoreInfos from './ReviewLineMoreInfos';
import Image from 'next/image';
import { push } from '@socialgouv/matomo-next';
import { FormConfigWithChildren } from '@/src/types/prismaTypesExtended';

const ReviewLine = ({
	review,
	search,
	formConfigHelper,
	hasManyVersions
}: {
	review: ExtendedReview;
	search: string;
	formConfigHelper: {
		formConfig?: FormConfigWithChildren;
		versionNumber: number;
	};
	hasManyVersions: boolean;
}) => {
	const { cx, classes } = useStyles();
	const [displayMoreInfo, setDisplayMoreInfo] = React.useState(() => {
		if (search === '') return false;
		const searchWords = search.toLowerCase().split(' ');
		const answerText = review.verbatim?.answer_text?.toLowerCase() || '';
		return searchWords.every(word => answerText.includes(word));
	});

	const { mutate: createReviewViewLog } =
		trpc.reviewViewLog.create.useMutation();

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

	useEffect(() => {
		if (displayMoreInfo)
			createReviewViewLog({
				review_id: review.id as number,
				review_created_at: review.created_at as Date
			});
	}, [displayMoreInfo]);

	return (
		<tr className={cx(classes.container)}>
			<td className={cx(classes.cellContainer)}>
				<div className={cx(classes.date)}>
					<span className={fr.cx('fr-hidden-lg')}>Date : </span>
					{formatDateToFrenchString(
						review.created_at?.toISOString().split('T')[0] || ''
					)}
				</div>
			</td>
			<td className={cx(classes.cellContainer)}>
				<div className={cx(classes.date)}>
					<span className={fr.cx('fr-hidden-lg')}>Heure : </span>
					{review.created_at?.toLocaleTimeString('fr-FR')}
				</div>
			</td>
			{hasManyVersions && (
				<td className={cx(classes.cellContainer)}>
					<div className={cx(classes.date)}>
						<span className={fr.cx('fr-hidden-lg')}>Formulaire : </span>
						Version {formConfigHelper.versionNumber}
					</div>
				</td>
			)}
			<td className={cx(classes.cellContainer)}>
				<div className={cx(classes.date)}>
					<span className={fr.cx('fr-hidden-lg')}>Id : </span>
					{review.id?.toString(16)}
				</div>
			</td>
			{review.button_id ? (
				<td className={cx(classes.cellContainer)}>
					<div className={cx(classes.badge)}>
						<span className={cx(classes.badge, fr.cx('fr-hidden-lg'))}>
							Source :{' '}
						</span>
						{retrieveButtonName(review.button_id)}
					</div>
				</td>
			) : (
				<td className={cx(classes.cellContainer)}>Pas de source</td>
			)}
			<td className={cx(classes.cellContainer)}>
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
							<Image
								alt=""
								src={`/assets/smileys/${getStatsIcon({
									intention: review.satisfaction.intention ?? 'neutral'
								})}.svg`}
								width={15}
								height={15}
							/>
							{displayIntention(review.satisfaction.intention ?? 'neutral')}
						</Badge>
					</>
				)}
			</td>
			<td className={cx(classes.cellContainer)}>
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
			</td>
			<td className={cx(classes.cellContainer)}>
				<Button
					priority="secondary"
					title={`Plus d'infos sur l'avis ${review.id}`}
					iconPosition="right"
					iconId="fr-icon-arrow-down-s-fill"
					aria-expanded={displayMoreInfo ? true : false}
					size="small"
					onClick={() => {
						setDisplayMoreInfo(!displayMoreInfo);
						push(['trackEvent', 'Product - Avis', 'Display-More-Infos']);
					}}
				>
					{' '}
					Détails
				</Button>
			</td>
			{displayMoreInfo && (
				<ReviewLineMoreInfos
					review={review}
					search={search}
					formConfig={formConfigHelper.formConfig}
				/>
			)}
		</tr>
	);
};

const useStyles = tss.create({
	container: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 12,
		flexWrap: 'wrap',
		border: '1px solid',
		borderColor: fr.colors.decisions.border.default.grey.default,
		marginBottom: 12
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
			['&:nth-of-type(2), &:nth-of-type(3)']: {
				flex: '1 1 8%'
			},
			['&:nth-of-type(9)']: {
				flex: '1 1 14%'
			}
		}
	},
	badge: {
		fontSize: 11,
		paddingVertical: 4,
		display: 'flex',
		alignItems: 'center',
		gap: '0.25rem'
	}
});

export default ReviewLine;
