import ErrorPage from '@/src/components/ui/ErrorPage';
import { fr } from '@codegouvfr/react-dsfr';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';

const NotFound = () => (
	<ErrorPage
		title="Page non trouvée"
		code={404}
		lead="La page que vous cherchez est introuvable. Excusez-nous pour la gêne occasionnée."
	>
		<p className={fr.cx('fr-text--sm', 'fr-mb-10v')}>
			Si vous avez tapé l’adresse web dans le navigateur, vérifiez qu’elle est
			correcte. La page n’est peut-être plus disponible.
			<br />
			Dans ce cas, pour continuer votre visite, vous pouvez consulter notre page
			d’accueil.
			<br />
			Sinon contactez-nous pour que l’on puisse vous rediriger vers la bonne
			information.
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

export default NotFound;
