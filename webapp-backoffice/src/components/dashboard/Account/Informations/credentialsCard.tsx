import { fr } from '@codegouvfr/react-dsfr';
import React, { ReactElement } from 'react';
import { tss } from 'tss-react/dsfr';
import { User } from '@/prisma/generated/zod';
import Button from '@codegouvfr/react-dsfr/Button';
import GenericCardInfos from './genericCardAccount';

interface Props {
	user: User;
}

const CredentialsCard = (props: Props) => {
	const { user } = props;
	return (
		<>
			<GenericCardInfos
				title={'Identifiants de connexion'}
				modifiable={true}
				viewModeContent={
					<>
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--middle'
							)}
						>
							<div className={fr.cx('fr-col-md-12', 'fr-text--bold')}>
								Adresse e-mail
							</div>
							<div className={fr.cx('fr-col-md-12', 'fr-pt-0', 'fr-mb-4v')}>
								{user.email}
							</div>
						</div>
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--middle'
							)}
						>
							<div className={fr.cx('fr-col-md-12', 'fr-text--bold')}>
								Mot de passe
							</div>
							<div
								className={fr.cx(
									'fr-col-md-12',
									'fr-pt-0',
									'fr-password',
									'fr-password'
								)}
							>
								******************
							</div>
						</div>
					</>
				}
				editModeContent={
					<>
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--middle'
							)}
						>
							<div className={fr.cx('fr-col-md-12', 'fr-text--bold')}>
								Adresse e-mail
							</div>
							<div className={fr.cx('fr-col-md-12', 'fr-pt-0', 'fr-mb-4v')}>
								{user.email}
							</div>
						</div>
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--middle'
							)}
						>
							<div className={fr.cx('fr-col-md-12', 'fr-text--bold')}>
								Mot de passe
							</div>
							<div
								className={fr.cx(
									'fr-col-md-12',
									'fr-pt-0',
									'fr-password',
									'fr-password'
								)}
							>
								******************
							</div>
						</div>
					</>
				}
			/>
		</>
	);
};

const useStyles = tss.withName(CredentialsCard.name).create(() => ({
	actionContainer: {
		display: 'flex',
		justifyContent: 'flex-end'
	}
}));

export default CredentialsCard;
