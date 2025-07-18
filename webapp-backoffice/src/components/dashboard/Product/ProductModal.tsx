import { fr } from '@codegouvfr/react-dsfr';
import { Checkbox } from '@codegouvfr/react-dsfr/Checkbox';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { tss } from 'tss-react/dsfr';
import { useDebounce } from 'usehooks-ts';
import Button from '@codegouvfr/react-dsfr/Button';
import Autocomplete from '@mui/material/Autocomplete';
import { Entity, Product } from '@prisma/client';
import React, { useEffect, useRef } from 'react';
import { trpc } from '@/src/utils/trpc';
import {
	Controller,
	SubmitHandler,
	useFieldArray,
	useForm,
	useFormContext
} from 'react-hook-form';
import { useRouter } from 'next/router';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import {
	autocompleteFilterOptions,
	createFilterOptionsWithArgument
} from '@/src/utils/tools';
import { on } from 'events';
import { Icon } from '@mui/material';
import { push } from '@socialgouv/matomo-next';
import { CustomModalProps } from '@/src/types/custom';

interface Props {
	modal: CustomModalProps;
	product?: Product;
	fromEmptyState?: boolean;
	savedTitle?: string;
	onSubmit: () => void;
	onTitleChange?: (title: string) => void;
	allowCreateEntity: boolean;
	onNewEntity: () => void;
	newCreatedEntity?: Entity;
}

type FormValues = Omit<Product, 'id' | 'urls' | 'created_at' | 'updated_at'> & {
	urls: { value: string }[];
};

