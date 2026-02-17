import { CustomModalProps } from '@/src/types/custom';
import {
	ButtonWithClosedLog,
	ButtonWithForm,
	ButtonWithTemplateButton,
	FormTemplateButtonWithVariants
} from '@/src/types/prismaTypesExtended';
import { buttonStylesMapping } from '@/src/utils/content';
import { getButtonCode } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { RadioButtons } from '@codegouvfr/react-dsfr/RadioButtons';
import {
	FormTemplateButtonStyle,
	Button as PrismaButtonType
} from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import { useEffect, useMemo, useState } from 'react';
import ImageWithFallback from '../../ui/ImageWithFallback';
import DeleteButtonOrFormPanel from '../Pannels/DeleteButtonOrFormPanel';
import { tss } from 'tss-react/dsfr';

export type ButtonModalType = 'install' | 'create' | 'edit' | 'delete';

interface Props {
	modal: CustomModalProps;
	modalType?: ButtonModalType;
	button?: (ButtonWithForm & ButtonWithTemplateButton) | null;
	onButtonMutation: (
		isTest: boolean,
		button: ButtonWithForm & ButtonWithTemplateButton
	) => void;
	form_id: number;
	formTemplateButtons?: FormTemplateButtonWithVariants[];
}

const defaultButton: ButtonCreationPayload | ButtonWithForm = {
	title: '',
	description: '',
	xwiki_title: null,
	form_id: -1,
	form_template_button_id: -1,
	last_selected_style: 'solid',
	isTest: false,
	delete_reason: null,
	deleted_at: null,
	isDeleted: false
};

type FormErrors = {
	title: { required: boolean };
};

const defaultErrors = {
	title: {
		required: false
	}
};

export type ButtonCreationPayload = Omit<
	PrismaButtonType,
	'id' | 'created_at' | 'updated_at'
>;

