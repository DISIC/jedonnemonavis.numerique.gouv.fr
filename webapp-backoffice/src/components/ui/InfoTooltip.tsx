import { fr } from '@codegouvfr/react-dsfr';
import { Tooltip } from '@codegouvfr/react-dsfr/Tooltip';
import type { ReactNode } from 'react';
import { tss } from 'tss-react/dsfr';

interface InfoTooltipProps {
	/** Tooltip content. */
	title: ReactNode;
	/** Accessible name of the "i" button, e.g. "Pourquoi ce modèle ?". */
	buttonLabel: string;
	className?: string;
}

/**
 * "i" info button that opens a DSFR tooltip on hover AND on keyboard focus.
 *
 * DSFR's hover tooltip listens to mouseover and focusin on its owner span;
 * focusin bubbles, so the focusable <button> inside also opens it.
 * Escape closes it (handled by DSFR).
 */
const InfoTooltip = ({ title, buttonLabel, className }: InfoTooltipProps) => {
	const { classes, cx } = useStyles();

	return (
		<span className={classes.root}>
			<Tooltip kind="hover" className={className} title={title}>
				<button
					type="button"
					className={cx(classes.button, fr.cx('ri-information-line'))}
					aria-label={buttonLabel}
				/>
			</Tooltip>
		</span>
	);
};

const useStyles = tss.withName({ InfoTooltip }).create({
	root: {
		display: 'inline-flex',
		alignItems: 'center',
		alignSelf: 'center',

		'& > [id^="tooltip-owner-"]': {
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center'
		}
	},
	button: {
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 0,
		border: 'none',
		background: 'none',
		cursor: 'pointer',
		color: fr.colors.decisions.text.actionHigh.blueFrance.default
	}
});

export default InfoTooltip;
