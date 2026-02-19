import { CustomModalProps } from '@/src/types/custom';
import {
	ButtonWithElements,
	FormTemplateButtonWithVariants
} from '@/src/types/prismaTypesExtended';
import { buttonStylesMapping } from '@/src/utils/content';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import { FormTemplateButtonStyle } from '@prisma/client';
import { useEffect, useMemo, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import ImageWithFallback from '../../ui/ImageWithFallback';
import { Loader } from '../../ui/Loader';
import DeleteButtonOrFormPanel from '../Pannels/DeleteButtonOrFormPanel';
import ButtonCopyInstructionsPanel from './CopyInstructionPanel';
import { ButtonModalType } from './interface';

interface Props {
	modal: CustomModalProps;
	modalType?: ButtonModalType;
	button?: ButtonWithElements;
	onButtonMutation: (isTest: boolean, button: ButtonWithElements) => void;
	form_id: number;
	formTemplateButtons?: FormTemplateButtonWithVariants[];
}

type FormErrors = {
	title: { required: boolean };
};

const defaultErrors = {
	title: {
		required: false
	}
};

const ButtonModal = (props: Props) => {
	const { cx, classes } = useStyles();
	const {
		modal,
		modalType = 'edit',
		button,
		onButtonMutation,
		formTemplateButtons
	} = props;

	const [errors, setErrors] = useState<FormErrors>({ ...defaultErrors });
	const [currentButton, setCurrentButton] = useState<ButtonWithElements>();

	const defaultTemplateButton = useMemo(
		() =>
			(button && button.form_template_button) ||
			formTemplateButtons?.find(b => b.isDefault),
		[button, formTemplateButtons]
	);

	const currentDefaultTemplateButton =
		currentButton?.form_template_button || defaultTemplateButton;

	useEffect(() => {
		if (button) {
			const hasManyTemplateButtons =
				formTemplateButtons && formTemplateButtons.length > 1;

			setCurrentButton({
				...button,
				button_style: button.button_style || 'solid',
				form_template_button: hasManyTemplateButtons
					? defaultTemplateButton || null
					: null,
				form_template_button_id: hasManyTemplateButtons
					? defaultTemplateButton?.id || null
					: null
			});
		}
	}, [button]);

	const updateButton = trpc.button.update.useMutation({
		onSuccess: result => {
			setCurrentButton(undefined);
			handleModalClose(result.data);
		}
	});

	const deleteButton = trpc.button.delete.useMutation({
		onSuccess: result => {
			setCurrentButton(undefined);
			handleModalClose(result.data);
		}
	});

	const buttonStyleOptions = useMemo(() => {
		if (!formTemplateButtons) return [];
		return (
			currentDefaultTemplateButton?.variants.filter(
				v => v.theme === 'light' || v.theme === null
			) || []
		);
	}, [currentButton, formTemplateButtons]);

	const hasErrors = (key: keyof FormErrors): boolean => {
		return Object.values(errors[key]).some(value => value === true);
	};

	const resetErrors = (key: keyof FormErrors) => {
		setErrors({ ...errors, [key]: { ...defaultErrors[key] } });
	};

	const displayModalTitle = (): string => {
		switch (modalType) {
			case 'install':
				return 'Copier le code';
			case 'edit':
				return "Modifier un lien d'intégration";
			case 'delete':
				return "Fermer le lien d'intégration";
			default:
				return '';
		}
	};

	const handleModalClose = (createdOrUpdatedButton: ButtonWithElements) => {
		resetErrors('title');
		onButtonMutation(!!createdOrUpdatedButton.isTest, createdOrUpdatedButton);
		modal.close();
	};

	const handleButtonEdit = () => {
		if (!currentButton) return;
		if (!currentButton.title) {
			errors.title.required = true;
			setErrors({ ...errors });
			return;
		}

		currentButton.form_id = props.form_id;

		const {
			form,
			closedButtonLog,
			form_template_button,
			...buttonWithoutForm
		} = currentButton;
		updateButton.mutate(buttonWithoutForm);
	};

	const handleButtonDelete = () => {
		if (currentButton && 'id' in currentButton) {
			const { form, closedButtonLog, ...buttonWithoutForm } = currentButton;
			deleteButton.mutate({
				product_id: form.product_id,
				title: buttonWithoutForm.title,
				buttonPayload: {
					...buttonWithoutForm,
					deleted_at: new Date(),
					delete_reason: currentButton.delete_reason || null,
					isDeleted: true
				}
			});
		}
	};

	const displayModalContent = (): JSX.Element => {
		if (!currentButton) return <Loader />;
		switch (modalType) {
			case 'install':
				return (
					<div>
						<hr />
						<div className={fr.cx('fr-grid-row')}>
							<ButtonCopyInstructionsPanel
								button={currentButton}
								buttonStyle={currentButton.button_style || 'solid'}
								formTemplateButton={
									currentButton.form_template_button || defaultTemplateButton
								}
							/>
						</div>
					</div>
				);
			case 'edit':
				return (
					<div>
						<Input
							id="button-create-title"
							label={
								<p className={fr.cx('fr-mb-0')}>
									Nom du lien d'intégration{' '}
									<span className={cx(classes.asterisk)}>*</span>
								</p>
							}
							nativeInputProps={{
								value: currentButton.title || '',
								name: 'button-create-title',
								onChange: e => {
									setCurrentButton({
										...currentButton,
										title: e.target.value
									});
									resetErrors('title');
								}
							}}
							state={hasErrors('title') ? 'error' : 'default'}
							stateRelatedMessage={'Veuillez compléter ce champ.'}
						/>
						{formTemplateButtons && formTemplateButtons.length > 1 && (
							<div className={fr.cx('fr-col', 'fr-col-12')}>
								<RadioButtons
									legend={<b>Label du bouton</b>}
									name={'button-label'}
									options={formTemplateButtons.map(ftb => ({
										label: ftb.label,
										nativeInputProps: {
											value: ftb.id,
											onChange: () => {
												setCurrentButton({
													...currentButton,
													form_template_button_id: ftb.id
												});
											},
											checked: currentButton.form_template_button_id === ftb.id
										}
									}))}
								/>
							</div>
						)}
						<div className={fr.cx('fr-col', 'fr-col-12')}>
							<RadioButtons
								legend={<b>Style du bouton</b>}
								name={'button-style'}
								className={classes.buttonStyles}
								options={buttonStyleOptions.map(bsOption => {
									const altText =
										bsOption.alt_text ||
										currentButton.form_template_button?.label ||
										currentDefaultTemplateButton?.label ||
										'Illustration du bouton';

									const buttonSlug =
										formTemplateButtons?.find(
											ftb => ftb.id === currentButton.form_template_button_id
										)?.slug ||
										currentDefaultTemplateButton?.slug ||
										'jdma';

									return {
										label: buttonStylesMapping[bsOption.style].label,
										hintText: buttonStylesMapping[bsOption.style].hintText,
										nativeInputProps: {
											value: bsOption.style,
											onChange: () => {
												setCurrentButton({
													...currentButton,
													button_style: bsOption.style
												});
											},
											checked: currentButton.button_style === bsOption.style
										},
										illustration: (
											<ImageWithFallback
												alt={altText}
												src={bsOption.image_url}
												fallbackSrc={`/assets/buttons/button-${buttonSlug}-${bsOption.style}-light.svg`}
												width={200}
												height={85}
											/>
										)
									};
								})}
							/>
						</div>
					</div>
				);
			case 'delete':
				return (
					<div>
						<DeleteButtonOrFormPanel />
						<Input
							id="button-delete-reason"
							label={<p className={fr.cx('fr-mb-0')}>Raison de la fermeture</p>}
							nativeInputProps={{
								name: 'button-delete-reason',

								onChange: e => {
									setCurrentButton({
										...currentButton,
										delete_reason: e.target.value
									});
								}
							}}
						/>
					</div>
				);
			default:
				return <div></div>;
		}
	};

	const displayModalButtons = ():
		| ModalProps.ActionAreaButtonProps
		| [ModalProps.ActionAreaButtonProps, ...ModalProps.ActionAreaButtonProps[]]
		| undefined => {
		switch (modalType) {
			case 'install':
				break;
			case 'edit':
				return [
					{
						children: 'Annuler',
						priority: 'secondary',
						onClick: () => {
							setCurrentButton(undefined);
							resetErrors('title');
						}
					},
					{
						children: 'Modifier',
						onClick: handleButtonEdit,
						doClosesModal: false
					}
				];

			case 'delete':
				return [
					{
						children: 'Annuler',
						priority: 'secondary',
						onClick: () => {
							setCurrentButton(undefined);
						}
					},
					{
						children: "Fermer le lien d'intégration",
						onClick: handleButtonDelete,
						doClosesModal: false
					}
				];
		}

		return;
	};

	return (
		<modal.Component
			title={displayModalTitle()}
			concealingBackdrop={false}
			size="large"
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
			buttons={displayModalButtons()}
		>
			{displayModalContent()}
		</modal.Component>
	);
};

const useStyles = tss.withName(ButtonModal.name).create(() => ({
	textArea: {
		'.fr-input': {
			height: '300px',
			minHeight: '300px'
		}
	},
	topContainer: {
		display: 'flex',
		justifyContent: 'space-between'
	},
	accordion: {
		'.fr-accordion__btn': {
			backgroundColor: '#FFF',
			color: fr.colors.decisions.text.active.grey.default
		},
		'.fr-accordion__btn[aria-expanded=true]': {
			backgroundColor: '#FFF',
			color: fr.colors.decisions.text.active.grey.default,
			'&:hover': {
				backgroundColor: '#FFF'
			},
			'&:active': {
				backgroundColor: '#FFF'
			}
		}
	},
	boldText: {
		fontWeight: 'bold'
	},
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	},
	iframe: {
		width: '100%',
		height: '80vh'
	},
	btnImgContainer: {
		display: 'flex',
		alignItems: 'center'
	},
	blackContainer: {
		backgroundColor: fr.colors.getHex({ isDark: true }).decisions.background
			.default.grey.default
	},
	paddingRight: {
		paddingRight: '1rem',
		[fr.breakpoints.down('md')]: {
			paddingRight: '0'
		}
	},
	paddingLeft: {
		paddingLeft: '1rem',
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

export default ButtonModal;