const ProductModal = (props: Props) => {
	const {
		modal,
		product,
		fromEmptyState,
		savedTitle,
		onTitleChange,
		onSubmit,
		onNewEntity,
		allowCreateEntity,
		newCreatedEntity
	} = props;
	const { cx, classes } = useStyles();
	const [search, _] = React.useState<string>('');
	const debouncedSearch = useDebounce(search, 500);
	const lastUrlRef = useRef<HTMLInputElement>(null);
	const router = useRouter();
	const modalOpen = useIsModalOpen(modal);
	const [selectedEntityValue, setSelectedEntityValue] = React.useState<
		number | undefined
	>(product ? product.entity_id : newCreatedEntity?.id);
	const [selectedTitle, setSelectedTitle] = React.useState<string | undefined>(
		''
	);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm<FormValues>({
		defaultValues: product
			? { ...product, urls: product.urls.map(url => ({ value: url })) }
			: savedTitle
				? { title: savedTitle, urls: [{ value: '' }] }
				: { urls: [{ value: '' }] }
	});

	const {
		fields: urls,
		append: appendUrl,
		remove: removeUrl
	} = useFieldArray({
		control,
		name: 'urls'
	});

	const { data: entitiesResult, isLoading: isLoadingEntities } =
		trpc.entity.getList.useQuery(
			{
				numberPerPage: 1000,
				search: debouncedSearch
			},
			{
				enabled: modalOpen,
				initialData: { data: [], metadata: { count: 0, myEntities: [] } }
			}
		);

	const { data: entities } = entitiesResult;

	const entityOptions = entities.map(entity => ({
		label: `${entity.name} (${entity.acronym})`,
		value: entity.id
	}));

	const utils = trpc.useUtils();

	const saveProductTmp = trpc.product.create.useMutation({
		onSuccess: () => {
			utils.adminEntityRight.getUserList.invalidate();
		}
	});
	const updateProduct = trpc.product.update.useMutation({
		onSuccess: () => {
			utils.adminEntityRight.getUserList.invalidate();
		}
	});

	const onLocalSubmit: SubmitHandler<FormValues> = async data => {
		const { urls, ...tmpProduct } = data;

		const filteredUrls = urls
			.filter(url => url.value !== '')
			.map(url => url.value);

		let productId;

		if (product && product.id) {
			await updateProduct.mutateAsync({
				id: product.id,
				product: {
					...tmpProduct,
					forms: undefined,
					urls: filteredUrls
				}
			});
		} else {
			const savedProductResponse = await saveProductTmp.mutateAsync({
				...tmpProduct,
				urls: filteredUrls
			});
			productId = savedProductResponse.data.id;
		}

		if (productId) {
			router
				.push(`/administration/dashboard/product/${productId}/forms`)
				.then(() => {
					window.location.reload();
				});
		}

		onSubmit();
		modal.close();
	};

	useIsModalOpen(modal, {
		onConceal: () => {
			reset();
		}
	});

	const handleRemoveUrl = (index: number) => {
		const shouldFocusPreviousUrl = index !== 0;
		removeUrl(index);
		if (shouldFocusPreviousUrl) {
			const previousIndex = index - 1;
			const previousInputRef = document.querySelector(
				`input[name="urls.${previousIndex}.value"]`
			) as HTMLInputElement | null;
			if (previousInputRef) {
				previousInputRef.focus();
			}
		}
		push(['trackEvent', 'BO - Product', `Remove-URL`]);
	};

	const handleAppendUrl = () => {
		appendUrl({ value: '' });
		setTimeout(() => {
			const newInputRef = document.querySelector(
				`input[name="urls.${urls.length}.value"]`
			) as HTMLInputElement | null;

			if (newInputRef) {
				newInputRef.focus();
			}
		}, 100);
		push(['trackEvent', 'BO - Product', `Add-URL`]);
	};

	useEffect(() => {
		if (product) {
			reset({ ...product, urls: product.urls.map(url => ({ value: url })) });
		} else {
			reset({ title: '', entity_id: undefined, urls: [{ value: '' }] });
		}
	}, [product]);

	useEffect(() => {
		if (newCreatedEntity?.id) {
			setSelectedEntityValue(newCreatedEntity.id);
		}
	}, [newCreatedEntity]);

	useEffect(() => {
		setSelectedTitle(savedTitle);
	}, [modalOpen]);

	return (
		<modal.Component
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
			concealingBackdrop={false}
			title={
				product && product.id
					? 'Modifier les informations du service'
					: 'Ajouter un nouveau service'
			}
			size="large"
			buttons={[
				{
					children: 'Annuler'
				},
				{
					doClosesModal: false,
					onClick: handleSubmit(onLocalSubmit),
					children: product && product.id ? 'Sauvegarder' : 'Ajouter ce service'
				}
			]}
		>
			<p className={fr.cx('fr-hint-text')}>
				Les champs marqués d&apos;un{' '}
				<span className={cx(classes.asterisk)}>*</span> sont obligatoires
			</p>
			<form id="product-form">
				<div className={fr.cx('fr-input-group')}>
					<Controller
						control={control}
						name="title"
						rules={{ required: 'Ce champ est obligatoire' }}
						render={({ field: { onChange, value, name } }) => {
							useEffect(() => {
								if (selectedTitle) {
									onChange(selectedTitle);
								}
							}, [selectedTitle]);
							return (
								<Input
									label={
										<p className={fr.cx('fr-mb-0')}>
											Nom du service{' '}
											<span className={cx(classes.asterisk)}>*</span>
										</p>
									}
									nativeInputProps={{
										onChange: e => {
											onChange(e);
											if (onTitleChange) onTitleChange(e.target.value);
										},
										value,
										name,
										required: true
									}}
									state={errors[name] ? 'error' : 'default'}
									stateRelatedMessage={errors[name]?.message}
								/>
							);
						}}
					/>
				</div>
				<div className={fr.cx('fr-input-group')}>
					<label
						htmlFor={'entity-select-autocomplete'}
						className={fr.cx('fr-label', 'fr-mb-1w')}
					>
						Organisation <span className={cx(classes.asterisk)}>*</span>
					</label>
					{!isLoadingEntities && entityOptions.length > 0 && (
						<Controller
							name="entity_id"
							control={control}
							rules={{ required: 'Ce champ est obligatoire' }}
							render={({ field: { onChange, value, name } }) => {
								useEffect(() => {
									onChange(selectedEntityValue);
								}, [selectedEntityValue]);
								return (
									<Autocomplete
										disablePortal
										id="entity-select-autocomplete"
										noOptionsText="Aucune organisation trouvée"
										sx={{ width: '100%' }}
										options={entityOptions}
										filterOptions={createFilterOptionsWithArgument(
											allowCreateEntity
										)}
										onChange={(_, optionSelected) => {
											if (optionSelected?.value === -1) {
												onNewEntity();
											} else {
												setSelectedEntityValue(optionSelected?.value);
											}
										}}
										isOptionEqualToValue={option => option.value === value}
										defaultValue={entityOptions.find(
											option => option.value === selectedEntityValue
										)}
										value={
											selectedEntityValue
												? entityOptions.find(
														option => option.value === selectedEntityValue
													)
												: { label: '', value: undefined }
										}
										renderInput={params => (
											<div
												ref={params.InputProps.ref}
												className={fr.cx(
													'fr-input-group',
													errors[name] ? 'fr-input-group--error' : undefined
												)}
											>
												<input
													{...params.inputProps}
													className={cx(
														params.inputProps.className,
														fr.cx('fr-input'),
														errors[name] ? 'fr-input--error' : undefined
													)}
													placeholder="Rechercher une organisation"
													type="search"
													required
												/>
												{errors[name] && (
													<p className={fr.cx('fr-error-text')}>
														{errors[name]?.message}
													</p>
												)}
											</div>
										)}
										renderOption={(props, option) => (
											<li
												{...props}
												className={fr.cx(
													option.value === -1 ? 'fr-p-0' : 'fr-p-3v'
												)}
											>
												{option.value === -1 ? (
													<div
														className={cx(
															classes.buttonSelect,
															fr.cx('fr-p-3v')
														)}
													>
														<span className={fr.cx('fr-mr-2v')}>
															{option.label}
														</span>
														<i className={fr.cx('fr-icon-add-circle-line')} />
													</div>
												) : (
													option.label
												)}
											</li>
										)}
									/>
								);
							}}
						/>
					)}
				</div>

				<div className={fr.cx('fr-input-group')}>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
						<fieldset className={cx(classes.fieldset)}>
							<legend>URL(s)</legend>
							{urls.map((url, index) => (
								<div key={url.id} className={cx(classes.flexContainer)}>
									<Controller
										control={control}
										name={`urls.${index}.value`}
										rules={{
											pattern: {
												value: /^(http|https):\/\/[^ "]+$/,
												message: "Format d'url invalide"
											}
										}}
										render={({ field: { onChange, value, name } }) => (
											<Input
												className={cx(classes.autocomplete, fr.cx('fr-mb-0'))}
												id={name}
												hideLabel={true}
												label={`URL ${index + 1}`}
												state={errors['urls']?.[index] ? 'error' : 'default'}
												stateRelatedMessage={`${errors['urls']?.[index]?.value?.message}. Format attendu : https://exemple.com `}
												nativeInputProps={{
													name,
													value,
													onChange,
													placeholder: 'Ex: https://exemple.com'
												}}
												ref={index === urls.length - 1 ? lastUrlRef : null}
											/>
										)}
									/>
									{index !== 0 && (
										<Button
											title={`Supprimer l'adresse web n°${index + 1}`}
											aria-label={`Supprimer l'adresse web n°${index + 1}`}
											priority="secondary"
											type="button"
											className={cx(classes.innerButton)}
											onClick={() => handleRemoveUrl(index)}
										>
											<i className="ri-delete-bin-line"></i>
											<span className="fr-sr-only">Supprimer</span>
										</Button>
									)}
								</div>
							))}
							<Button
								priority="secondary"
								iconId="fr-icon-add-line"
								className={fr.cx('fr-mt-1w')}
								iconPosition="left"
								type="button"
								onClick={() => handleAppendUrl()}
							>
								Ajouter un URL
							</Button>
						</fieldset>
					</div>
				</div>

				<div className={fr.cx('fr-input-group')}>
					<legend className={fr.cx('fr-label', 'fr-mb-1w')}>Options</legend>
					<Controller
						name="isPublic"
						control={control}
						defaultValue={product?.isPublic ?? false}
						render={({ field: { value, onChange, name } }) => (
							<Checkbox
								options={[
									{
										label: 'Rendre les statistiques publiques',
										nativeInputProps: {
											name,
											checked: !!value,
											onChange: e => onChange(e.target.checked)
										}
									}
								]}
							/>
						)}
					/>
				</div>
			</form>
		</modal.Component>
	);
};

const useStyles = tss.withName(ProductModal.name).create(() => ({
	flexContainer: {
		display: 'flex',
		alignItems: 'center',
		padding: '0.3rem 0'
	},
	innerButton: {
		alignSelf: 'baseline',
		marginTop: '0.5rem',
		marginLeft: '1rem'
	},
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	},
	autocomplete: {
		width: '100%'
	},
	fieldset: {
		ul: {
			listStyle: 'none',
			...fr.spacing('margin', { topBottom: 0, rightLeft: 0 }),
			paddingLeft: 0,
			width: '100%'
		},
		border: 'none',
		padding: 0
	},
	buttonSelect: {
		color: 'white',
		backgroundColor:
			fr.colors.decisions.background.actionHigh.blueFrance.default,
		display: 'flex',
		justifyContent: 'center',
		cursor: 'pointer',
		i: {
			['&::before']: {
				'--icon-size': '1.1rem'
			}
		}
	}
}));
export default ProductModal;
