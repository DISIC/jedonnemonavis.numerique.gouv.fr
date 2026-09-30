import ErrorPage from '@/src/components/ui/ErrorPage';
import { fr } from '@codegouvfr/react-dsfr';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';

const ServerError = ({ code = 500 }: { code?: number }) => (
	<ErrorPage
		title="Erreur inattendue"
		code={code}
		lead="Désolé, le service rencontre un problème, nous travaillons pour le résoudre le plus rapidement possible."
	>
		<p className={fr.cx('fr-text--sm', 'fr-mb-10v')}>
			Essayez de rafraîchir la page, sinon merci de réessayer plus tard.
			<br />
			Si vous avez besoin d’une aide immédiate, merci de nous contacter
			directement.
		</p>
		<ButtonsGroup
			inlineLayoutWhen="md and up"
			buttons={[
				{ children: 'Page d’accueil', linkProps: { href: '/' } },
				{
					children: 'Contactez-nous',
					priority: 'secondary',
					linkProps: { href: '/public/contact' }
				}
			]}
		/>
	</ErrorPage>
);

export default ServerError;
