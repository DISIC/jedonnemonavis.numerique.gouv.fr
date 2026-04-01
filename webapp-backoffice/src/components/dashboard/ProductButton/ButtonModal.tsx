import { CustomModalProps } from '@/src/types/custom';
import {
	ButtonWithElements,
	FormTemplateButtonWithVariants,
	FormWithElements
} from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { useEffect, useMemo, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { Loader } from '../../ui/Loader';
import DeleteButtonOrFormPanel from '../Pannels/DeleteButtonOrFormPanel';
import ButtonCopyInstructionsPanel from './CopyInstructionPanel';
import { ButtonModalType } from './interface';
import Accordion from '@codegouvfr/react-dsfr/Accordion';

interface Props {
	modal: CustomModalProps;
	modalType?: ButtonModalType;
	button?: ButtonWithElements;
	onButtonMutation: (isTest: boolean, button: ButtonWithElements) => void;
	form_id: number;
	form: FormWithElements;
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
	const { modal, modalType, button, onButtonMutation, formTemplateButtons } =
		props;

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
			const hasTemplateButtons =
				button.integration_type !== 'link' &&
				formTemplateButtons &&
				formTemplateButtons.length > 0;

			setCurrentButton({
				...button,
				form_template_button: hasTemplateButtons
					? defaultTemplateButton || null
					: null,
				form_template_button_id: hasTemplateButtons
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
				return `Copier le ${
					button?.integration_type === 'link' ? 'lien' : 'code'
				}`;
			case 'rename':
				return 'Renommer';
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
			const {
				form,
				closedButtonLog,
				form_template_button,
				...buttonWithoutForm
			} = currentButton;

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
								buttonStyle={currentButton.button_style}
								formTemplateButton={currentButton.form_template_button}
								integrationType={currentButton.integration_type || undefined}
							/>
						</div>
					</div>
				);
			case 'rename':
				return (
					<div>
						<Input
							id="button-rename-title"
							label={
								<p className={fr.cx('fr-mb-0')}>
									Nom du lien d'intégration{' '}
									<span className={cx(classes.asterisk)}>*</span>
								</p>
							}
							nativeInputProps={{
								value: currentButton.title || '',
								name: 'button-rename-title',
								onKeyDown: e => {
									if (e.key === 'Enter') {
										e.preventDefault();
										handleButtonEdit();
									}
								},
								onChange: e => {
									setCurrentButton({
										...currentButton,
										title: e.target.value
									});
									resetErrors('title');
								}
							}}
							hintText="Visible uniquement par vous et les autres membres de l’équipe"
							state={hasErrors('title') ? 'error' : 'info'}
							stateRelatedMessage={
								hasErrors('title')
									? 'Veuillez compléter ce champ.'
									: 'Vous pouvez modifier ce nom par défaut. Le nom du lien n’a pas d’influence sur le style du bouton'
							}
						/>
						<Accordion label="Comment nommer un lien d’intégration ?">
							<div className={cx(classes.accordionContent)}>
								<p>
									Nous vous conseillons d’utiliser un nom qui indique l’
									<strong>emplacement</strong> du lien sur votre site, ou le
									<strong> parcours</strong> dans lequel il est placé, afin de
									pouvoir l'identifier facilement.
								</p>
								<p>
									Le <strong>format</strong> du formulaire est toujours affiché
									à côté du nom (parfois avec le style de bouton choisi, si
									l'option est proposée).
								</p>
								<p>
									Un nom clair vous permettra également{' '}
									<strong>
										d’identifier facilement la source des réponses dans les
										statistiques.
									</strong>
									<br />
									<a
										href="https://docs.numerique.gouv.fr/docs/e6e0fbd2-40f5-4fc5-906f-8043e7f9359b"
										target="_blank"
									>
										En savoir plus
									</a>
								</p>
							</div>
						</Accordion>
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

			case 'rename':
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
						children: 'Renommer',
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
			className={cx(
				classes.modal,
				fr.cx(
					'fr-grid-row',
					'fr-grid-row--center',
					'fr-grid-row--gutters',
					'fr-my-0'
				)
			)}
			buttons={displayModalButtons()}
		>
			{displayModalContent()}
		</modal.Component>
	);
};

const useStyles = tss.withName(ButtonModal.name).create(() => ({
	modal: {
		'.fr-modal__header': {
			paddingBottom: 0
		}
	},
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
	accordionContent: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('2v'),
		padding: fr.spacing('6v'),
		backgroundColor: fr.colors.decisions.background.contrast.grey.default,
		p: {
			marginBottom: fr.spacing('3v'),
			':last-child': {
				marginBottom: 0
			}
		},
		a: {
			display: 'inline-block',
			marginTop: fr.spacing('2v'),
			color: fr.colors.decisions.text.title.blueFrance.default,
			fontSize: '14px'
		}
	},
	boldText: {
		fontWeight: 'bold'
	},
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
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
