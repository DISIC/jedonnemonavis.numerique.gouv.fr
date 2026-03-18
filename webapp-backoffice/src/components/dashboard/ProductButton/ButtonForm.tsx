import { FormTemplateButtonWithVariants } from '@/src/types/prismaTypesExtended';
import { buttonStylesMapping } from '@/src/utils/content';
import { fr } from '@codegouvfr/react-dsfr';
import Input from '@codegouvfr/react-dsfr/Input';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import {
	ButtonIntegrationTypes,
	FormTemplateButtonStyle
} from '@prisma/client';
import React, { useEffect, useMemo } from 'react';
import { tss } from 'tss-react/dsfr';
import ImageWithFallback from '../../ui/ImageWithFallback';

type ButtonFormProps = {
	title: string;
	setTitle: React.Dispatch<React.SetStateAction<string>>;
	titleError: boolean;
	formTemplateButtons?: FormTemplateButtonWithVariants[];
	selectedButtonStyle?: FormTemplateButtonStyle;
	setSelectedButtonStyle: React.Dispatch<
		React.SetStateAction<FormTemplateButtonStyle | undefined>
	>;
	selectedFormTemplateButton?: FormTemplateButtonWithVariants;
	setSelectedFormTemplateButton: React.Dispatch<
		React.SetStateAction<FormTemplateButtonWithVariants | undefined>
	>;
	selectedIntegrationType: ButtonIntegrationTypes;
};

const ButtonForm = ({
	title,
	setTitle,
	titleError,
	selectedButtonStyle,
	setSelectedButtonStyle,
	selectedIntegrationType,
	selectedFormTemplateButton,
	setSelectedFormTemplateButton,
	formTemplateButtons
}: ButtonFormProps) => {
	const { cx, classes } = useStyles();

	const showFormattingOptions = !['link', 'embed'].includes(
		selectedIntegrationType
	);

	const buttonStyleOptions = useMemo(() => {
		if (!formTemplateButtons) return [];
		return (
			selectedFormTemplateButton?.variants.filter(
				v => v.theme === 'light' || v.theme === null
			) || []
		);
	}, [selectedFormTemplateButton]);

	useEffect(() => {
		if (selectedIntegrationType !== 'link' && formTemplateButtons) {
			const defaultButton = formTemplateButtons.find(b => b.isDefault);
			setSelectedFormTemplateButton(defaultButton);
			if (!selectedButtonStyle)
				setSelectedButtonStyle(
					selectedIntegrationType === 'modal' ? 'outline' : 'solid'
				);
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
								Visible uniquement par vous et les autres membres de l’équipe.{' '}
							</span>
						}
						nativeInputProps={{
							onChange: event => {
								setTitle(event.target.value);
							},
							value: title,
							name: 'button-create-title',
							required: true
						}}
						state={titleError ? 'error' : 'info'}
						stateRelatedMessage={
							titleError
								? 'Ce champ est obligatoire'
								: 'Vous pouvez modifier ce nom par défaut. Le nom du lien n’a pas d’influence sur le style du bouton'
						}
					/>
				</div>

				{formTemplateButtons &&
					formTemplateButtons.length > 1 &&
					showFormattingOptions && (
						<RadioButtons
							legend={
								<>
									Label du bouton{' '}
									<span className={cx(classes.asterisk)}>*</span>
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

				{showFormattingOptions && selectedFormTemplateButton && (
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
			width: 'auto',
			img: {
				width: 'auto',
				maxWidth: '85%',
				maxHeight: '85%',
				minWidth: '3.5rem',
				minHeight: '3.5rem'
			}
		}
	}
}));

export default ButtonForm;
