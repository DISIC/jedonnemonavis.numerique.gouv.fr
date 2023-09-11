import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Image from 'next/image';
import HomeStepper from '@/components/home/HomeStepper';
import HomeFeatureDisplay, {
	Feature
} from '@/components/home/HomeFeatureDisplay';
import { ReactElement } from 'react';
import HomePills, { Pill } from '@/components/home/HomePills';
import HomeReferences, { Reference } from '@/components/home/HomeReferences';
import HomeActionButton from '@/components/home/HomeActionButton';
import HomeQuestions, { Question } from '@/components/home/HomeQuestions';
import HomeHeader from '@/components/home/HomeHeader';

export default function Home() {
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

	const questions: Question[] = [
		{
			question: 'Comment installer le bouton Je donne mon avis ?',
			answer:
				'Il vous suffit de copier-coller une portion de code HTML dans votre site web. Vous pouvez ensuite le personnaliser à votre guise.'
		},
		{
			question: 'Est-ce que l’outil Je donne mon avis est gratuit ?',
			answer:
				'Oui, l’outil Je donne mon avis est gratuit pour toutes les administrations publiques.'
		},
		{
			question: 'Est-ce que l’outil Je donne mon avis est conforme au RGAA ?',
			answer: 'Oui, l’outil Je donne mon avis est conforme au RGAA.'
		},
		{
			question: 'Est-ce que l’outil Je donne mon avis est conforme au RGPD ?',
			answer: 'Oui, l’outil Je donne mon avis est conforme au RGPD.'
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
			<HomeHeader />
			<HomeStepper />
			{displayHomeFeature()}
			<HomePills pills={pills} />
			<HomeReferences references={references} />
			<HomeActionButton
				title={'Prêt à recueillir les avis des usagers ?'}
				buttonStyle="primary"
				buttonText="Commencer"
				buttonLink="/login"
			/>
			<HomeQuestions questions={questions} />
			<HomeActionButton
				title={"Vous avez d'autres questions ?  Des doutes ? Contactez-nous !"}
				buttonStyle="secondary"
				buttonText="Contacter notre équipe"
				buttonLink="/login"
			/>
		</div>
	);
}
