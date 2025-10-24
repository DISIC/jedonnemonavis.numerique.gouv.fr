import EntityModal from '@/src/components/dashboard/Entity/EntityModal';
import OnboardingLayout from '@/src/layouts/Onboarding/OnboardingLayout';
import { createFilterOptionsWithArgument } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Input from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Autocomplete } from '@mui/material';
import { Entity, Product } from '@prisma/client';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { tss } from 'tss-react/dsfr';
import { useDebounce } from 'usehooks-ts';

type FormValues = Omit<Product, 'id' | 'urls' | 'created_at' | 'updated_at'>;

const entity_modal = createModal({
	id: 'entity-modal',
	isOpenedByDefault: false
});

const NewProduct = () => {
	const router = useRouter();
	const { cx, classes } = useStyles();

	const [product, setProduct] = useState<Product>();
	const [search, _] = useState<string>('');
	const debouncedSearch = useDebounce(search, 500);
	const [selectedEntityValue, setSelectedEntityValue] = useState<
		number | undefined
	>(product?.entity_id);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm<FormValues>({
		defaultValues: product ? { ...product } : {}
	});

	const {
		data: entitiesResult,
		isLoading: isLoadingEntities,
		refetch: refetchEntities
	} = trpc.entity.getList.useQuery(
		{
			numberPerPage: 1000,
			search: debouncedSearch
		},
		{
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

	const onNewEntitySubmit = async (newEntity?: Entity) => {
		await refetchEntities();
		setSelectedEntityValue(newEntity?.id);
		entity_modal.close();
	};

	const onLocalSubmit: SubmitHandler<FormValues> = async data => {
		const { ...tmpProduct } = data;

		let productId;

		if (product && product.id) {
			await updateProduct.mutateAsync({
				id: product.id,
				product: {
					...tmpProduct,
					forms: undefined
				}
			});
		} else {
			const savedProductResponse = await saveProductTmp.mutateAsync({
				...tmpProduct
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
	};

	return (
		<OnboardingLayout
			isCancelable
			title="Ajouter un service numérique"
			onCancel={() => router.push('/administration/dashboard/products')}
			onConfirm={handleSubmit(onLocalSubmit)}
		>
			<EntityModal
				modal={entity_modal}
				onSubmit={newEntity => onNewEntitySubmit(newEntity)}
			/>
			<form id="product-form">
				<div className={cx(fr.cx('fr-input-group'), classes.popperOverride)}>
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
									loading={isLoadingEntities}
									loadingText="Chargement des organisations..."
									filterOptions={createFilterOptionsWithArgument(true)}
									onChange={(_, optionSelected) => {
										if (optionSelected?.value === -1) {
											entity_modal.open();
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
											<Input
												nativeInputProps={{
													...params.inputProps,
													type: 'search',
													required: true,
													placeholder: 'Rechercher une organisation'
												}}
												iconId="fr-icon-arrow-down-s-line"
												label={
													<p className={fr.cx('fr-mb-0')}>
														Organisation{' '}
														<span className={cx(classes.asterisk)}>*</span>
													</p>
												}
												hintText={
													<>
														<span className={fr.cx('fr-hint-text')}>
															Exemples : Direction Générale des Finances
															(DGFIP), Académie de Dijon
														</span>
													</>
												}
												state="info"
												stateRelatedMessage={
													'Vous pouvez ajouter votre organisation si elle n’apparait pas dans la liste'
												}
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
													className={cx(classes.buttonSelect, fr.cx('fr-p-3v'))}
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
				</div>
				<div className={fr.cx('fr-input-group')}>
					<Controller
						control={control}
						name="title"
						rules={{ required: 'Ce champ est obligatoire' }}
						render={({ field: { onChange, value, name } }) => {
							return (
								<Input
									label={
										<p className={fr.cx('fr-mb-0')}>
											Nom du service{' '}
											<span className={cx(classes.asterisk)}>*</span>
										</p>
									}
									hintText={
										<>
											<span className={fr.cx('fr-hint-text')}>
												Visible uniquement par vous et les autres membres de
												l’équipe. <br />
												Exemples : Demande de logement social, Service public.fr
											</span>
										</>
									}
									nativeInputProps={{
										onChange,
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
			</form>
		</OnboardingLayout>
	);
};

const useStyles = tss.withName(NewProduct.name).create(() => ({
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
	popperOverride: {
		'.base-Popper-root': {
			top: '-35px !important'
		}
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

export default NewProduct;
