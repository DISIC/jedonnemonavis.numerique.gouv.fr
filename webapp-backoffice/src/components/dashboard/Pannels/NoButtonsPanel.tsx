import { fr, FrIconClassName, RiIconClassName } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { push } from '@socialgouv/matomo-next';
import Image from 'next/image';
import React from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	onButtonClick: () => void;
	isSmall?: boolean;
}

const contents: { 
	iconId: FrIconClassName | RiIconClassName; 
	text: string; 
	link?: {href:string; label:string};
}[] = [
	{
		iconId: 'ri-code-box-line',
		text: 'Lors de la création d’un emplacement, un code HTML est généré. Il vous suffit de le copier-coller dans le code de la page où vous voulez faire apparaître le bouton d’avis.'
	},
	{
		iconId: 'ri-list-check',
		text: 'Vous pouvez créer plusieurs emplacements pour chaque formulaire, par exemple sur une démarche, sur un email de finalisation,\u00A0...',
		link: {
			href: "#",
			label: 'Pourquoi créer plusieurs emplacements ?',
		}
	},
];

const NoButtonsPanel = (props: Props) => {
	const { onButtonClick, isSmall } = props;
	const { cx, classes } = useStyles();

	return (
		<div className={cx(classes.container, fr.cx('fr-container', 'fr-p-6v'))}>
			<div className={fr.cx('fr-col-8', 'fr-mb-6v')}>
				<span className={classes.title}>
					Comment ça fonctionne ? 
				</span>
			</div>
			{contents.map((content, index) => (
				<div key={index} className={cx(classes.content, fr.cx('fr-col-12', 'fr-py-0'))}>
					<div className={cx(classes.indicatorIcon, cx(fr.cx('fr-mr-md-6v')))}>
						<i className={cx(fr.cx(content.iconId), classes.icon)} />
					</div>
					<div className='fr-col-11'>
						<p>{content.text}</p>
						{content.link && (
							<a href={content.link.href} target='_blank' className='fr-col-12'>{content.link.label}</a>
						)}
					</div>
				</div>
			))}
			<Button
				className={cx(classes.button, fr.cx('fr-mt-6v'))}
				priority="primary"
				iconId="fr-icon-add-line"
				iconPosition="right"
				type="button"
				nativeButtonProps={{
					onClick: event => {
						event.preventDefault();
						push(['trackEvent', 'BO - EmptyState', `Create-button`]);
						onButtonClick();
					}
				}}
			>
				Créer un emplacement
			</Button>
		</div>
	);
};

const useStyles = tss.create({
	container: {
		...fr.spacing('padding', {}),
    background: fr.colors.decisions.artwork.decorative.blueFrance.default,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		a: {
			color: fr.colors.decisions.text.title.blueFrance.default,
    }
	},
	title: {
		fontWeight: 'bold',
		fontSize: '1.5rem',
		lineHeight: '2rem',
	},
  content: {
    display: 'flex',
    alignItems: 'center',
		flexWrap: 'wrap',
    marginBottom: fr.spacing('3v'),
		'&:last-of-type': {
			marginBottom: 0,
		},
    p: {
      margin: 0,
			whiteSpace: 'pre-wrap',
    },
    [fr.breakpoints.down('md')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      marginBottom: fr.spacing('6v'),
    }
  },
  indicatorIcon: {
		width: fr.spacing('12v'),
		height: fr.spacing('12v'),
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: '50%',
		backgroundColor: 'white',
	},
	icon: {
		color: fr.colors.decisions.background.flat.blueFrance.default,
		'::before': {
			'--icon-size': fr.spacing('7v'),
		}
	},
	button: {
		alignSelf: 'center'
	},
});

export default NoButtonsPanel;
