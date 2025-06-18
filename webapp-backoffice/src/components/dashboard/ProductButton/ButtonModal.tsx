import { CustomModalProps } from '@/src/types/custom';
import { ButtonWithForm } from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { RadioButtons } from '@codegouvfr/react-dsfr/RadioButtons';
import { Button as PrismaButtonType } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	modal: CustomModalProps;
	modalType?: string;
	button?: ButtonWithForm | null;
	onButtonCreatedOrUpdated: (isTest: boolean, button: ButtonWithForm) => void;
	form_id: number;
}

const defaultButton = {
	title: '',
	description: '',
	xwiki_title: null,
	form_id: -1,
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
	const {
		modal,
		modalType = 'create',
		button,
		onButtonCreatedOrUpdated
	} = props;
	const [buttonColor, setButtonColor] = useState<string>('bleu');
	const [errors, setErrors] = useState<FormErrors>({ ...defaultErrors });
	const [currentButton, setCurrentButton] = useState<
		ButtonCreationPayload | ButtonWithForm
	>(defaultButton);

	const buttonCodeClair = `<a href="https://jedonnemonavis.numerique.gouv.fr/Demarches/${button?.form.product_id}?button=${button?.id}" target='_blank' title="Je donne mon avis - nouvelle fenêtre">
      <img src="https://jedonnemonavis.numerique.gouv.fr/static/bouton-${buttonColor}-clair.svg" alt="Je donne mon avis" />
</a>`;

	const buttonCodeSombre = `<a href="https://jedonnemonavis.numerique.gouv.fr/Demarches/${button?.form.product_id}?button=${button?.id}" target='_blank' title="Je donne mon avis - nouvelle fenêtre">
	<img src="https://jedonnemonavis.numerique.gouv.fr/static/bouton-${buttonColor}-sombre.svg" alt="Je donne mon avis" />
	</a>`;

	useEffect(() => {
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
				return 'Copier le code';
			case 'create':
				return 'Créer un bouton';
			case 'edit':
				return 'Modifier un bouton';
			default:
				return '';
		}
	};

	const handleModalClose = (createdOrUpdatedButton: ButtonWithForm) => {
		resetErrors('title');
		onButtonCreatedOrUpdated(
			!!createdOrUpdatedButton.isTest,
			createdOrUpdatedButton
		);
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
			const { form, ...buttonWithoutForm } = currentButton;
			updateButton.mutate(buttonWithoutForm);
		} else {
			createButton.mutate(currentButton);
		}
	};

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
							<div className={fr.cx('fr-col', 'fr-col-12')}>
								<RadioButtons
									className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-9')}
									legend="Type de bouton"
									options={[
										{
											label: 'Bleu',
											hintText: (
												<p className={fr.cx('fr-text--xs', 'fr-mb-0')}>
													Le bouton par défaut, à placer sur un{' '}
													<span className="fr-text--bold">
														fond blanc ou neutre
													</span>
													.
												</p>
											),
											nativeInputProps: {
												defaultChecked: true,
												value: 'blue',
												onClick: () => setButtonColor('bleu')
											}
										},
										{
											label: 'Blanc',
											hintText: (
												<p className={fr.cx('fr-text--xs', 'fr-mb-0')}>
													À placer sur un{' '}
													<span className="fr-text--bold">fond coloré</span>.
												</p>
											),
											nativeInputProps: {
												value: 'white',
												onClick: () => setButtonColor('blanc')
											}
										}
									]}
								/>
							</div>
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
														className={fr.cx('fr-mt-8v')}
														onClick={() => {
															navigator.clipboard.writeText(
																theme === 'clair'
																	? buttonCodeClair
																	: buttonCodeSombre
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
																value:
																	theme === 'clair'
																		? buttonCodeClair
																		: buttonCodeSombre,
																contentEditable: false
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
