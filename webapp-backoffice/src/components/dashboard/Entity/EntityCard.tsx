import { OnButtonClickEntityParams } from '@/src/pages/administration/dashboard/entities';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Entity } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { tss } from 'tss-react/dsfr';
import { createModal } from '@codegouvfr/react-dsfr/Modal';

type Props = {
	entity: Entity;
	isMine: boolean;
	fromSearch?: boolean;
	onButtonClick: ({ type, entity }: OnButtonClickEntityParams) => void;
};

const EntityCard = ({ entity, isMine, onButtonClick, fromSearch }: Props) => {
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
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6')}>
					<p
						className={cx(
							fr.cx('fr-mb-0', fromSearch ? 'fr-text--sm' : 'fr-text--md'),
							classes.spanFullName
						)}
					>
						{entity.name}{' '}
						<span className={cx(fr.cx('fr-hint-text'), classes.acronym)}>
							({entity.acronym})
						</span>
					</p>
				</div>
				<div
					className={cx(
						fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6'),
						classes.wrapperButtons
					)}
				>
					{isMine ? (
						<>
							<Button
								priority="secondary"
								size="small"
								iconId="fr-icon-admin-line"
								iconPosition="right"
								className={classes.button}
								onClick={() => {
									onButtonClick({ type: 'rights', entity });
								}}
							>
								Gérer les administrateurs
							</Button>
							<Button
								priority="secondary"
								size="small"
								iconId="fr-icon-lock-unlock-line"
								iconPosition="right"
								className={classes.button}
								onClick={() => {
									onButtonClick({ type: 'api', entity });
								}}
							>
								Clés API
							</Button>
							<Button
								priority="secondary"
								size="small"
								iconId="fr-icon-edit-line"
								iconPosition="right"
								onClick={() => {
									onButtonClick({ type: 'edit', entity });
								}}
								className={classes.button}
							>
								Modifier
							</Button>
						</>
					) : (
						<Button
							priority="secondary"
							size="small"
							className={classes.button}
							onClick={() => {
								onButtonClick({ type: 'rights', entity });
							}}
						>
							{fromSearch ? 'Devenir administrateur' : 'Voir plus'}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.withName(EntityCard.name).create(() => ({
	spanFullName: {
		fontWeight: 'bold'
	},
	iconSuccess: {
		color: 'green'
	},
	iconError: {
		color: fr.colors.decisions.text.default.error.default
	},
	wrapperButtons: {
		display: 'flex',
		justifyContent: 'end'
	},
	entityEmail: {
		wordWrap: 'break-word'
	},
	button: {
		'&:not(:last-of-type)': {
			marginRight: fr.spacing('4v')
		}
	},
	acronym: {
		display: 'inline-block',
		marginLeft: fr.spacing('1v')
	}
}));

export default EntityCard;
