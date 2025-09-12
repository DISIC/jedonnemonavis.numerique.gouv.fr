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
						Les boutons “Je donne mon avis” sont
						<b> visibles par les usagers </b>
						tant que les codes HTML correspondant aux emplacements n’ont pas été
						retirés des pages.
					</p>
					<p className={cx(fr.cx('fr-mb-0'))}>
						Pensez à vérifier que c’est le cas sur votre service numérique.
					</p>
				</div>
			</div>

			<ul className={fr.cx('fr-mt-4v', 'fr-mb-6v', 'fr-ml-2v')}>
				<li>
					Le formulaire ne recevra plus de donnée
					{!isForForm && ' de cet emplacement'}
				</li>
				<li>
					Les usagers n’auront plus accès au formulaire
					{!isForForm && ' via cet emplacement'}
				</li>
				<li>
					Vous aurez toujours accès aux statistiques récoltées avant la
					fermeture{!isForForm ? ' de l’emplacement' : ' du formulaire'}
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
