import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import type { WhiteListedDomain } from '@prisma/client';
import { tss } from 'tss-react/dsfr';

type Props = {
	domain: WhiteListedDomain;
	setCurrentDomain: (
		domain: WhiteListedDomain & { type: 'create' | 'on-confirm' | 'delete' }
	) => void;
};

const DomainCard = ({ domain, setCurrentDomain }: Props) => {
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
					<span className={classes.spanDomainName}>@{domain.domain}</span>
				</div>
				<div
					className={cx(
						fr.cx('fr-col', 'fr-col-12', 'fr-col-md-4'),
						classes.wrapperButtons
					)}
				>
					<Button
						iconId="fr-icon-delete-bin-line"
						priority="tertiary"
						size="small"
						title="Supprimer le domaine"
						onClick={() => setCurrentDomain({ ...domain, type: 'on-confirm' })}
						className={cx(fr.cx('fr-mr-md-5v'), classes.deleteButton)}
					>Supprimer</Button>
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.withName(DomainCard.name).create(() => ({
	spanDomainName: {
		fontWeight: 'bold'
	},
	deleteButton: {
		color: fr.colors.decisions.text.default.error.default,
		[fr.breakpoints.down('md')]: {
			justifyContent: 'center',
			width: '100%'
		}
	},
	wrapperButtons: {
		display: 'flex',
		justifyContent: 'end'
	}
}));

export default DomainCard;
