import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { tss } from 'tss-react/dsfr';

interface HomeActionButtonProps {
	title: string;
	buttonText: string;
	buttonStyle: 'primary' | 'secondary' | 'tertiary';
}

const HomeActionButton = (props: HomeActionButtonProps) => {
	const { cx, classes } = useStyles();

	return (
		<section className={fr.cx('fr-container', 'fr-py-16v')}>
			<div className={cx(classes.container)}>
				<h2>{props.title}</h2>
				<Button className={cx(fr.cx('fr-my-2v'))} priority={props.buttonStyle}>
					{props.buttonText}
				</Button>
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
