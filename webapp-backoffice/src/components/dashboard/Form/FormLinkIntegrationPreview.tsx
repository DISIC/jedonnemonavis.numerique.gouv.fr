import {
	FormTemplateWithElements,
	FormWithConfigAndTemplate
} from '@/src/types/prismaTypesExtended';
import { getHelperFromFormConfig } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Header from '@codegouvfr/react-dsfr/Header';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import { ButtonIntegrationTypes } from '@prisma/client';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMemo, useState, useEffect, CSSProperties } from 'react';
import { tss } from 'tss-react/dsfr';
import ImageWithFallback from '../../ui/ImageWithFallback';
import { Loader } from '../../ui/Loader';
import { buttonIntegrationTypesMapping } from '@/src/utils/content';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { useIsMobile } from '@/src/hooks/useIsMobile';

type FormLinkIntegrationPreviewProps = {
	title: string;
	description: JSX.Element;
	onConfirm: (value: ButtonIntegrationTypes) => void;
	form?: FormWithConfigAndTemplate;
	formTemplate?: FormTemplateWithElements | null;
	preSelectedIntegrationType?: ButtonIntegrationTypes;
};

const Placeholder = (styleProps: CSSProperties) => (
	<span
		style={{
			backgroundColor: '#f0f0f0',
			borderRadius: '0.3em',
			display: 'inline-block',
			...styleProps
		}}
	/>
);

const FormLinkIntegrationPreview = ({
	title,
	description,
	onConfirm,
	form,
	formTemplate,
	preSelectedIntegrationType
}: FormLinkIntegrationPreviewProps) => {
	const router = useRouter();
	const [selectedIntegrationType, setSelectedIntegrationType] =
		useState<ButtonIntegrationTypes>(preSelectedIntegrationType || 'button');
	const { cx, classes } = useStyles();
	const { isMobile } = useIsMobile('lg');

	const currentFormConfig = getHelperFromFormConfig(form?.form_configs[0]);

	useEffect(() => {
		if (preSelectedIntegrationType) {
			setSelectedIntegrationType(preSelectedIntegrationType);
			return;
		}
		if (formTemplate?.default_integration_type) {
			setSelectedIntegrationType(formTemplate.default_integration_type);
		}
	}, [formTemplate?.default_integration_type, preSelectedIntegrationType]);

	const defaultFormTemplateButton = useMemo(() => {
		return formTemplate?.form_template_buttons.find(b => b.isDefault);
	}, [formTemplate]);

	const getPreviewContent = () => {
		switch (selectedIntegrationType) {
			case 'button':
				return (
					<button
						title="Je donne mon avis - nouvelle fenêtre"
						className={classes.previewButton}
						disabled
						aria-disabled
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
					</button>
				);
			case 'modal':
				return (
					<div className={classes.previewModalContainer}>
						<button
							title="Je donne mon avis - nouvelle fenêtre"
							className={classes.previewButtonModal}
							disabled
							aria-disabled
						>
							{defaultFormTemplateButton ? (
								<ImageWithFallback
									alt={defaultFormTemplateButton.label}
									src={
										defaultFormTemplateButton.variants.find(
											v => v.style === 'outline'
										)?.image_url || ''
									}
									fallbackSrc={`/assets/buttons/button-${defaultFormTemplateButton.slug}-outline-light.svg`}
									width={200}
									height={85}
								/>
							) : (
								<Loader />
							)}
						</button>
					</div>
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
							}?mode=preview&formConfig=${encodeURIComponent(
								JSON.stringify(currentFormConfig)
							)}`}
							className={classes.previewEmbedContainer}
						/>
					)
				);
			case 'link':
				return (
					<div className={classes.linkPreviewContainer}>
						<p>
							Le lien n’a pas de design associé. Il est à intégrer dans un
							composant existant de votre site (bouton, bannière, ...)
						</p>
					</div>
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
						name="integration-type"
						options={
							formTemplate?.integration_types
								.filter(type => type !== 'embed')
								.map(type => {
									const values = buttonIntegrationTypesMapping[type];
									return {
										label: (
											<p className="fr-m-0">
												{values.label}&nbsp;
												{values.isNew && (
													<Badge
														as="span"
														severity="new"
														small
														className={fr.cx('fr-mb-1v')}
													>
														Beta
													</Badge>
												)}
											</p>
										),
										hintText: values.hintText,
										nativeInputProps: {
											value: type,
											checked: selectedIntegrationType === type,
											onChange: () =>
												setSelectedIntegrationType(
													type as ButtonIntegrationTypes
												)
										},
										...(values.noIllustration
											? {}
											: {
													illustration: (
														<Image
															alt={`Illustration ${values.label}`}
															src={`/assets/integration-${type}.svg`}
															width={95}
															height={71}
														/>
													)
											  })
									};
								}) || []
						}
					/>
				</div>
				<section id="onboarding-actions" className={classes.actionsContainer}>
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
			<div
				className={cx(classes.previewContainer, fr.cx('fr-col-8'))}
				role="presentation"
				aria-hidden="true"
			>
				<div className={classes.previewMask} />
				<Header
					brandTop={
						<>
							RÉPUBLIQUE <br /> FRANÇAISE
						</>
					}
					homeLinkProps={{
						href: '#',
						title: 'example',
						tabIndex: -1
					}}
					serviceTitle={
						!isMobile ? <Placeholder width={200} height={32} /> : undefined
					}
					navigation={
						<Placeholder
							width={'100%'}
							height={10}
							marginTop={fr.spacing('6v')}
							marginBottom={fr.spacing('4v')}
						/>
					}
					style={{ zIndex: 0 }}
				/>
				<div className={cx(classes.fakeMainContent, fr.cx('fr-container'))}>
					<Placeholder
						height={220}
						marginTop={fr.spacing('6v')}
						marginBottom={fr.spacing('4v')}
					/>
					<Placeholder height={100} marginBottom={fr.spacing('4v')} />
					<Placeholder height={100} marginBottom={fr.spacing('4v')} />
					{selectedIntegrationType === 'modal' && (
						<Placeholder height={220} marginBottom={fr.spacing('4v')} />
					)}
					<div className={classes.previewContent}>{getPreviewContent()}</div>
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
		flexDirection: 'column'
	},
	previewContent: {
		display: 'flex',
		justifyContent: 'center',
		...fr.spacing('margin', { topBottom: '4v' }),
		zIndex: 10
	},
	previewButton: {
		cursor: 'pointer!important',
		userSelect: 'none'
	},
	previewEmbedContainer: { border: 'none', width: '100%', height: '500px' },
	linkPreviewContainer: {
		width: '100%',
		height: '100%',
		position: 'absolute',
		top: 0,
		left: 0,
		background: 'white',
		textAlign: 'center',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 10,
		boxShadow: 'inset 10px 0px 50px 1.99px #00000017',
		p: {
			maxWidth: '500px',
			color: fr.colors.decisions.text.default.grey.default
		}
	},
	previewModalContainer: {
		width: '100%',
		height: '100%',
		position: 'absolute',
		top: 0,
		left: 0
	},
	previewButtonModal: {
		display: 'flex',
		position: 'absolute',
		padding: 0,
		bottom: 24,
		right: 24,
		cursor: 'pointer!important',
		transition: 'transform 0.2s ease',
		img: {
			maxWidth: '200px',
			width: 'auto',
			height: 'auto'
		},
		':hover': {
			transform: 'scale(1.05)'
		}
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
