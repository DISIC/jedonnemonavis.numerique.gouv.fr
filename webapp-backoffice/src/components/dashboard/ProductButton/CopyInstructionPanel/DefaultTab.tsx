import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { push } from '@socialgouv/matomo-next';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { ButtonCopyInstructionsPanelProps } from './interface';

const DefaultTab = ({
	buttonColor,
	button
}: ButtonCopyInstructionsPanelProps) => {
	const { cx, classes } = useStyles();
	const [displayToastTheme, setDisplayToastTheme] = useState<string>();

	const buttonCodeClair = `<a href="https://jedonnemonavis.numerique.gouv.fr/Demarches/${button?.form?.product_id}?button=${button?.id}" target='_blank'\ntitle="Je donne mon avis - nouvelle fenêtre">\n\n<img src="https://jedonnemonavis.numerique.gouv.fr/static/bouton-${buttonColor}-clair.svg" alt="Je donne mon avis" />\n\n</a>`;

	const buttonCodeSombre = `<a href="https://jedonnemonavis.numerique.gouv.fr/Demarches/${button?.form?.product_id}?button=${button?.id}" target='_blank'\ntitle="Je donne mon avis - nouvelle fenêtre">\n\n<img src="https://jedonnemonavis.numerique.gouv.fr/static/bouton-${buttonColor}-sombre.svg" alt="Je donne mon avis" />\n\n</a>`;

	return (
		<div>
			<p className={fr.cx('fr-mb-4v')}>
				1. Choisissez le thème à intégrer et copier le code correspondant
			</p>
			<div role="alert">
				<Alert
					isClosed={!displayToastTheme}
					severity="success"
					description={`Le lien du thème ${displayToastTheme} a été copié dans le presse papier`}
					small
					className={fr.cx('fr-mb-4v')}
				/>
			</div>
			<div className={fr.cx('fr-grid-row')}>
				{['clair', 'sombre'].map(theme => {
					return (
						<>
							<div
								className={cx(
									theme === 'clair'
										? classes.paddingRight
										: classes.paddingLeft,
									fr.cx('fr-col-12', 'fr-col-md-6')
								)}
							>
								<div className={fr.cx('fr-grid-row')}>
									<h5>Thème {theme}</h5>
									<div className={fr.cx('fr-col', 'fr-col-12')}>
										<div
											className={cx(
												classes.btnImgContainer,
												theme !== 'clair' && classes.blackContainer,
												fr.cx('fr-card', 'fr-p-6v')
											)}
										>
											<Image
												alt="bouton-je-donne-mon-avis"
												src={`/assets/bouton-${buttonColor}-${theme}.svg`}
												className={fr.cx('fr-my-8v')}
												width={200}
												height={85}
											/>
											<p
												className={cx(
													classes.smallText,
													theme !== 'clair' && classes.darkerText,
													fr.cx('fr-mb-0')
												)}
											>
												Prévisualisation du bouton
											</p>
										</div>
									</div>
									<div className={fr.cx('fr-col', 'fr-col-12')}>
										<Button
											priority="secondary"
											iconId="ri-file-copy-line"
											iconPosition="right"
											className={cx(classes.copyButton, fr.cx('fr-mt-8v'))}
											onClick={() => {
												navigator.clipboard.writeText(
													theme === 'clair' ? buttonCodeClair : buttonCodeSombre
												);
												push(['trackEvent', 'BO - Product', `Copy-Code`]);
												setDisplayToastTheme(theme);
											}}
										>
											Copier le code
										</Button>
										<div className={fr.cx('fr-input-group', 'fr-mt-4v')}>
											<Input
												className={classes.textArea}
												id="button-code"
												label={''}
												textArea
												nativeTextAreaProps={{
													name: 'button-code',
													value:
														theme === 'clair'
															? buttonCodeClair
															: buttonCodeSombre,
													contentEditable: false,
													readOnly: true
												}}
											/>
										</div>
									</div>
								</div>
							</div>
						</>
					);
				})}
			</div>
			<hr className={fr.cx('fr-mt-6v')} />
			<p className={fr.cx('fr-mb-3v')}>
				2. Coller le code à l’endroit où vous souhaitez placer votre bouton Je
				Donne Mon Avis
			</p>
			<Link
				href={
					'https://docs.numerique.gouv.fr/docs/68bd689e-4323-4fd4-aac6-135c750668ff'
				}
				className={fr.cx('fr-link')}
				target="_blank"
			>
				Comment définir le meilleur emplacement pour son bouton JDMA ?
			</Link>
			<div className={classes.infoContainer}>
				<div className={cx(classes.infoContent)}>
					<div className={classes.iconContainer}>
						<i className={cx(fr.cx('ri-lightbulb-line', 'fr-icon--lg'))} />
					</div>
					<p className={fr.cx('fr-mb-0', 'fr-ml-6v', 'fr-col--middle')}>
						Si vous modifiez le formulaire après la publication, vous n’avez pas
						besoin de recréer de lien d’intégration : les changements seront
						automatiquement visibles par les usagers
					</p>
				</div>
				<div className={cx(classes.infoContent)}>
					<div className={classes.iconContainer}>
						<i className={cx(fr.cx('ri-lightbulb-line', 'fr-icon--lg'))} />
					</div>
					<p className={fr.cx('fr-mb-0', 'fr-ml-6v', 'fr-col--middle')}>
						Vous pouvez retrouver ce code à n’importe quel moment dans votre
						formulaire, sur l’onglet “Liens d’intégration” en cliquant sur le
						bouton “Copier le code”
					</p>
				</div>
				<div className={cx(classes.infoContent)}>
					<Image
						src="/assets/news-feature/links-tab.png"
						alt=""
						width={508}
						height={180}
						className={classes.image}
					/>
				</div>
			</div>
		</div>
	);
};

export default DefaultTab;

const useStyles = tss.create(() => ({
	btnImgContainer: {
		display: 'flex',
		alignItems: 'center'
	},
	copyButton: {
		width: '100%',
		justifyContent: 'center'
	},
	blackContainer: {
		backgroundColor: fr.colors.getHex({ isDark: true }).decisions.background
			.default.grey.default
	},
	paddingRight: {
		paddingRight: '0.75rem',
		paddingLeft: '0.25rem',
		[fr.breakpoints.down('md')]: {
			paddingRight: '0'
		}
	},
	paddingLeft: {
		paddingLeft: '0.75rem',
		paddingRight: '0.25rem',
		[fr.breakpoints.down('md')]: {
			paddingLeft: '0',
			marginTop: '2rem'
		}
	},
	smallText: {
		color: fr.colors.getHex({ isDark: true }).decisions.background.alt.grey
			.active,
		fontSize: '0.8rem'
	},
	darkerText: {
		color: fr.colors.getHex({ isDark: false }).decisions.background.alt.grey
			.active
	},
	textArea: {
		'.fr-input': {
			height: '300px',
			minHeight: '300px',
			resize: 'none',
			whiteSpace: 'pre-wrap',
			wordBreak: 'break-all'
		}
	},
	infoContainer: {
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
		padding: fr.spacing('6v'),
		marginTop: fr.spacing('8v')
	},
	infoContent: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
		'&:not(:last-of-type)': {
			marginBottom: fr.spacing('6v')
		}
	},
	iconContainer: {
		width: fr.spacing('12v'),
		height: fr.spacing('12v'),
		backgroundColor: 'white',
		color: fr.colors.decisions.background.flat.blueFrance.default,
		borderRadius: '50%',
		flexShrink: 0,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	},
	image: {
		height: 'auto',
		width: '100%'
	}
}));
