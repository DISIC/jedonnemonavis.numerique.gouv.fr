import { fr } from '@codegouvfr/react-dsfr';
import Link from 'next/link';
import { tss } from 'tss-react/dsfr';

interface HomeActionButtonProps {
	title: string;
	buttonText: string;
	buttonLink: string;
	buttonStyle: 'primary' | 'secondary' | 'tertiary' | 'link';
}

const HomeActionButton = (props: HomeActionButtonProps) => {
	const { cx, classes } = useStyles();

	return (
		<section className={cx(classes.mainContainer, fr.cx('fr-py-16v'))}>
			<div className={cx(classes.container, fr.cx('fr-container'))}>
				<h2>{props.title}</h2>
				{props.buttonStyle !== 'link' ? (
					<Link
						href={props.buttonLink}
						className={cx(
							fr.cx(
								'fr-my-2v',
								'fr-btn',
								props.buttonStyle !== 'primary' &&
									`fr-btn--${props.buttonStyle}`
							)
						)}
					>
						{props.buttonText}
					</Link>
				) : (
					<div>
						<i className={fr.cx('fr-icon-mail-line', 'fr-mr-1v')} />
						<span>{props.buttonText}</span>{' '}
						<Link
							href={`mailto:props.buttonLink`}
							className={cx(fr.cx('fr-link'))}
						>
							{props.buttonLink}
						</Link>
						<span>.</span>
					</div>
				)}
			</div>
		</section>
	);
};

const useStyles = tss
	.withName(HomeActionButton.name)
	.withParams()
	.create(() => ({
		mainContainer: {
			backgroundColor: fr.colors.decisions.background.alt.blueFrance.default
		},
		container: {
			h2: {
				color: fr.colors.decisions.text.title.blueFrance.default,
				textAlign: 'center'
			},
			i: {
				color: fr.colors.decisions.text.title.blueFrance.default
			},
			justifyContent: 'center',
			alignItems: 'center',
			display: 'flex',
			flexDirection: 'column'
		}
	}));

export default HomeActionButton;
