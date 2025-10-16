import { fr } from '@codegouvfr/react-dsfr';
import Image from 'next/image';
import { tss } from 'tss-react/dsfr';

const DeleteButtonOrFormPanel = ({ isForForm }: { isForForm?: boolean }) => {
	const { cx, classes } = useStyles();

	return (
		<div className={cx(classes.container)}>
			<div
				className={cx(classes.blueContainer, fr.cx('fr-container', 'fr-p-6v'))}
			>
				<Image
					src="/assets/install_picto.svg"
					alt="Picto bulles de discussion"
					width={120}
					height={120}
				/>
				<div className={fr.cx('fr-ml-4w')}>
					<p className={cx(fr.cx('fr-mb-3v'))}>
						Fermer un lien d’intégration ne supprime pas le bouton Je Donne Mon
						Avis de votre site.{' '}
						<strong>Il est toujours visible par les usagers.</strong>
					</p>
					<p className={cx(fr.cx('fr-mb-0'))}>
						Pensez à supprimer le code correspondant sur votre site ou sur
						Démarche Simplifiée.
					</p>
				</div>
			</div>

			<ul className={fr.cx('fr-mt-4v', 'fr-mb-6v', 'fr-ml-2v')}>
				<li>
					Le formulaire ne recevra plus de donnée
					{!isForForm && ' de ce bouton'}
				</li>
				<li>
					Les usagers n’auront plus accès au formulaire
					{!isForForm && ' via ce bouton'}
				</li>
				<li>
					Vous aurez toujours accès aux statistiques récoltées avant la
					fermeture{!isForForm ? " du lien d'intégration" : ' du formulaire'}
				</li>
				<li>Cette action est irréversible</li>
			</ul>
		</div>
	);
};

const useStyles = tss.create({
	container: {
		display: 'flex',
		justifyContent: 'start',
		alignItems: 'start',
		flexDirection: 'column'
	},
	blueContainer: {
		background: fr.colors.decisions.artwork.decorative.blueFrance.default,
		display: 'flex',
		justifyContent: 'start',
		alignItems: 'center'
	}
});

export default DeleteButtonOrFormPanel;
