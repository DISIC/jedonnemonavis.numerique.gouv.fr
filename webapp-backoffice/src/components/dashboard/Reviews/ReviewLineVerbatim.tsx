import { fr } from '@codegouvfr/react-dsfr';
import { ExtendedReview } from './interface';
import { formatDateToFrenchString, getSeverity } from '@/src/utils/tools';
import { tss } from 'tss-react/dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import React from 'react';
import { displayIntention, getStatsColor, getStatsIcon } from '@/src/utils/stats';
import Badge from '@codegouvfr/react-dsfr/Badge';
import ReviewVerbatimMoreInfos from './ReviewVerbatimMoreInfos';

const ReviewLineVerbatim = ({ review }: { review: ExtendedReview }) => {
	const color = getStatsColor({
		intention: review.satisfaction?.intention || 'neutral'
	});
	const { cx, classes } = useStyles({ color: color });
	const [displayMoreInfo, setDisplayMoreInfo] = React.useState(false);

	return (
		<div className={cx(classes.container)}>
			<Badge
				noIcon
				severity={getSeverity(review.satisfaction?.intention || '')}
				className={cx(classes.line)}
			>
				<div 
						className={cx(classes.line, fr.cx('fr-grid-row'))}>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
						{formatDateToFrenchString(
							review.created_at?.toISOString().split('T')[0] || ''
						)}
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
						{review.satisfaction && review.satisfaction.intention &&
							<>
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
							</>
						}
					</div>
					<div  className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6')}>
						{review.verbatim ? review.verbatim.answer_text : 'Non renseigné'}
					</div>
					<div  className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
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
				
			</Badge>
			{displayMoreInfo && <ReviewVerbatimMoreInfos review={review} />}
		</div>
	);
};

const useStyles = tss
	.withParams<{
		color: string;
	}>()
	.create(({ color }) => ({
		container: {
			display: 'flex',
			flexDirection: 'column',
			border: '1px solid',
			borderColor: color,
			marginBottom: 12,
			width: '100%'
		},
		line: {
			fontSize: 12,
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			padding: 12,
			width: '100%',
			borderRadius: 0,
			fontWeight: 'normal'
		},
		verbatim: {
			flexShrink: 1
		},
		date: {
			fontSize: 12,
			width: 100,
			flexShrink: 0
		}
	}));

export default ReviewLineVerbatim;
