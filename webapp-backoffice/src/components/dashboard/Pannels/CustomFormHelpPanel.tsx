import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { tss } from 'tss-react/dsfr';

const CustomFormHelpPanel = () => {
	const { cx, classes } = useStyles();

	return (
		<div
			className={cx(
				classes.mainContainer,
				fr.cx('fr-container', 'fr-p-6v', 'fr-mt-6v')
			)}
		>
			<div className={classes.container}>
				<Badge severity="new" className="fr-mb-2v" small>
					Beta
				</Badge>
				<span className={classes.smallTitle}>
					Personnalisez le formulaire du service
				</span>
				<p className={fr.cx('fr-mb-0')}>
					Désormais, pour adapter vos formulaires à vos besoins spécifiques,
					vous pouvez :
				</p>
				<ul className={classes.customList}>
					<li>Masquer une possibilité de réponse à une question</li>
					<li>Masquer une question entière</li>
					<li>Ajouter des questions supplémentaires</li>
				</ul>
				<p className={fr.cx('fr-mb-0', 'fr-mt-3v')}>
					Pour en savoir plus sur ces fonctionnalités et découvrir celles à
					venir, vous pouvez{' '}
					<Link href="/public/roadmap" target="_blank">
						consulter notre feuille de route
					</Link>
					.
				</p>
			</div>
			<Image
				src="/assets/cone_picto.svg"
				alt="Picto feuille de route"
				width={120}
				height={120}
			/>
		</div>
	);
};

const useStyles = tss.create({
	mainContainer: {
		...fr.spacing('padding', {}),
		background: fr.colors.decisions.artwork.decorative.blueFrance.default,
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	container: {
		...fr.spacing('padding', {}),
		background: fr.colors.decisions.artwork.decorative.blueFrance.default,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'flex-start'
	},
	customList: {
		listStyle: 'none',
		paddingLeft: fr.spacing('2v'),
		margin: 0,
		marginTop: fr.spacing('2v'),
		'& li': {
			position: 'relative',
			paddingLeft: fr.spacing('8v'),
			marginBottom: fr.spacing('1v'),
			'&::before': {
				content: '"✅"',
				position: 'absolute',
				left: fr.spacing('2v'),
				top: 0,
				fontSize: '16px',
				lineHeight: '24px'
			}
		}
	},
	smallTitle: {
		fontWeight: 'bold',
		fontSize: '20px',
		lineHeight: '28px',
		marginBottom: fr.spacing('2v')
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

export default CustomFormHelpPanel;
