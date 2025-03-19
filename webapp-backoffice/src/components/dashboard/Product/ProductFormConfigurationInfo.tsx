import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { tss } from 'tss-react/dsfr';

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
				<h3 className={cx(classes.title, fr.cx('fr-my-2v'))}>
					Personnalisez le formulaire du service
				</h3>
				<p className={fr.cx('fr-mb-0')}>
					Ici, un texte qui présente la première fonctionnalité de la solution à
					qui il faudrait donner un nom.
					<br />
					Un lien qui renvoie vers la{' '}
					<a href="" target="_blank">
						feuille de route
					</a>
				</p>
			</div>
			<div>
				<Button iconId="fr-icon-settings-5-line" iconPosition="right">
					Configurer
				</Button>
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
		gap: fr.spacing('16v')
	},
	title: {
		...fr.typography[0].style
	}
});

export default ProductFormConfigurationInfo;
