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
					linkProps: {
						href: 'https://docs.numerique.gouv.fr/docs/0b3cd9e3-6a39-4980-ba5b-17c1d7634d50',
						target: '_blank',
						rel: 'noopener noreferrer'
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
				⭐️ Identifier les bugs sur vos services grâce à vos usagers. Créer des
				formulaires de “Remontées d’informations” est maintenant possible. Plus
				d’infos sur la page des nouveautés.
			</p>
			<p className={fr.cx('fr-mb-4v')}>
				⭐️ Affichez un bouton flottant sur votre site afin que vos usagers
				trouvent le chemin de votre formulaire “Remontées d’informations” à
				n’importe quel moment.
			</p>
			<div className={cx(classes.imageContainer, fr.cx('fr-mt-6v'))}>
				<Image
					src="/assets/news-feature/modal-bug.png"
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
				Le modèle de “Remontées d’informations” intégré à votre site via un
				bouton flottant
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
