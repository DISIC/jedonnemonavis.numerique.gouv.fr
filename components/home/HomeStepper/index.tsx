import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { tss } from 'tss-react';

interface Step {
	number: number;
	title: string;
}

const HomeStepper = () => {
	const { classes, cx } = useStyles();

	const steps: Step[] = [
		{
			number: 1,
			title: "Inscrivez-vous ou connectez-vous à l'Observatoire"
		},
		{
			number: 2,
			title: 'Trouvez ou ajoutez votre démarche'
		},
		{
			number: 3,
			title: 'Installez le bouton je donne mon avis sur votre site'
		},
		{
			number: 4,
			title:
				'Retrouvez des avis et des graphiques pertinents sur la page de votre démarche'
		}
	];

	return (
		<section className={cx(fr.cx('fr-container'), classes.container)}>
			<h2>Commencez à receuillir des avis en 4 étapes simples :</h2>
			<div
				className={cx(
					fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-grid-row--center')
				)}
			>
				{steps.map(step => (
					<div key={step.number} className={fr.cx('fr-col-12', 'fr-col-md-3')}>
						<div
							className={cx(
								classes.card,
								fr.cx('fr-card', 'fr-card--grey', 'fr-card--no-border')
							)}
						>
							<div className={cx(classes.numberContainer)}>
								<p className={cx(classes.number)}>{step.number}</p>
							</div>
							<div className={cx(classes.title)}>{step.title}</div>
						</div>
					</div>
				))}
			</div>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
				<Button className={fr.cx('fr-my-5w')}>Commencer</Button>
			</div>
		</section>
	);
};

const useStyles = tss
	.withName(HomeStepper.name)
	.withParams()
	.create(() => ({
		container: {
			h2: {
				color: fr.colors.decisions.text.title.blueFrance.default,
				marginBottom: '3rem',
				[fr.breakpoints.down('md')]: {
					marginBottom: '2rem'
				}
			}
		},
		card: {
			...fr.spacing('padding', { top: '3w', bottom: '3w', rightLeft: '3w' }),
			borderBottom: '4px solid #000091',
			backgroundColor: fr.colors.decisions.background.alt.grey.default,
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			[fr.breakpoints.down('md')]: {
				marginBottom: '2rem'
			}
		},
		numberContainer: {
			backgroundColor: '#FFF',
			borderRadius: '50%',
			width: '5rem',
			height: '5rem',
			marginBottom: '1.5rem',
			textAlign: 'center'
		},
		number: {
			color: '#000091',
			fontSize: '4rem',
			lineHeight: '4.5rem',
			fontWeight: 700,
			padding: '0.5rem 0'
		},
		title: {
			textAlign: 'center',
			fontStyle: 'normal',
			fontSize: '1rem',
			fontWeight: 700,
			lineHeight: '1.5rem'
		}
	}));

export default HomeStepper;
