import ErrorPage from '@/src/components/ui/ErrorPage';
import { fr } from '@codegouvfr/react-dsfr';

const PublicStatsNotFound = () => (
	<ErrorPage
		title="Page non trouvée"
		code={404}
		lead={
			<>
				La page que vous cherchez est introuvable. Si vous souhaitez consulter
				les statistiques de qualité des démarches les plus utilisées par les
				françaises et les français vous pouvez consulter l’observatoire{' '}
				<a
					className={fr.cx(
						'fr-link',
						'fr-link--icon-right',
						'fr-icon-external-link-line',
						'fr-text--lg'
					)}
					href="https://observatoire.numerique.gouv.fr/"
					target="_blank"
					rel="noopener noreferrer"
				>
					Vos démarches essentielles
					<span className={fr.cx('fr-sr-only')}>
						{' '}
						(ouvre une nouvelle fenêtre)
					</span>
				</a>
			</>
		}
	/>
);

export default PublicStatsNotFound;
