import ImageWithFallback from '@/src/components/ui/ImageWithFallback';
import { getButtonCode } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { push } from '@socialgouv/matomo-next';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { ButtonInstructionTabProps } from './interface';

const ButtonInstructionTab = ({
	buttonStyle,
	button,
	formTemplateButton,
	isForDemarchesSimplifiees = false
}: ButtonInstructionTabProps) => {
	const { cx, classes } = useStyles();
	const [displayToastTheme, setDisplayToastTheme] = useState<string>();

	const buttonCodeClair = getButtonCode({
		theme: 'clair',
		buttonStyle,
		button,
		formTemplateButton
	});
	const buttonCodeSombre = getButtonCode({
		theme: 'sombre',
		buttonStyle,
		button,
		formTemplateButton
	});

	const getInsctructionContent = () => {
		if (isForDemarchesSimplifiees) {
			return (
				<>
					<p>
						2. Connectez-vous sur votre compte Démarches Simplifiées. Une fois
						sur votre démarche, allez sur l’outil{' '}
						<strong>Bouton “MonAvis”</strong> et cliquez sur&nbsp;
						<strong>Modifier</strong>
					</p>
					<div className={classes.infoContainer}>
						<div className={cx(classes.infoContent)}>
							<Image
								src="/assets/ds_integration.png"
								alt=""
								width={508}
								height={224}
								className={classes.image}
							/>
						</div>
					</div>
					<hr className={fr.cx('fr-mt-6v')} />
					<p>
						3. Collez le code dans le champ dédié et enregistrez. Le bouton Je
						Donne Mon Avis apparaitra à la fin de votre démarche.
					</p>
					<div className={classes.infoContainer}>
						<div className={cx(classes.infoContent)}>
							<Image
								src="/assets/ds_button_code.png"
								alt=""
								width={508}
								height={215}
								className={classes.image}
							/>
						</div>
					</div>
				</>
			);
		} else {
			return (
				<>
					<p className={fr.cx('fr-mb-3v')}>
						2. Coller le code à l’endroit où vous souhaitez placer votre bouton
						Je Donne Mon Avis
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
				</>
			);
		}
	};

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
					const isLight = theme === 'clair';
					const enTheme = isLight ? 'light' : 'dark';
					const currentVariant = formTemplateButton?.variants.find(
						v => v.theme === enTheme && v.style === buttonStyle
					);

					return (
						<>
							<div
								className={cx(
									isLight ? classes.paddingRight : classes.paddingLeft,
									fr.cx('fr-col-12', 'fr-col-md-6')
								)}
							>
								<div className={fr.cx('fr-grid-row')}>
									<h2 className={fr.cx('fr-h5')}>Thème {theme}</h2>
									<div className={fr.cx('fr-col', 'fr-col-12')}>
										<div
											className={cx(
												classes.btnImgContainer,
												!isLight && classes.blackContainer,
												fr.cx('fr-card', 'fr-p-6v')
											)}
										>
											<ImageWithFallback
												alt={
													formTemplateButton?.label ||
													`bouton-je-donne-mon-avis`
												}
												src={currentVariant?.image_url || ''}
												fallbackSrc={`/assets/buttons/button-${formTemplateButton?.slug}-${buttonStyle}-${enTheme}.svg`}
												className={fr.cx('fr-my-8v')}
												width={200}
												height={85}
											/>
											<p
												className={cx(
													classes.smallText,
													!isLight && classes.darkerText,
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
													isLight ? buttonCodeClair : buttonCodeSombre
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
													'aria-label': 'Code du bouton Je Donne Mon Avis',
													name: 'button-code',
													value: isLight ? buttonCodeClair : buttonCodeSombre,
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
			{getInsctructionContent()}
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

export default ButtonInstructionTab;

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
