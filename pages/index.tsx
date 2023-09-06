import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Image from 'next/image';
import HomeStepper from '@/components/home/HomeStepper';

export default function Home() {
	const { classes, cx } = useStyles();

	return (
		<div>
			<section>
				<div className={fr.cx('fr-container')}>
					<div
						className={fr.cx(
							'fr-py-16v',
							'fr-grid-row',
							'fr-grid-row--gutters'
						)}
					>
						<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6')}>
							<h1 className={cx(classes.headerTitle)}>
								Comment suivre la satisfaction de vos usagers ?
							</h1>
							<p>
								Avec l’outil Je donne mon avis, suivez-vous en temps réel la
								satisfaction des usagers de vos services publics numériques.
							</p>
						</div>
						<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6')}>
							<Image
								className={cx(classes.headerImage)}
								src={'/assets/header_home.png'}
								alt=""
								width={223}
								height={456}
							/>
						</div>
					</div>
				</div>
			</section>
			<HomeStepper />
		</div>
	);
}

const useStyles = tss
	.withName(Home.name)
	.withParams()
	.create(() => ({
		headerTitle: {
			fontSize: '2.5rem',
			lineHeight: '3.5rem',
			fontWeight: 700,
			color: '#000091',
			marginBottom: '1.5rem',
			[fr.breakpoints.down('md')]: {
				fontSize: '2rem',
				lineHeight: '2.5rem'
			}
		},
		headerImage: {
			[fr.breakpoints.down('md')]: {
				display: 'none'
			}
		}
	}));
