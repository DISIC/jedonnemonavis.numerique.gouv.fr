import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { text } from 'stream/consumers';
import { tss } from 'tss-react/dsfr';

const HomeActionButton = () => {
	const { cx, classes } = useStyles();

	return (
		<section className={fr.cx('fr-container', 'fr-py-16v')}>
			<div className={cx(classes.container)}>
				<h2>Prêt à recueillir les avis des usagers</h2>
				<Button className={fr.cx('fr-my-2v')}>Commencer</Button>
			</div>
		</section>
	);
};

const useStyles = tss
	.withName(HomeActionButton.name)
	.withParams()
	.create(() => ({
		container: {
			h2: {
				color: fr.colors.decisions.text.title.blueFrance.default,
				textAlign: 'center'
			},
			justifyContent: 'center',
			alignItems: 'center',
			display: 'flex',
			flexDirection: 'column'
		}
	}));

export default HomeActionButton;
