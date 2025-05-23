import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Image from 'next/image';
import HomeStepper from '@/src/components/home/HomeStepper';
import HomeFeatureDisplay, {
	Feature
} from '@/src/components/home/HomeFeatureDisplay';
import { ReactElement } from 'react';
import HomePills, { Pill } from '@/src/components/home/HomePills';
import HomeReferences, {
	Reference
} from '@/src/components/home/HomeReferences';
import HomeActionButton from '@/src/components/home/HomeActionButton';
import HomeQuestions, { Question } from '@/src/components/home/HomeQuestions';
import HomeHeader from '@/src/components/home/HomeHeader';
import Head from 'next/head';

export default function Home() {
	const features: Feature[] = [
		{
			icon: <i className={fr.cx('ri-award-line')} />,
			title: 'Suivez la qualité de vos services, gratuitement',
			description:
				'L’outil Je donne mon avis est disponible pour toute administration publique, gratuitement. Il se place à la fin de vos démarches administratives, pour récolter l’avis de vos usagers et suivre la qualité de vos services et son évolution dans le temps.',
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
				'Le bouton Je donne mon avis permet aux usagers de vos démarches en ligne de noter la qualité globale du service, ainsi que la facilité d’usage et la simplicité du langage. Il leur permet également de vous transmettre des retours écrits détaillés.',
			image: '/assets/feature_3.png',
			imagePosition: 'right'
		},
		{
			icon: <i className={fr.cx('ri-line-chart-line')} />,
			title: 'Suivez l’évolution grâce à des graphiques pertinents',
			description:
				'En plus de vous permettre de consulter chacun des avis, notre plateforme met à votre disposition des graphiques pertinents pour suivre avec précision le niveau et la variation dans le temps des indicateurs clés de qualité de vos services numériques.',
			image: '/assets/feature_4.png',
			imagePosition: 'left'
		}
	];

	const pills: Pill[] = [
		{
			title: 'Gratuit',
			description: 'Gratuit, conçu pour les administrations publiques'
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
				'Le bouton je donne mon avis, que nous avons installé pour récolter les avis des usagers de la démarche de paiement des impôts en ligne, nous a fournis les pistes pour augmenter le taux de satisfaction de 20% en un an !',
			author: 'Fabienne D.',
			job_title: 'Responsable projet à la DGFIP'
		},
		{
			image_path: '/assets/temoignage_2.jpeg',
			description:
				'Cela nous a pris moins de 2h pour configurer et installer le bouton Je donne mon avis. Le code est extrêmement simple et la procédure bien indiquée.',
			author: 'Mathilde P.',
			job_title:
				'Directrice technique au ministère des Solidarités et de la Santé'
		}
	];

	const questions: Question[] = [
		{
			question: 'Quelles sont les questions posées aux usagers ?',
			answer:
				'Le formulaire Je donne mon avis est composé d’une question obligatoire et trois questions facultatives. <a href="https://jedonnemonavis.numerique.gouv.fr/Demarches/3119" target="_blank">Voir un exemple interactif du formulaire.</a>'
		},
		{
			question:
				'Faut-il vous contacter pour utiliser l’outil Je donne mon avis ?',
			answer:
				'Si vous êtes un agent ou une agente de la fonction publique, vous n’avez pas besoin de nous contacter pour utiliser l’outil <b>Je donne mon avis</b>. <a href="https://jedonnemonavis.numerique.gouv.fr/login" target="_blank">Créez votre compte</a> pour être guidé à l\'intégration de l’outil dans votre service.<br /><br />L’outil <b>Je donne mon avis</b> n’est disponible que pour les services publics numériques français.'
		},
		{
			question:
				'Puis-je utiliser l’outil Je donne mon avis si mon service ne fait pas partie de Vos démarches essentielles ?',
			answer:
				'Votre service ne doit pas être inclus dans <a href="https://observatoire.numerique.gouv.fr/" target="_blank">Vos démarches essentielles</a>. L’outil <b>Je donne mon avis</b> est disponible pour tous les services publics numériques français.'
		},
		{
			question:
				'Puis-je utiliser l’outil Je donne mon avis sur plusieurs services en même temps ?',
			answer:
				'Oui, le tableau de bord de <b>Je donne mon avis</b> vous permet de suivre plusieurs services en même temps.'
		},
		{
			question: "Existe-t-il un guide pour m'indiquer comment procéder ?",
			answer:
				'<a href="https://jedonnemonavis.numerique.gouv.fr/login" target="_blank">Créez votre compte</a> pour être guidé à l\'intégration de l’outil dans votre service. '
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
			<Head>
				<title>Accueil | Je donne mon avis</title>
				<meta name="description" content="Accueil | Je donne mon avis" />
			</Head>
			<HomeHeader />
			<HomeStepper />
			{displayHomeFeature()}
			<HomePills pills={pills} />
			{/*<HomeReferences references={references} />*/}
			<HomeActionButton
				title={'Prêt à recueillir les avis des usagers ?'}
				buttonStyle="primary"
				buttonText="Commencer"
				buttonLink="/login"
			/>
			<HomeQuestions questions={questions} />
			<HomeActionButton
				title={'Un problème, une question ? Contactez-nous !'}
				buttonStyle="link"
				buttonText="Contactez-nous à l'adresse"
				buttonLink="contact.jdma@design.numerique.gouv.fr"
			/>
		</div>
	);
}
