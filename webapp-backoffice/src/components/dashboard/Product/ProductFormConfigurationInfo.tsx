import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { tss } from 'tss-react/dsfr';
import Image from 'next/image';
import Button from '@codegouvfr/react-dsfr/Button';

interface Props {
	onButtonClick: () => void;
}
const ProductFormConfigurationInfo = (props: Props) => {
	const { onButtonClick } = props;
	const { cx, classes } = useStyles();

	return (
		<div className={cx(classes.container)}>
			<div>
				<Badge severity="new">Beta</Badge>
				<h4 className={cx(classes.title, fr.cx('fr-my-2v'))}>
					Personnalisez le formulaire du service
				</h4>
				<p className={fr.cx('fr-mb-1v')}>
					Désormais, pour adapter vos formulaires à vos besoins spécifiques,
					vous pouvez :
				</p>
				<ul className={cx(classes.infoList)}>
					<li>✅ Masquer une possibilité de réponse à une question</li>
					<li>✅ Masquer une question entière </li>
					<li>✅ Ajouter des questions supplémentaires</li>
				</ul>
				<p className={fr.cx('fr-mb-0')}>
					Pour en savoir plus sur ces fonctionnalités et découvrir celles à
					venir, vous pouvez{' '}
					<a href="/roadmap" target="_blank">
						consulter notre feuille de route
					</a>
					.
				</p>
				<h4 className={cx(classes.title, fr.cx('fr-mt-8v', 'fr-mb-2v'))}>
					Prévisualisez et publiez en un clic
				</h4>
				<p>
					Prévisualisez les changements et testez le formulaire, puis publiez le
					nouveau formulaire, sans changer de lien.
					<br />
					Vos usagers auront directement accès au formulaire modifié.
				</p>
				<Button
					iconId="fr-icon-settings-5-line"
					iconPosition="right"
					onClick={onButtonClick}
				>
					Configurer le formulaire
				</Button>
			</div>
			<div>
				<Image
					src="/assets/in-progress.png"
					alt="Fonctionnalité en construction"
					width={180}
					height={180}
				/>
			</div>
		</div>
	);
};

const useStyles = tss.create({
	container: {
		backgroundColor: fr.colors.decisions.background.contrast.blueFrance.default,
		padding: fr.spacing('6v'),
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: fr.spacing('10v')
	},
	title: {
		...fr.typography[0].style
	},
	infoList: {
		listStyleType: 'none',
		...fr.typography[19].style
	}
});

export default ProductFormConfigurationInfo;
