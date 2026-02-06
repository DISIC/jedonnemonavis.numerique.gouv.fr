import { ButtonCreationPayload } from '@/src/components/dashboard/ProductButton/ButtonModal';
import ButtonCopyInstructionsPanel from '@/src/components/dashboard/ProductButton/CopyInstructionPanel';
import OnboardingLayout from '@/src/layouts/Onboarding/OnboardingLayout';
import {
	ButtonWithForm,
	ProductWithForms
} from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Input from '@codegouvfr/react-dsfr/Input';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { tss } from 'tss-react/dsfr';
import { getServerSideProps } from '..';
import { useOnboarding } from '@/src/contexts/OnboardingContext';

interface Props {
	product: ProductWithForms;
}

type ButtonStyle = 'solid' | 'outline';

const NewLink = (props: Props) => {
	const { product } = props;
	const router = useRouter();
	const { form_id } = router.query;
	const { cx, classes } = useStyles();
	const { createdProduct, createdForm } = useOnboarding();

	const [selectedButtonStyle, setSelectedButtonStyle] =
		useState<ButtonStyle>('solid');
	const [createdButton, setCreatedButton] = useState<ButtonWithForm>();

	const currentForm = useMemo(() => {
		return product?.forms.find(form => form.id === Number(form_id));
	}, [product?.forms]);

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

	const createButton = trpc.button.create.useMutation({
		onSuccess: async result => {
			setCreatedButton(result.data);
			window._mtm?.push({ category: 'service', action: 'form_link_create' });
		}
	});

	const onSubmit: SubmitHandler<ButtonCreationPayload> = async data => {
		await createButton.mutateAsync({ ...data, form_id: Number(form_id) });
	};

	const goNextStep = () => {
		if (!createdProduct && !createdForm) {
			router.push(
				`/administration/dashboard/product/${product.id}/forms/${form_id}?tab=links&linkCreated=true`
			);
		} else if (!createdProduct && createdForm) {
			router.push(
				`/administration/dashboard/product/${product.id}/forms?formCreated=true`
			);
		} else {
			router.push(`/administration/dashboard/products?onboardingDone=true`);
		}
	};

	return (
		<OnboardingLayout
			isCancelable
			title={createdButton ? 'Copier le code' : "Créer un lien d'intégration"}
			onConfirm={createdButton ? goNextStep : handleSubmit(onSubmit)}
			hideMainHintText={!!createdButton}
			hideBackButton={!!createdButton}
		>
			{createdButton ? (
				<ButtonCopyInstructionsPanel
					buttonColor={selectedButtonStyle === 'solid' ? 'bleu' : 'blanc'}
					button={createdButton}
				/>
			) : (
				<>
					<div
						className={cx(classes.infoContainer, fr.cx('fr-my-8v', 'fr-p-6v'))}
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

						<RadioButtons
							legend="Style du bouton"
							name={'button-style'}
							className={cx(classes.buttonStyles, fr.cx('fr-mb-3v'))}
							options={[
								{
									label: 'Plein',
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
										value: 'solid',
										onChange: e => {
											setSelectedButtonStyle(e.target.value as ButtonStyle);
										},
										checked: selectedButtonStyle === 'solid'
									},
									illustration: (
										<Image
											alt="bouton-je-donne-mon-avis"
											src={`/assets/bouton-bleu-clair.svg`}
											width={200}
											height={85}
										/>
									)
								},
								{
									label: 'Contour',
									hintText: (
										<p className={fr.cx('fr-text--xs', 'fr-mb-0')}>
											À placer sur un{' '}
											<span className="fr-text--bold">fond coloré</span>.
										</p>
									),
									nativeInputProps: {
										value: 'outline',
										onChange: e => {
											setSelectedButtonStyle(e.target.value as ButtonStyle);
										},
										checked: selectedButtonStyle === 'outline'
									},
									illustration: (
										<Image
											alt="bouton-je-donne-mon-avis"
											src={`/assets/bouton-blanc-clair.svg`}
											width={200}
											height={85}
										/>
									)
								}
							]}
						/>
					</form>
				</>
			)}
		</OnboardingLayout>
	);
};

export default NewLink;

const useStyles = tss.withName(NewLink.name).create(() => ({
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

export { getServerSideProps };
