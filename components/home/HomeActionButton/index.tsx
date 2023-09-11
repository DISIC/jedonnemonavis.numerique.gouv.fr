import { fr } from '@codegouvfr/react-dsfr';
import Link from 'next/link';
import { tss } from 'tss-react/dsfr';

interface HomeActionButtonProps {
	title: string;
	buttonText: string;
	buttonLink: string;
	buttonStyle: 'primary' | 'secondary' | 'tertiary';
}

const HomeActionButton = (props: HomeActionButtonProps) => {
	const { cx, classes } = useStyles();

	return (
		<section className={fr.cx('fr-container', 'fr-py-16v')}>
			<div className={cx(classes.container)}>
				<h2>{props.title}</h2>
				<Link
					href={props.buttonLink}
					className={cx(
						fr.cx(
							'fr-my-2v',
							'fr-btn',
							props.buttonStyle !== 'primary' && `fr-btn--${props.buttonStyle}`
						)
					)}
				>
					{props.buttonText}
				</Link>
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
