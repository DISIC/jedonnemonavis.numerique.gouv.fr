import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { push } from '@socialgouv/matomo-next';
import Image from 'next/image';
import { tss } from 'tss-react/dsfr';

interface Props {
	onButtonClick: () => void;
	isSmall?: boolean;
}

const NoButtonsPanel = (props: Props) => {
	const { onButtonClick, isSmall } = props;
	const { cx, classes } = useStyles();

	return (
		<div
			className={cx(
				classes.container,
				fr.cx('fr-container', 'fr-p-3v', 'fr-pb-6v', 'fr-p-md-16v')
			)}
		>
			<h3 className={cx(classes.title)}>
				Intégrer le formulaire sur votre site
			</h3>
			<div
				className={cx(
					fr.cx('fr-grid-row', 'fr-grid-row--left', 'fr-grid-row--middle'),
					classes.rowContainer
				)}
			>
				<div className={fr.cx('fr-col-md-2')}>
					<Image
						src="/assets/install_picto.svg"
						alt="Picto bulles de discussion"
						width={120}
						height={120}
					/>
				</div>
				<div className={cx(fr.cx('fr-col-md-10'))}>
					<p className={cx(fr.cx('fr-mb-0'))}>
						Créez votre premier lien d’intégration et copiez le code généré sur
						votre site afin de publier le formulaire
					</p>
				</div>
			</div>
			<Button
				className={cx(classes.button)}
				priority="primary"
				iconId="fr-icon-add-line"
				iconPosition="right"
				type="button"
				size="large"
				nativeButtonProps={{
					onClick: event => {
						event.preventDefault();
						push(['trackEvent', 'BO - EmptyState', `Create-button`]);
						onButtonClick();
					}
				}}
			>
				Créer un lien d'intégration
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
			color: fr.colors.decisions.text.title.blueFrance.default
		}
	},
	title: {
		fontWeight: 'bold',
		fontSize: '28px',
		color: fr.colors.decisions.text.title.blueFrance.default,
		[fr.breakpoints.down('sm')]: {
			marginBottom: fr.spacing('4v'),
			fontSize: '24px'
		}
	},
	rowContainer: {
		width: '100%',
		':not(:last-child)': {
			marginBottom: fr.spacing('3v'),
			[fr.breakpoints.down('md')]: {
				marginBottom: fr.spacing('6v')
			}
		},
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column',
			alignItems: 'start'
		}
	},
	content: {
		display: 'flex',
		alignItems: 'center',
		flexWrap: 'wrap',
		marginBottom: fr.spacing('3v'),
		'&:last-of-type': {
			marginBottom: 0
		},
		p: {
			margin: 0,
			whiteSpace: 'pre-wrap'
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
	button: {
		alignSelf: 'center',
		[fr.breakpoints.down('md')]: {
			width: '100%',
			justifyContent: 'center'
		}
	}
});

export default NoButtonsPanel;
