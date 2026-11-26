import { User } from '@/prisma/generated/zod';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import GenericCardInfos from './genericCardAccount';

interface Props {
	user: User;
}

const CredentialsCard = (props: Props) => {
	const { user } = props;

	return (
		<GenericCardInfos
			title={'Identifiants de connexion'}
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
							Adresse e-mail
						</div>
						<div
							className={fr.cx('fr-col-12', 'fr-pt-0', 'fr-mb-4v')}
							style={{ wordBreak: 'break-all' }}
						>
							{user.email}
						</div>
					</div>
					<div role="status">
						<Alert
							small
							severity="info"
							description="Cette adresse est celle de votre compte ProConnect, utilisé pour vous connecter à Je donne mon avis. Pour la modifier, rapprochez-vous de votre fournisseur d'identité ProConnect."
							className={fr.cx('fr-col-12', 'fr-mb-6v')}
						/>
					</div>
				</>
			}
		/>
	);
};

export default CredentialsCard;
