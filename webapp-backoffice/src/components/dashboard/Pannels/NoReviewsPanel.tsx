import { fr } from '@codegouvfr/react-dsfr';
import Image from 'next/image';
import { tss } from 'tss-react/dsfr';

const NoReviewsPanel = () => {
	const { cx, classes } = useStyles();

	return (
		<div
			className={cx(
				classes.container,
				fr.cx('fr-container', 'fr-p-3v', 'fr-pb-6v', 'fr-p-md-12v')
			)}
		>
			<h3 className={cx(classes.title)}>En attendant vos premiers avis...</h3>
			<div
				className={cx(
					fr.cx('fr-grid-row', 'fr-grid-row--left', 'fr-grid-row--middle'),
					classes.rowContainer
				)}
			>
				<div className={fr.cx('fr-col-md-3')}>
					<Image
						src="/assets/chat_picto.svg"
						alt="Picto bulles de discussion"
						width={120}
						height={120}
					/>
				</div>
				<div className={cx(fr.cx('fr-col-md-9'))}>
					<p className={cx(fr.cx('fr-mb-3v'))}>
						Nos conseils pour obtenir plus d’avis !
					</p>
					<a
						title="Améliorer le placement de votre bouton"
						href="#"
						target="_blank"
						className="fr-link"
					>
						Améliorer le placement de votre bouton
					</a>
				</div>
			</div>
			<div
				className={cx(
					fr.cx('fr-grid-row', 'fr-grid-row--left', 'fr-grid-row--middle'),
					classes.rowContainer
				)}
			>
				<div className={fr.cx('fr-col-md-3')}>
					<Image
						src="/assets/cone_picto.svg"
						alt="Picto bulles de discussion"
						width={120}
						height={120}
					/>
				</div>
				<div className={cx(fr.cx('fr-col-md-9'))}>
					<p className={cx(fr.cx('fr-mb-3v'))}>
						Besoin de tester un parcours sur mobile vs. sur ordinateur ? Faire
						un test A/B suite à une modification de parcours ? Vous pouvez en
						créer plusieurs boutons JDMA.
					</p>
					<a
						title="En savoir plus sur les boutons multiples"
						href="#"
						target="_blank"
						className="fr-link"
					>
						En savoir plus sur les boutons multiples
					</a>
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.create({
	container: {
		background: '#F3F6FE',
		display: 'flex',
		justifyContent: 'start',
		alignItems: 'start',
		flexDirection: 'column'
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
	blocs: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		padding: '0 !important'
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
	divider: {
		borderLeft: '1px solid gray;',
		margin: '0 3rem'
	}
});

export default NoReviewsPanel;
