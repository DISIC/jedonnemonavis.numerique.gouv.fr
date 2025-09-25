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
			<p className={fr.cx('fr-mb-4v')}>⭐️ Fermer un emplacement</p>
			<p className={fr.cx('fr-mb-4v')}>⭐️ Fermer un formulaire</p>
			<div className={cx(classes.imageContainer, fr.cx('fr-mt-6v'))}>
				<Image
					src="/assets/news-feature/close-button.png"
					alt=""
					width={451}
					height={309}
					className={classes.image}
				/>
			</div>
			<p
				className={fr.cx('fr-mb-0', 'fr-text--xs', 'fr-mt-1v')}
				style={{ color: fr.colors.decisions.text.mention.grey.default }}
			>
				Fermeture d'un emplacement
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
		maxWidth: '100%',
		[fr.breakpoints.down('md')]: {
			height: 'auto'
		}
	}
});

export default NewsModal;
