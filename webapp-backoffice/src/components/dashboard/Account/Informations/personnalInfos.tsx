import { fr } from '@codegouvfr/react-dsfr';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { User } from '@/prisma/generated/zod';
import GenericCardInfos from './genericCardAccount';
import { formatDateToFrenchString } from '@/src/utils/tools';

interface Props {
	user: User;
}

const PersonnalInfos = (props: Props) => {
	const { user } = props;
	const { cx, classes } = useStyles();

	return (
		<>
			<GenericCardInfos
				title={'Informations personnelles'}
				modifiable={false}
				viewModeContent={
					<>
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--middle'
							)}
						>
							<div className={fr.cx('fr-col-12', 'fr-text--bold')}>
								Prénom(s)
							</div>
							<div className={fr.cx('fr-col-12', 'fr-pt-0', 'fr-mb-4v')}>
								{user.firstName}
							</div>
						</div>
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--middle'
							)}
						>
							<div className={fr.cx('fr-col-12', 'fr-text--bold')}>Nom</div>
							<div className={fr.cx('fr-col-12', 'fr-pt-0', 'fr-mb-4v')}>
								{user.lastName}
							</div>
						</div>
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--middle'
							)}
						>
							<div className={fr.cx('fr-col-12', 'fr-text--bold')}>
								Adresse e-mail
							</div>
							<div className={fr.cx('fr-col-12', 'fr-pt-0', 'fr-mb-4v')}>
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
							<div className={fr.cx('fr-col-12', 'fr-text--bold')}>
								Date de création du compte
							</div>
							<div className={fr.cx('fr-col-12', 'fr-pt-0')}>
								{formatDateToFrenchString(user.created_at.toString())}
							</div>
						</div>
					</>
				}
			/>
		</>
	);
};

const useStyles = tss.withName(PersonnalInfos.name).create(() => ({
	actionContainer: {
		display: 'flex',
		justifyContent: 'flex-end'
	}
}));

export default PersonnalInfos;
