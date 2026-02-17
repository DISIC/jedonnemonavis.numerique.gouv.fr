import {
	FormTemplateButtonWithVariants,
	ProductWithForms
} from '@/src/types/prismaTypesExtended';
import { buttonStylesMapping } from '@/src/utils/content';
import { fr } from '@codegouvfr/react-dsfr';
import Input from '@codegouvfr/react-dsfr/Input';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import { FormTemplateButtonStyle } from '@prisma/client';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { tss } from 'tss-react/dsfr';
import ImageWithFallback from '../../ui/ImageWithFallback';
import { ButtonCreationPayload } from './ButtonModal';
import { LinkIntegrationTypes } from './interface';

type ButtonFormProps = {
	currentForm?: ProductWithForms['forms'][number];
	formTemplateButtons?: FormTemplateButtonWithVariants[];
	selectedButtonStyle: FormTemplateButtonStyle;
	setSelectedButtonStyle: React.Dispatch<
		React.SetStateAction<FormTemplateButtonStyle>
	>;
	selectedFormTemplateButton?: FormTemplateButtonWithVariants;
	setSelectedFormTemplateButton: React.Dispatch<
		React.SetStateAction<FormTemplateButtonWithVariants | undefined>
	>;
	selectedIntegrationType: LinkIntegrationTypes;
};

const ButtonForm = ({
	currentForm,
	selectedButtonStyle,
	setSelectedButtonStyle,
	selectedIntegrationType,
	selectedFormTemplateButton,
	setSelectedFormTemplateButton,
	formTemplateButtons
}: ButtonFormProps) => {
	const { cx, classes } = useStyles();

	const showButtonStyleOptions = !['link', 'embed'].includes(
		selectedIntegrationType
	);

	const defaultTitle = useMemo(() => {
		const baseTitle = 'Lien d’intégration';
		if (!currentForm || currentForm.buttons.length === 0)
			return `${baseTitle} 1`;

		const existingButtons = currentForm.buttons.filter(b =>
			b.title.startsWith(baseTitle)
		);

		if (existingButtons.length === 0) return `${baseTitle} 1`;

		return `${baseTitle} ${existingButtons.length + 1}`;
	}, [currentForm]);

	const buttonStyleOptions = useMemo(() => {
		if (!formTemplateButtons) return [];
		return (
			selectedFormTemplateButton?.variants.filter(
				v => v.theme === 'light' || v.theme === null
			) || []
		);
	}, [selectedFormTemplateButton]);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm<ButtonCreationPayload>({
		defaultValues: {
			title: defaultTitle || ''
		}
	});

	useEffect(() => {
		if (formTemplateButtons) {
			const defaultButton = formTemplateButtons.find(b => b.isDefault);
			setSelectedFormTemplateButton(defaultButton);
		}
	}, [formTemplateButtons]);

	return (
		<>
			<div
				className={cx(classes.infoContainer, fr.cx('fr-mb-8v', 'fr-p-6v'))}
				style={{ justifyContent: 'start' }}
			>
				<div className={classes.iconContainer}>
					<i className={cx(fr.cx('ri-code-line', 'fr-icon--lg'))} />
				</div>
				<p className={fr.cx('fr-mb-0', 'fr-ml-6v', 'fr-col--middle')}>
					Le lien d’intégration est un code à copier sur votre site qui
					s’affiche comme un bouton “Je donne mon avis”.
				</p>
			</div>
			<form id="new-link-form">
				<div className={fr.cx('fr-input-group')}>
					<Controller
						control={control}
						name="title"
						rules={{ required: 'Ce champ est obligatoire' }}
						render={({ field: { onChange, value, name } }) => {
							return (
								<>
									<Input
										id="button-create-title"
										label={
											<p className={fr.cx('fr-mb-0')}>
												Nom du lien d’intégration{' '}
												<span className={cx(classes.asterisk)}>*</span>
											</p>
										}
										hintText={
											<span className={fr.cx('fr-hint-text')}>
												Visible uniquement par vous et les autres membres de
												l’équipe.{' '}
											</span>
										}
										nativeInputProps={{
											onChange,
											value,
											name: 'button-create-title',
											required: true
										}}
										state={'info'}
										stateRelatedMessage={
											'Vous pouvez modifier ce nom par défaut. Le nom du lien n’a pas d’influence sur le style du bouton'
										}
									/>
									{errors[name] && (
										<p className={fr.cx('fr-error-text')}>
											{errors[name]?.message}
										</p>
									)}
								</>
							);
						}}
					/>
				</div>

				{formTemplateButtons && formTemplateButtons.length > 1 && (
					<RadioButtons
						legend={
							<>
								Label du bouton <span className={cx(classes.asterisk)}>*</span>
							</>
						}
						name={'button-label'}
						className={cx(fr.cx('fr-my-8v'))}
						options={formTemplateButtons.map(ftb => ({
							label: ftb.label,
							nativeInputProps: {
								value: ftb.id,
								onChange: () => setSelectedFormTemplateButton(ftb),
								checked: selectedFormTemplateButton?.id === ftb.id
							}
						}))}
					/>
				)}

				{showButtonStyleOptions && selectedFormTemplateButton && (
					<RadioButtons
						legend="Style du bouton"
						name={'button-style'}
						className={cx(classes.buttonStyles, fr.cx('fr-mb-3v'))}
						options={buttonStyleOptions.map(bsOption => ({
							label: buttonStylesMapping[bsOption.style].label,
							hintText: buttonStylesMapping[bsOption.style].hintText,
							nativeInputProps: {
								value: bsOption.style,
								onChange: () => {
									setSelectedButtonStyle(bsOption.style);
								},
								checked: selectedButtonStyle === bsOption.style
							},
							illustration: (
								<ImageWithFallback
									alt={bsOption.alt_text || selectedFormTemplateButton?.label}
									src={bsOption.image_url}
									fallbackSrc={`/assets/buttons/button-${selectedFormTemplateButton.slug}-${bsOption.style}-light.svg`}
									width={200}
									height={85}
								/>
							)
						}))}
					/>
				)}
			</form>
		</>
	);
};

const useStyles = tss.withName(ButtonForm.name).create(() => ({
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	},
	infoContainer: {
		display: 'flex',
		justifyContent: 'center',
		width: '100%',
		backgroundColor: fr.colors.options.blueEcume._950_100.default
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
	buttonStyles: {
		'.fr-radio-rich__img': {
			width: '14rem',
			img: {
				maxWidth: '85%',
				maxHeight: '85%',
				minWidth: '3.5rem',
				minHeight: '3.5rem'
			}
		}
	}
}));

export default ButtonForm;
