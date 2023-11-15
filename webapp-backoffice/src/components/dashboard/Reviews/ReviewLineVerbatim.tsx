import { fr } from '@codegouvfr/react-dsfr';
import { ExtendedReview } from './interface';
import { formatDateToFrenchString, getSeverity } from '@/src/utils/tools';
import { tss } from 'tss-react/dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import React from 'react';
import { getStatsColor } from '@/src/utils/stats';
import Badge from '@codegouvfr/react-dsfr/Badge';

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
				<div>
					{formatDateToFrenchString(
						review.created_at?.toISOString().split('T')[0] || ''
					)}
				</div>
				<div>
					{review.satisfaction
						? review.satisfaction.answer_text
						: 'Non renseigné'}
				</div>
				<div className={cx(classes.verbatim)}>
					{review.verbatim ? review.verbatim.answer_text : 'Non renseigné'}
				</div>
				<div>
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
			</Badge>
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
			gap: 24,
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
