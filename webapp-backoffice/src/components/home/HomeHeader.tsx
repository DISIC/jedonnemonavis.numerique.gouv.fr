import { fr } from '@codegouvfr/react-dsfr';
import Image from 'next/image';
import { tss } from 'tss-react/dsfr';

const HomeHeader = () => {
	const { cx, classes } = useStyles();

	return (
		<section>
			<div className={cx(classes.blueContainer)} />
			<div className={fr.cx('fr-container')}>
				<div
					className={fr.cx(
						'fr-py-16v',
						'fr-grid-row',
						'fr-grid-row--center',
						'fr-grid-row--gutters'
					)}
				>
					<div
						className={fr.cx(
							'fr-col',
							'fr-col-12',
							'fr-col-md-6',
							'fr-col-offset-md-1'
						)}
					>
						<div className={cx(classes.titleContainer)}>
							<h1 className={cx(classes.headerTitle)}>
								Comment suivre la satisfaction de vos usagers ?
							</h1>
							<p className={cx(classes.description)}>
								Avec l’outil Je donne mon avis, suivez en temps réel la
								satisfaction des usagers de vos services publics numériques.
							</p>
						</div>
					</div>
					<div
						className={cx(
							fr.cx('fr-col', 'fr-col-12', 'fr-col-md-5'),
							classes.image
						)}
					>
						<Image
							className={cx(classes.headerImage)}
							src={'/assets/header_home.png'}
							alt=""
							width={351}
							height={584}
						/>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HomeHeader;

const useStyles = tss.withName('HomeHeader').create(() => ({
	titleContainer: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		height: '100%'
	},
	blueContainer: {
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
		width: '100%',
		height: '100%',
		transform: 'translateY(-47%) skewY(-4deg)',
		zIndex: -1,
		position: 'absolute'
	},
	headerTitle: {
		color: fr.colors.decisions.text.title.blueFrance.default,
		marginBottom: '1.5rem',
		[fr.breakpoints.down('md')]: {
			fontSize: '2rem',
			lineHeight: '2.5rem'
		}
	},
	description: {
		fontSize: '1.375rem',
		lineHeight: '2.25rem'
	},
	image: {
		display: 'flex',
		justifyContent: 'flex-end'
	},
	headerImage: {
		[fr.breakpoints.down('md')]: {
			display: 'none'
		}
	}
}));
