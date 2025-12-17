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
			title={<>De nouvelles fonctionnalités sont disponibles&nbsp;!</>}
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
			size="large"
		>
			<p className={fr.cx('fr-mb-4v')}>Vous pouvez désormais : </p>
			<p className={fr.cx('fr-mb-4v')}>
				⭐️ Analyser les réponses aux questionnaires à travers les mots clés les
				plus employés
			</p>
			<p className={fr.cx('fr-mb-4v')}>
				⭐️ Profiter d’un parcours fléché pour mieux comprendre comment
				installer un questionnaire JDMA sur votre service numérique
			</p>
			<p className={fr.cx('fr-mb-4v')}>
				⭐️ Récupérer les données agrégées de vos questionnaires avec une
				granularité supplémentaire (formulaire)
			</p>
			<div className={cx(classes.imageContainer, fr.cx('fr-mt-6v'))}>
				<Image
					src="/assets/news-feature/common-keywords.png"
					alt=""
					width={2030}
					height={798}
					className={classes.image}
				/>
			</div>
			<p
				className={fr.cx('fr-mb-0', 'fr-text--xs', 'fr-mt-1v')}
				style={{ color: fr.colors.decisions.text.mention.grey.default }}
			>
				Mots-clés les plus récurrents dans les réponses aux questionnaires JDMA
			</p>
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
		height: 'auto',
		maxWidth: '100%'
	}
});

export default NewsModal;
