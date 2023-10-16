import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import type { WhiteListedDomain } from '@prisma/client';
import { tss } from 'tss-react/dsfr';

type Props = {
	whitelist: WhiteListedDomain;
};

const WhitelistCard = ({ whitelist }: Props) => {
	const { cx, classes } = useStyles();

	return (
		<div className={fr.cx('fr-card', 'fr-my-3w', 'fr-p-2w')}>
			<div
				className={fr.cx(
					'fr-grid-row',
					'fr-grid-row--gutters',
					'fr-grid-row--middle'
				)}
			>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-8')}>
					<span className={classes.spanDomainName}>@{whitelist.domain}</span>
				</div>
				<div
					className={cx(
						fr.cx('fr-col', 'fr-col-12', 'fr-col-md-4'),
						classes.wrapperButtons
					)}
				>
					<Button
						priority="tertiary"
						iconId="fr-icon-delete-bin-line"
						iconPosition="right"
						className={cx(fr.cx('fr-mr-5v'), classes.errorColor)}
					>
						Supprimer
					</Button>
					<Button
						priority="secondary"
						iconId="fr-icon-edit-line"
						iconPosition="right"
					>
						Modifier
					</Button>
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.withName(WhitelistCard.name).create(() => ({
	spanDomainName: {
		fontWeight: 'bold'
	},
	errorColor: {
		color: fr.colors.decisions.text.default.error.default
	},
	wrapperButtons: {
		display: 'flex',
		justifyContent: 'end'
	}
}));

export default WhitelistCard;