const ButtonModal = (props: Props) => {
	const { cx, classes } = useStyles();
	const {
		modal,
		modalType = 'create',
		button,
		onButtonMutation,
		formTemplateButtons
	} = props;

	const [buttonStyle, setButtonStyle] =
		useState<FormTemplateButtonStyle>('solid');
	const [errors, setErrors] = useState<FormErrors>({ ...defaultErrors });
	const [currentButton, setCurrentButton] = useState<
		ButtonCreationPayload | (ButtonWithForm & ButtonWithClosedLog)
	>(defaultButton);
	const [selectedFormTemplateButton, setSelectedFormTemplateButton] =
		useState<FormTemplateButtonWithVariants>();

	const defaultTemplateButton = useMemo(
		() => formTemplateButtons?.find(b => b.isDefault),
		[formTemplateButtons]
	);

	useEffect(() => {
		if (button) {
			setCurrentButton(button);
			if (button.form_template_button && button.last_selected_style) {
				setSelectedFormTemplateButton(button.form_template_button);
				setButtonStyle(button.last_selected_style);
			} else {
				setSelectedFormTemplateButton(defaultTemplateButton);
				setButtonStyle('solid');
			}
		} else {
			setCurrentButton(defaultButton);
		}
	}, [button]);

	const createButton = trpc.button.create.useMutation({
		onSuccess: result => {
			setCurrentButton(defaultButton);
			handleModalClose(result.data);
		}
	});

	const updateButton = trpc.button.update.useMutation({
		onSuccess: result => {
			setCurrentButton(defaultButton);
			handleModalClose(result.data);
		}
	});

	const deleteButton = trpc.button.delete.useMutation({
		onSuccess: result => {
			setCurrentButton(defaultButton);
			handleModalClose(result.data);
		}
	});

	const buttonStyleOptions = useMemo(() => {
		if (!formTemplateButtons) return [];
		return (
			selectedFormTemplateButton?.variants.filter(
				v => v.theme === 'light' || v.theme === null
			) || []
		);
	}, [selectedFormTemplateButton, formTemplateButtons]);

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
			case 'create':
				return "Créer un lien d'intégration";
			case 'edit':
				return "Modifier un lien d'intégration";
			case 'delete':
				return "Fermer le lien d'intégration";
			default:
				return '';
		}
	};

	const handleModalClose = (
		createdOrUpdatedButton: ButtonWithForm & ButtonWithTemplateButton
	) => {
		resetErrors('title');
		onButtonMutation(!!createdOrUpdatedButton.isTest, createdOrUpdatedButton);
		modal.close();
	};

	const handleButtonCreateOrEdit = () => {
		if (!currentButton.title) {
			errors.title.required = true;
			setErrors({ ...errors });
			return;
		}

		currentButton.form_id = props.form_id;

		if ('id' in currentButton) {
			const { form, closedButtonLog, ...buttonWithoutForm } = currentButton;
			updateButton.mutate(buttonWithoutForm);
		} else {
			createButton.mutate(currentButton);
		}
	};

	const handleButtonDelete = () => {
		if ('id' in currentButton) {
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

	const buttonCodeClair =
		(button &&
			getButtonCode({
				theme: 'clair',
				buttonStyle,
				button,
				formTemplateButton: selectedFormTemplateButton
			})) ||
		'';
	const buttonCodeSombre =
		(button &&
			getButtonCode({
				theme: 'sombre',
				buttonStyle,
				button,
				formTemplateButton: selectedFormTemplateButton
			})) ||
		'';

	const displayModalContent = (): JSX.Element => {
		switch (modalType) {
			case 'install':
				return (
					<div>
						<p>
							Pour installer le bouton JDMA et récolter les avis, copiez-collez
							le code ci-dessous dans votre service numérique ou dans le champ
							dédié sur Démarche simplifiée.
						</p>
						<div className={fr.cx('fr-grid-row')}>
							{formTemplateButtons && formTemplateButtons.length > 1 && (
								<div className={fr.cx('fr-col', 'fr-col-12')}>
									<RadioButtons
										legend={<b>Label du bouton</b>}
										name={'button-label'}
										options={formTemplateButtons.map(ftb => ({
											label: ftb.label,
											nativeInputProps: {
												value: ftb.id,
												onChange: () => setSelectedFormTemplateButton(ftb),
												checked: selectedFormTemplateButton?.id === ftb.id
											}
										}))}
									/>
								</div>
							)}
							<div className={fr.cx('fr-col', 'fr-col-12')}>
								<RadioButtons
									legend={<b>Style du bouton</b>}
									name={'button-style'}
									className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-9')}
									options={buttonStyleOptions.map(bsOption => ({
										label: buttonStylesMapping[bsOption.style].label,
										hintText: buttonStylesMapping[bsOption.style].hintText,
										nativeInputProps: {
											value: bsOption.style,
											onChange: () => {
												setButtonStyle(bsOption.style);
											},
											checked: buttonStyle === bsOption.style
										}
									}))}
								/>
							</div>
							{['clair', 'sombre'].map(theme => {
								const isLight = theme === 'clair';
								const enTheme = isLight ? 'light' : 'dark';
								const currentVariant =
									selectedFormTemplateButton?.variants.find(
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
																selectedFormTemplateButton?.label ||
																`bouton-je-donne-mon-avis`
															}
															src={currentVariant?.image_url || ''}
															fallbackSrc={`/assets/buttons/button-${selectedFormTemplateButton?.slug}-${buttonStyle}-${enTheme}.svg`}
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
														className={fr.cx('fr-mt-8v')}
														onClick={() => {
															if (!buttonCodeClair || !buttonCodeSombre) return;
															navigator.clipboard.writeText(
																isLight ? buttonCodeClair : buttonCodeSombre
															);
															modal.close();
															push(['trackEvent', 'BO - Product', `Copy-Code`]);
														}}
													>
														Copier le code
													</Button>
													<div className={fr.cx('fr-input-group', 'fr-mt-2v')}>
														<Input
															className={classes.textArea}
															id="button-code"
															label={`Code à intégrer: Thème ${theme}`}
															textArea
															nativeTextAreaProps={{
																name: 'button-code',
																value: isLight
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
					</div>
				);
			case 'create':
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
						<Input
							id="button-create-description"
							label="Description du lien d'intégration"
							textArea
							nativeTextAreaProps={{
								value: currentButton.description || '',
								onChange: e => {
									setCurrentButton({
										...currentButton,
										description: e.target.value
									});
								}
							}}
						/>
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
			case 'create':
				return [
					{
						children: 'Annuler',
						priority: 'secondary',
						onClick: () => {
							setCurrentButton(defaultButton);
							resetErrors('title');
						}
					},
					{
						children: 'Créer',
						onClick: handleButtonCreateOrEdit,
						doClosesModal: false
					}
				];
			case 'edit':
				return [
					{
						children: 'Annuler',
						priority: 'secondary',
						onClick: () => {
							setCurrentButton(defaultButton);
							resetErrors('title');
						}
					},
					{
						children: 'Modifier',
						onClick: handleButtonCreateOrEdit,
						doClosesModal: false
					}
				];

			case 'delete':
				return [
					{
						children: 'Annuler',
						priority: 'secondary',
						onClick: () => {
							setCurrentButton(defaultButton);
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
	}
}));

export default ButtonModal;
