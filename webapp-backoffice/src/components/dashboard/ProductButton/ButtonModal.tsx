import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { RadioButtons } from '@codegouvfr/react-dsfr/RadioButtons';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { Accordion } from '@codegouvfr/react-dsfr/Accordion';
import { Button as PrismaButtonType } from '@prisma/client';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { Checkbox } from '@codegouvfr/react-dsfr/Checkbox';
import Image from 'next/image';
import { trpc } from '@/src/utils/trpc';

interface CustomModalProps {
	buttonProps: {
		id: string;
		'aria-controls': string;
		'data-fr-opened': boolean;
	};
	Component: (props: ModalProps) => JSX.Element;
	close: () => void;
	open: () => void;
	isOpenedByDefault: boolean;
	id: string;
}

interface Props {
	isOpen: boolean;
	modal: CustomModalProps;
	modalType: string;
	button?: PrismaButtonType | null;
	onButtonCreatedOrUpdated: (isTest: boolean) => void;
	product_id: number;
}

const defaultButton = {
	title: '',
	description: '',
	xwiki_title: null,
	product_id: -1,
	isTest: false
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
	const { modal, modalType, button, onButtonCreatedOrUpdated } = props;
	const [buttonColor, setButtonColor] = React.useState<string>('bleu');
	const [errors, setErrors] = React.useState<FormErrors>({ ...defaultErrors });
	const [currentButton, setCurrentButton] = React.useState<
		ButtonCreationPayload | PrismaButtonType
	>(defaultButton);

	React.useEffect(() => {
		if (button) {
			setCurrentButton(button);
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

	const hasErrors = (key: keyof FormErrors): boolean => {
		return Object.values(errors[key]).some(value => value === true);
	};

	const resetErrors = (key: keyof FormErrors) => {
		setErrors({ ...errors, [key]: { ...defaultErrors[key] } });
	};

	const displayModalTitle = (): string => {
		switch (modalType) {
			case 'install':
				return 'Code source';
			case 'create':
				return 'Créer un bouton';
			case 'edit':
				return 'Modifier un bouton';
			// case 'archive':
			// 	return 'Archiver un bouton';
			// case 'merge':
			// 	return 'Fusionner avec un autre bouton';
			default:
				return '';
		}
	};

	const handleModalClose = (createdOrUpdatedButton: ButtonCreationPayload) => {
		resetErrors('title');
		onButtonCreatedOrUpdated(!!createdOrUpdatedButton.isTest);
		modal.close();
	};

	const handleButtonCreateOrEdit = () => {
		if (!currentButton.title) {
			errors.title.required = true;
			setErrors({ ...errors });
			return;
		}

		currentButton.product_id = props.product_id;

		if ('id' in currentButton) {
			updateButton.mutate(currentButton);
		} else {
			createButton.mutate(currentButton);
		}
	};

	const buttonCode = `<a href="https://jedonnemonavis.numerique.gouv.fr/Demarches/${button?.product_id}?button=${button?.id}">
      <img src="https://jedonnemonavis.numerique.gouv.fr/static/bouton-${buttonColor}.svg" alt="Je donne mon avis" />
</a>`;

	const displayModalContent = (): JSX.Element => {
		switch (modalType) {
			case 'install':
				return (
					<div>
						<p>
							Pour permettre à vos usagers de donner leur avis sur cette
							démarche, insérez l'un des deux boutons en copiant-collant le code
							source correspondant. <br />
							<br /> Choissisez la couleur du bouton qui correspond le mieux à
							votre charte graphique.
						</p>
						<div className={fr.cx('fr-grid-row')}>
							<RadioButtons
								className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-9')}
								legend="Couleur du bouton"
								options={[
									{
										label: 'Bleu',
										nativeInputProps: {
											defaultChecked: true,
											value: 'blue',
											onClick: () => setButtonColor('bleu')
										}
									},
									{
										label: 'Blanc',
										nativeInputProps: {
											value: 'white',
											onClick: () => setButtonColor('blanc')
										}
									}
								]}
							/>
							<Image
								className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}
								alt="bouton-je-donne-mon-avis"
								src={`/assets/bouton-${buttonColor}.svg`}
								width={150}
								height={85}
							/>
						</div>
						<div className={fr.cx('fr-input-group')}>
							<Input
								className={classes.textArea}
								id="button-code"
								label={`Code à intégrer pour le bouton ${buttonColor}`}
								textArea
								nativeTextAreaProps={{
									name: 'button-code',
									value: buttonCode,
									contentEditable: false
								}}
							/>
						</div>
						<Accordion
							label="Où placer le bouton ?"
							className={classes.accordion}
						>
							<div className={fr.cx('fr-text--xs')}>
								Afin de récolter les retours ponctuel et pertinent, le bouton
								est mieux placé :
								<ul>
									<li>dans l'écran de fin de démarche;</li>
									<li>
										dans un message électronique qui est envoyé à la fin de la
										démarche
									</li>
								</ul>
							</div>
						</Accordion>
						<Accordion
							label="Comment presenter le bouton aux usagers ?"
							className={classes.accordion}
						>
							<div className={fr.cx('fr-text--xs')}>
								Ajouter une phrase explicative en dessus du bouton, comme par
								exemple :<br />
								<br />
								“Aidez-nous à améliorer cette démarche ! Donnez-nous votre avis,
								cela ne prend que 2 minutes.”
							</div>
						</Accordion>
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
									Nom du bouton <span className={cx(classes.asterisk)}>*</span>
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
							label="Description du bouton"
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
						{/* {!('id' in currentButton) && (
							<Checkbox
								options={[
									{
										hintText:
											'Cocher cette case si vous préférez que les avis de ce bouton ne soient pas pris en compte dans les statistiques.',
										label: 'Bouton de test',
										nativeInputProps: {
											name: 'checkboxes-1',
											value: 'isTest',
											onChange: e => {
												setCurrentButton({
													...currentButton,
													isTest: e.target.checked
												});
											}
										}
									}
								]}
							/>
						)} */}
					</div>
				);

			case 'edit':
				return (
					<div>
						<Input
							id="button-edit-title"
							label="Nom du bouton"
							nativeInputProps={{
								onChange: e => {
									setCurrentButton({
										...currentButton,
										title: e.target.value
									});
								}
							}}
						/>
						<Input
							id="button-edit-description"
							label="Description du bouton"
							textArea
							nativeTextAreaProps={{
								onChange: e => {
									setCurrentButton({
										...currentButton,
										description: e.target.value
									});
								}
							}}
						/>
						<Checkbox
							options={[
								{
									hintText:
										'Cocher cette case si vous préférez que les avis de ce bouton ne soient pas pris en compte dans les statistiques.',
									label: 'Bouton de test',
									nativeInputProps: {
										name: 'checkboxes-1',
										checked: button?.isTest || false,
										onChange: e => {
											setCurrentButton({
												...currentButton,
												isTest: e.target.checked
											});
										}
									}
								}
							]}
						/>
					</div>
				);
			// case 'archive':
			// 	return (
			// 		<div>
			// 			<p>
			// 				Vous êtes sur le point d'archiver le bouton{' '}
			// 				<span className={cx(classes.boldText)}>{button?.title}</span>.
			// 				<br />
			// 			</p>
			// 		</div>
			// 	);
			// case 'merge':
			// 	return (
			// 		<div>
			// 			<p>Instructions ...</p>
			// 			<Select label="Fusionner avec" nativeSelectProps={{}}>
			// 				<option value="">Bouton 1</option>
			// 				<option value="">Bouton 2</option>
			// 			</Select>
			// 		</div>
			// 	);
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
			// case 'archive':
			// 	return [
			// 		{
			// 			children: 'Annuler',
			// 			priority: 'secondary',
			// 			onClick: modal.close
			// 		},
			// 		{
			// 			children: 'Oui',
			// 			onClick: modal.close
			// 		}
			// 	];
			// case 'merge':
			// 	return [
			// 		{
			// 			children: 'Annuler',
			// 			priority: 'secondary',
			// 			onClick: modal.close
			// 		},
			// 		{
			// 			children: 'Fusionner les boutons',
			// 			onClick: modal.close
			// 		}
			// 	];
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
			height: '150px',
			minHeight: '150px'
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
	}
}));

export default ButtonModal;
