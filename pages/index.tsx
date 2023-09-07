import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Image from 'next/image';
import HomeStepper from '@/components/home/HomeStepper';
import HomeFeatureDisplay from '@/components/home/HomeFeatureDisplay';
import { ReactElement } from 'react';
import HomePills from '@/components/home/HomePills';
import HomeReferences from '@/components/home/HomeReferences';
import HomeActionButton from '@/components/home/HomeActionButton';

interface Feature {
	icon: ReactElement<any, any>;
	title: string;
	description: string;
	image: string;
	imagePosition: 'left' | 'right';
}

export interface Pill {
	title: string;
	description: string;
}

export interface Reference {
	image_path: string;
	author: string;
	job_title: string;
	description: string;
}

export default function Home() {
	const { classes, cx } = useStyles();

	const features: Feature[] = [
		{
			icon: <i className={fr.cx('ri-award-line')} />,
			title: 'Suivez la qualité de vos services, gratuitement',
			description:
				'L’outil Je donne mon avis est disponible pour toute administration publique, gratuitement. Il se place à la fin de vos démarches administratives, pour récolter l’avis de vos usagers et suivre la qualité de vos service et son évolution dans le temps.',
			image: '/assets/feature_1.png',
			imagePosition: 'right'
		},
		{
			icon: <i className={fr.cx('ri-cup-line')} />,
			title: 'Installation facile, le temps de votre pause café',
			description:
				'Le bouton Je donne mon avis s’installe en un rien de temps sur votre site ! Vous n’avez qu’à insérer une petite portion de code HTML, ce qui ne vous prendra pas plus de 5 minutes. Notre plateforme s’occupe ensuite de récolter les avis pour vous.',
			image: '/assets/feature_2.png',
			imagePosition: 'left'
		},
		{
			icon: <i className={fr.cx('ri-chat-3-line')} />,
			title: 'Récoltez des notes et des verbatims en temps réel',
			description:
				'Le bouton Je donne mon avis permet aux usagers de vos démarches en ligne de noter la qualité globale du service, ainsi que la facilité d’usage et la simplicité du langague. Il leur permet également de vous transmettre des retours écris détaillés.',
			image: '/assets/feature_3.png',
			imagePosition: 'right'
		},
		{
			icon: <i className={fr.cx('ri-line-chart-line')} />,
			title: 'Suivez l’évolution grace à des graphiques pertinents',
			description:
				'En plus de vous permettre de consulter chacun des avis, notre plateforme met à votre dispositon des graphiques pertinents pour suivre avec précision la niveau et la variation dans le temps des indicateurs clés de qualité de vos services numériques.',
			image: '/assets/feature_4.png',
			imagePosition: 'left'
		}
	];

	const pills: Pill[] = [
		{
			title: 'Gratuit',
			description: 'Gratuit, concu pour les administrations publiques'
		},
		{
			title: 'RGAA',
			description: 'Accessible à toutes et tous, conforme au RGAA'
		},
		{
			title: 'RGPD',
			description: 'Respectueux de la vie privée, conforme au RGPD'
		}
	];

	const references: Reference[] = [
		{
			image_path: '/assets/temoignage_1.jpeg',
			description:
				'« Le bouton je donne mon avis, que nous avons installé pour récolter les avis des usagers de la démarche de paiement des impôt en ligne, nous a fournis les pistes pour augmenter le taux de satisfaction de 20% en un an ! »',
			author: 'Fabienne D.',
			job_title: 'Responsable projet à la DGFIP'
		},
		{
			image_path: '/assets/temoignage_2.jpeg',
			description:
				'« Cela nous a pris moins de 2h pour configurer et installer le bouton Je donne mon avis. Le code est extrèment simple et la procédure bien indiquée. »',
			author: 'Mathilde P.',
			job_title:
				'Directrice technique au ministère des Solidarité et de la Santé'
		}
	];

	const displayHomeFeature = () => {
		return features.map((feature, index) => (
			<HomeFeatureDisplay
				key={index}
				icon={feature.icon}
				title={feature.title}
				description={feature.description}
				image={feature.image}
				imagePosition={feature.imagePosition}
			/>
		));
	};

	return (
		<div>
			<section>
				<div className={cx(classes.blueContainer)} />
				<div className={fr.cx('fr-container')}>
					<div
						className={fr.cx(
							'fr-py-16v',
							'fr-grid-row',
							'fr-grid-row--gutters'
						)}
					>
						<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6')}>
							<div className={cx(classes.titleContainer)}>
								<h1 className={cx(classes.headerTitle)}>
									Comment suivre la satisfaction de vos usagers ?
								</h1>
								<p>
									Avec l’outil Je donne mon avis, suivez-vous en temps réel la
									satisfaction des usagers de vos services publics numériques.
								</p>
							</div>
						</div>
						<div
							className={cx(
								fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6'),
								classes.image
							)}
						>
							<Image
								className={cx(classes.headerImage)}
								src={'/assets/header_home.png'}
								alt=""
								width={351}
								height={584}
							/>
						</div>
					</div>
				</div>
			</section>
			<HomeStepper />
			{displayHomeFeature()}
			<HomePills pills={pills} />
			<HomeReferences references={references} />
			<HomeActionButton />
		</div>
	);
}

const useStyles = tss
	.withName(Home.name)
	.withParams()
	.create(() => ({
		titleContainer: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			height: '100%'
		},
		blueContainer: {
			backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
			width: '100%',
			height: '100%',
			transform: 'translateY(-50%) skewY(-4deg)',
			zIndex: -1,
			position: 'absolute'
		},
		headerTitle: {
			color: fr.colors.decisions.text.title.blueFrance.default,
			marginBottom: '1.5rem',
			[fr.breakpoints.down('md')]: {
				fontSize: '2rem',
				lineHeight: '2.5rem'
			}
		},
		image: {
			display: 'flex',
			justifyContent: 'flex-end'
		},
		headerImage: {
			[fr.breakpoints.down('md')]: {
				display: 'none'
			}
		}
	}));
