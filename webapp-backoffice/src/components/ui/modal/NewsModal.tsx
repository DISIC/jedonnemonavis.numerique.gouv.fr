import { CustomModalProps } from '@/src/types/custom';
import { fr } from '@codegouvfr/react-dsfr';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';
import { tss } from 'tss-react/dsfr';

interface NewsModalProps {
	modal: CustomModalProps;
}

const NewsModal = ({ modal }: NewsModalProps) => {
	const router = useRouter();
	const { cx, classes } = useStyles();

	return (
		<modal.Component
			title="De nouvelles fonctionnalités sont disponibles !"
			buttons={[
				{
					onClick: () => {
						router.push('/administration/dashboard/news');
					},
					children: 'Voir les nouveautés',
					iconId: 'fr-icon-arrow-right-line',
					iconPosition: 'right'
				}
			]}
		>
			<p className={fr.cx('fr-mb-4v')}>Découvrez les nouveautés : </p>
			<p className={fr.cx('fr-mb-4v')}>
				⭐️ Une nouvelle interface pour gérer ses formulaires
			</p>
			<p className={fr.cx('fr-mb-4v')}>
				⭐️ La possibilité d’éditer un formulaire : masquer une question, une
				option de réponse, ...
			</p>
			<p className={fr.cx('fr-mb-4v')}>
				⭐️ La gestion des emplacements de vos boutons JDMA
			</p>
			<div className={cx(classes.imageContainer, fr.cx('fr-mt-6v'))}>
				<Image
					src="/assets/news-feature-1.png"
					alt=""
					width={450}
					height={285}
					className={classes.image}
				/>
			</div>
		</modal.Component>
	);
};

const useStyles = tss.create({
	imageContainer: {
		display: 'flex',
		justifyContent: 'center',
		width: '100%',
		backgroundColor: fr.colors.options.blueEcume._950_100.default
	},
	image: {
		maxWidth: '100%',
		[fr.breakpoints.down('md')]: {
			height: 'auto'
		}
	}
});

export default NewsModal;
