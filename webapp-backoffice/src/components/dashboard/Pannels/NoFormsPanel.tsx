import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Link from 'next/link';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import FormCreationModal from '../Form/FormCreationModal';
import { Product } from '@prisma/client';
import Image from 'next/image';

const new_form_modal = createModal({
	id: 'new-form-modal',
	isOpenedByDefault: false
});

interface Props {
	isSmall?: boolean;
	product: Product;
}

const NoFormsPanel = ({ isSmall, product }: Props) => {
	const { cx, classes } = useStyles();

	return (
		<>
			<FormCreationModal modal={new_form_modal} productId={product.id} />

			<div
				className={cx(
					classes.container,
					fr.cx(
						'fr-container',
						isSmall ? ['fr-py-8v', 'fr-px-4v'] : ['fr-py-12v', 'fr-px-6v'],
						isSmall ? 'fr-p-md-6v' : 'fr-p-md-16v'
					)
				)}
			>
				<Badge severity="new" className="fr-mb-2v" small>
					Beta
				</Badge>
				<span className={isSmall ? classes.smallTitle : classes.title}>
					Créer votre premier formulaire pour ce service
				</span>
				<div className={classes.content}>
					{isSmall ? (
						<div
							className={cx(classes.indicatorIcon, cx(fr.cx('fr-mr-md-6v')))}
						>
							<i className={cx(fr.cx('ri-chat-smile-2-line'), classes.icon)} />
						</div>
					) : (
						<div className={fr.cx('fr-col-md-3')}>
							<Image
								src="/assets/chat_picto.svg"
								alt="Picto bulles de discussion"
								width={120}
								height={120}
							/>
						</div>
					)}

					<p>
						Un formulaire vous permet de récolter avis de vos usagers sur un
						service numérique.
					</p>
				</div>
				<div className={classes.content}>
					{isSmall ? (
						<div
							className={cx(classes.indicatorIcon, cx(fr.cx('fr-mr-md-6v')))}
						>
							<i className={cx(fr.cx('ri-line-chart-line'), classes.icon)} />
						</div>
					) : (
						<div className={fr.cx('fr-col-md-3')}>
							<Image
								src="/assets/data_viz.svg"
								alt="Picto graphique statistiques"
								width={120}
								height={120}
							/>
						</div>
					)}
					<p>
						Vous pouvez créer plusieurs formulaires qui peuvent être adaptés à
						vos besoins de recherche spécifiques.
					</p>
				</div>
				<div className={classes.content}>
					{isSmall ? (
						<div
							className={cx(classes.indicatorIcon, cx(fr.cx('fr-mr-md-6v')))}
						>
							<i className={cx(fr.cx('ri-git-branch-line'), classes.icon)} />
						</div>
					) : (
						<div className={fr.cx('fr-col-md-3')}>
							<Image
								src="/assets/cone_picto.svg"
								alt="Picto feuille de route"
								width={120}
								height={120}
							/>
						</div>
					)}
					<p>
						Pour en savoir plus sur ces fonctionnalités et découvrir celles à
						venir, vous pouvez{' '}
						<Link href="/public/roadmap" target="_blank">
							consulter notre feuille de route
						</Link>
						.
					</p>
				</div>
				<div className={classes.buttonContainer}>
					<Button
						iconId="ri-add-circle-line"
						iconPosition="right"
						onClick={e => {
							e.stopPropagation();
							e.preventDefault();
							new_form_modal.open();
						}}
						size={isSmall ? 'medium' : 'large'}
					>
						Créer un formulaire
					</Button>
				</div>
			</div>
		</>
	);
};

const useStyles = tss.create({
	container: {
		...fr.spacing('padding', {}),
		background: fr.colors.decisions.artwork.decorative.blueFrance.default,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'flex-start'
	},
	title: {
		fontWeight: 'bold',
		fontSize: '28px',
		lineHeight: '36px',
		color: fr.colors.decisions.text.title.blueFrance.default,
		marginBottom: fr.spacing('6v')
	},
	smallTitle: {
		fontWeight: 'bold',
		fontSize: '20px',
		lineHeight: '28px',
		marginBottom: fr.spacing('6v')
	},
	content: {
		display: 'flex',
		alignItems: 'center',
		marginBottom: fr.spacing('3v'),
		p: {
			margin: 0
		},
		a: {
			color: fr.colors.decisions.text.title.blueFrance.default,
			backgroundImage: 'none',
			textDecoration: 'underline'
		},
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column',
			alignItems: 'flex-start',
			marginBottom: fr.spacing('6v')
		}
	},
	indicatorIcon: {
		width: fr.spacing('12v'),
		height: fr.spacing('12v'),
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: '50%',
		backgroundColor: 'white'
	},
	icon: {
		color: fr.colors.decisions.background.flat.blueFrance.default,
		'::before': {
			'--icon-size': fr.spacing('7v')
		}
	},
	buttonContainer: {
		display: 'flex',
		width: '100%',
		justifyContent: 'center'
	}
});

export default NoFormsPanel;
