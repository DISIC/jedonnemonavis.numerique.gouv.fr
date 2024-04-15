import { fr } from '@codegouvfr/react-dsfr';
import { ExtendedReview } from './interface';
import { formatDateToFrenchString, getSeverity } from '@/src/utils/tools';
import { tss } from 'tss-react/dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import React from 'react';
import {
	displayIntention,
	getStatsColor,
	getStatsIcon
} from '@/src/utils/stats';
import Badge from '@codegouvfr/react-dsfr/Badge';
import ReviewVerbatimMoreInfos from './ReviewVerbatimMoreInfos';

const ReviewLineVerbatim = ({ review, search }: { review: ExtendedReview, search: string }) => {
	const color = getStatsColor({
		intention: review.satisfaction?.intention || 'neutral'
	});
	const { cx, classes } = useStyles({ color: color });
	const [displayMoreInfo, setDisplayMoreInfo] = React.useState(false);

	return (
		<div className={cx(classes.container)}>
			<div
				className={cx(classes.line)}
				style={{
					backgroundColor: getStatsColor({
						intention: review.satisfaction?.intention ?? 'neutral',
						kind: 'background'
					}),
					borderColor: getStatsColor({
						intention: review.satisfaction?.intention ?? 'neutral'
					})
				}}
			>
				<div className={cx(classes.line, fr.cx('fr-grid-row'))}>
					<div
						className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2', 'fr-pr-2v')}
					>
						{formatDateToFrenchString(
							review.created_at?.toISOString().split('T')[0] || ''
						)}
					</div>
					<div
						className={cx(
							classes.label,
							fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')
						)}
						style={{
							color: getStatsColor({
								intention: review.satisfaction?.intention ?? 'neutral'
							})
						}}
					>
						{review.satisfaction && review.satisfaction.intention && (
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
								{displayIntention(
									review.satisfaction.intention ?? 'neutral'
								).toUpperCase()}
							</>
						)}
					</div>
					<div
						className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6', 'fr-pr-3v')}
						style={{
							color: getStatsColor({
								intention: review.satisfaction?.intention ?? 'neutral'
							})
						}}
					>
						<p className={cx(classes.content)} dangerouslySetInnerHTML={{ 
							__html: `${review.verbatim ? review.verbatim.answer_text?.replace(new RegExp(search, 'gi'), `<span>${search}</span>`) : 'Non renseigné'}` 
						}}></p>
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
						<Button
							priority="secondary"
							iconPosition="right"
							iconId="fr-icon-arrow-down-s-fill"
							size="small"
							onClick={() => {
								setDisplayMoreInfo(!displayMoreInfo);
							}}
							style={{
								boxShadow: getStatsColor({
									intention: review.satisfaction?.intention ?? 'neutral'
								}),
								border: `solid ${getStatsColor({
									intention: review.satisfaction?.intention ?? 'neutral'
								})} 1px`,
								color: getStatsColor({
									intention: review.satisfaction?.intention ?? 'neutral'
								})
							}}
						>
							{' '}
							Plus d'infos
						</Button>
					</div>
				</div>
			</div>
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
		label: {
			fontWeight: 'bold'
		},
		verbatim: {
			flexShrink: 1
		},
		date: {
			fontSize: 12,
			width: 100,
			flexShrink: 0
		},
		content: {
			'span': {
				backgroundColor: 'yellow'
			}
		}
	}));

export default ReviewLineVerbatim;
