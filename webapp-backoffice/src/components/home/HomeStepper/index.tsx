import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Link from 'next/link';
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
			title:
				'Inscrivez-vous ou connectez-vous à <b>Je donne mon avis (JDMA)</b>'
		},
		{
			number: 2,
			title: 'Ajoutez ou rejoignez votre service'
		},
		{
			number: 3,
			title: 'Installez le bouton JDMA sur votre site'
		},
		{
			number: 4,
			title: 'Récoltez les avis et consultez les graphiques pertinents'
		}
	];

	return (
		<section className={cx(fr.cx('fr-container'), classes.container)}>
			<div className={cx(fr.cx('fr-grid-row', 'fr-grid-row--center'))}>
				<div className={cx(fr.cx('fr-col-12', 'fr-col-md-10'))}>
					<h2>Commencez à recueillir des avis en 4 étapes simples :</h2>
					<ol
						className={cx(
							'no-bullets-point',
							fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--center'
							)
						)}
					>
						{steps.map(step => (
							<li
								key={step.number}
								className={fr.cx('fr-col-12', 'fr-col-md-3')}
							>
								<div
									className={cx(
										classes.card,
										fr.cx('fr-card', 'fr-card--grey', 'fr-card--no-border')
									)}
								>
									<p className={cx(classes.number)}></p>
									<div className={cx(classes.title)}>
										<span
											dangerouslySetInnerHTML={{
												__html: step.title
											}}
										></span>
									</div>
								</div>
							</li>
						))}
					</ol>
					<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
						<Link href="/login" className={fr.cx('fr-mt-5w', 'fr-btn')}>
							Commencer
						</Link>
					</div>
				</div>
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
				...fr.spacing('margin', { bottom: '6w' }),
				[fr.breakpoints.down('md')]: {
					...fr.spacing('margin', { bottom: '3w' })
				}
			},
			[fr.breakpoints.down('md')]: {
				...fr.spacing('margin', { top: '16v' })
			}
		},
		card: {
			...fr.spacing('padding', { top: '3w', bottom: '3w', rightLeft: '3w' }),
			borderBottom: `4px solid ${fr.colors.decisions.background.flat.blueFrance.default}`,
			backgroundColor: fr.colors.decisions.background.alt.grey.default,
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			[fr.breakpoints.down('md')]: {
				...fr.spacing('margin', { bottom: '3w' })
			}
		},
		numberContainer: {
			backgroundColor: fr.colors.decisions.background.default.grey.default,
			borderRadius: '50%',
			width: '5rem',
			height: '5rem',
			...fr.spacing('margin', { bottom: '2w' }),
			textAlign: 'center'
		},
		number: {
			color: fr.colors.decisions.background.flat.blueFrance.default,
			background: 'white',
			fontSize: '4rem',
			width: '5rem',
			height: '5rem',
			borderRadius: '50%',
			textAlign: 'center',
			lineHeight: '4.5rem',
			fontWeight: 700,
			padding: '0.5rem 0'
		},
		title: {
			display: 'flex',
			flexDirection: 'column',
			textAlign: 'center',
			fontStyle: 'normal',
			fontSize: '1rem',
			lineHeight: '1.5rem'
		}
	}));

export default HomeStepper;
