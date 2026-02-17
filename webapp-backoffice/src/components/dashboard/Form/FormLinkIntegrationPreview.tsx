import {
	FormTemplateButtonWithVariants,
	FormWithConfigAndTemplate
} from '@/src/types/prismaTypesExtended';
import { getHelperFromFormConfig } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Header from '@codegouvfr/react-dsfr/Header';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import { Skeleton } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import ImageWithFallback from '../../ui/ImageWithFallback';
import { Loader } from '../../ui/Loader';
import { LinkIntegrationTypes } from '../ProductButton/interface';

type FormLinkIntegrationPreviewProps = {
	title: string;
	description: JSX.Element;
	onConfirm: (value: LinkIntegrationTypes) => void;
	form?: FormWithConfigAndTemplate;
	defaultFormTemplateButton?: FormTemplateButtonWithVariants;
};

const FormLinkIntegrationPreview = ({
	title,
	description,
	onConfirm,
	form,
	defaultFormTemplateButton
}: FormLinkIntegrationPreviewProps) => {
	const router = useRouter();
	const [selectedIntegrationType, setSelectedIntegrationType] =
		useState<LinkIntegrationTypes>('button');
	const { cx, classes } = useStyles();

	const currentFormConfig = getHelperFromFormConfig(form?.form_configs[0]);

	const getPreviewContent = () => {
		switch (selectedIntegrationType) {
			case 'button':
				return (
					<a
						href={`#`}
						target="_blank"
						rel="noopener noreferrer"
						title="Je donne mon avis - nouvelle fenêtre"
						className={fr.cx('fr-raw-link')}
					>
						{defaultFormTemplateButton ? (
							<ImageWithFallback
								alt={defaultFormTemplateButton.label}
								src={
									defaultFormTemplateButton.variants.find(
										v => v.style === 'solid'
									)?.image_url || ''
								}
								fallbackSrc={`/assets/buttons/button-${defaultFormTemplateButton.slug}-solid-light.svg`}
								width={200}
								height={85}
							/>
						) : (
							<Loader />
						)}
					</a>
				);
			case 'embed':
				return (
					form && (
						<iframe
							title="Aperçu de l'intégration du formulaire"
							src={`${process.env.NEXT_PUBLIC_FORM_APP_URL}${
								form.form_template?.slug === 'root'
									? `/Demarches/${form.product_id}`
									: `/Demarches/avis/${form.id}`
							}?iframe=true&formConfig=${encodeURIComponent(
								JSON.stringify(currentFormConfig)
							)}`}
							style={{ border: 'none', width: '100%', height: '500px' }}
						/>
					)
				);
		}
	};

	return (
		<div className={cx(fr.cx('fr-grid-row'))}>
			<div className={cx(classes.sideMenu, fr.cx('fr-col-4'))}>
				<h1 className={fr.cx('fr-h3', 'fr-mb-1v')}>{title}</h1>
				{description}
				<p className={fr.cx('fr-mb-4v', 'fr-mt-4v')}>
					Format du formulaire&nbsp;
					<span className={cx(classes.asterisk)}>*</span>
				</p>
				<div className={classes.scrollableContent}>
					<RadioButtons
						options={[
							// {
							// 	label: (
							// 		<>
							// 			<Badge severity="new" small className={fr.cx('fr-mb-1v')}>
							// 				Beta
							// 			</Badge>
							// 			Intégré au contenu
							// 		</>
							// 	),
							// 	hintText:
							// 		'La 1ère question est visible directement dans la page de contenu',
							// 	nativeInputProps: {
							// 		value: 'embed',
							// 		checked: selectedIntegrationType === 'embed',
							// 		onChange: () => setSelectedIntegrationType('embed')
							// 	},
							// 	illustration: (
							// 		<Image
							// 			alt="Illustration intégré au contenu"
							// 			src={'/assets/integration-embed.svg'}
							// 			width={95}
							// 			height={71}
							// 		/>
							// 	)
							// },
							{
								label: 'Pleine page',
								hintText:
									'Depuis un bouton, le formulaire s’ouvre dans un nouvel onglet. C’est le seul format compatible avec l’utilisation de Démarches Simplifiées',
								nativeInputProps: {
									value: 'button',
									checked: selectedIntegrationType === 'button',
									onChange: () => setSelectedIntegrationType('button')
								},
								illustration: (
									<Image
										alt="Illustration pleine page"
										src={'/assets/integration-button.svg'}
										width={95}
										height={71}
									/>
								)
							},
							// {
							// 	label: (
							// 		<>
							// 			<Badge severity="new" small className={fr.cx('fr-mb-1v')}>
							// 				Beta
							// 			</Badge>
							// 			Flottant
							// 		</>
							// 	),
							// 	hintText:
							// 		'Le formulaire est accessible via un bouton flottant et s’affiche par dessus le contenu',
							// 	nativeInputProps: {
							// 		value: 'modal',
							// 		checked: selectedIntegrationType === 'modal',
							// 		onChange: () => setSelectedIntegrationType('modal')
							// 	},
							// 	illustration: (
							// 		<Image
							// 			alt="Illustration pleine page"
							// 			src={'/assets/integration-modal.svg'}
							// 			width={95}
							// 			height={71}
							// 		/>
							// 	)
							// },
							{
								label: 'Lien seul',
								hintText:
									'Le lien n’a pas de design associé. Il est à intégrer dans un composant existant de votre site (bouton, bannière,...)',
								nativeInputProps: {
									value: 'link',
									checked: selectedIntegrationType === 'link',
									onChange: () => setSelectedIntegrationType('link')
								}
							}
						]}
						name="integration-type"
					/>
				</div>
				<section className={classes.actionsContainer}>
					<Button
						size="large"
						iconPosition="right"
						iconId="fr-icon-arrow-right-s-line"
						onClick={() => onConfirm(selectedIntegrationType)}
						className={classes.continueButton}
					>
						Continuer
					</Button>
					<Button
						className={classes.backButton}
						priority={'tertiary'}
						size="large"
						iconId={'fr-icon-arrow-left-s-line'}
						onClick={() => router.back()}
					>
						Retour
					</Button>
				</section>
			</div>
			<div className={cx(classes.previewContainer, fr.cx('fr-col-8'))}>
				<div className={classes.previewMask} />
				<Header
					brandTop={
						<>
							RÉPUBLIQUE <br /> FRANÇAISE
						</>
					}
					homeLinkProps={{ href: '#', title: 'example', tabIndex: -1 }}
					serviceTitle={<Skeleton width={200} />}
					serviceTagline={<Skeleton />}
					navigation={<Skeleton width={'100%'} height={50} />}
					style={{ zIndex: 0 }}
				/>
				<div className={cx(classes.fakeMainContent, fr.cx('fr-container'))}>
					<Skeleton height={400} />
					<Skeleton height={200} />
					<div className={classes.previewContent}>{getPreviewContent()}</div>
					<Skeleton height={200} />
					<Skeleton height={400} />
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.withName(FormLinkIntegrationPreview.name).create(() => ({
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	},
	sideMenu: {
		position: 'relative',
		height: '100vh',
		overflow: 'hidden',
		padding: fr.spacing('10v'),
		backgroundColor: 'white',
		display: 'flex',
		flexDirection: 'column'
	},
	scrollableContent: {
		flex: 1,
		overflowY: 'auto',
		overflowX: 'hidden',
		paddingBottom: fr.spacing('8v')
	},
	previewContainer: {
		position: 'relative',
		height: '100vh',
		overflow: 'hidden',
		backgroundColor: 'white'
	},
	previewMask: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		zIndex: 5
	},
	fakeMainContent: {
		display: 'flex',
		flexDirection: 'column',
		height: '50%'
	},
	previewContent: {
		display: 'flex',
		justifyContent: 'center',
		...fr.spacing('margin', { topBottom: '4v' }),
		zIndex: 10
	},
	actionsContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		zIndex: 1000,
		display: 'flex',
		justifyContent: 'space-between',
		width: '100%',
		height: fr.spacing('20v'),
		backgroundColor: 'white',
		borderTop: `solid 1px ${fr.colors.decisions.border.default.grey.default}`,
		...fr.spacing('padding', { topBottom: '4v', rightLeft: '10v' }),
		[fr.breakpoints.down('sm')]: {
			borderTop: 'none',
			flexDirection: 'column',
			height: 'auto',
			gap: fr.spacing('4v'),
			...fr.spacing('padding', { topBottom: '6v', rightLeft: '4v' }),
			button: {
				width: '100%',
				justifyContent: 'center',
				fontSize: '1rem',
				lineHeight: '1.5rem',
				minHeight: fr.spacing('8v')
			}
		}
	},
	continueButton: {
		order: 2
	},
	backButton: {
		order: 1
	}
}));

export default FormLinkIntegrationPreview;
