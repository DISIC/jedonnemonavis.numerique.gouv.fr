import { fr } from '@codegouvfr/react-dsfr';
import { Checkbox } from '@codegouvfr/react-dsfr/Checkbox';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { tss } from 'tss-react/dsfr';
import { useDebounce } from 'usehooks-ts';
import Button from '@codegouvfr/react-dsfr/Button';
import Autocomplete from '@mui/material/Autocomplete';
import { Product } from '@prisma/client';
import React from 'react';
import { trpc } from '@/src/utils/trpc';
import {
	Controller,
	SubmitHandler,
	useFieldArray,
	useForm
} from 'react-hook-form';

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
	modal: CustomModalProps;
	product?: Product;
	onSubmit: () => void;
}

type FormValues = Omit<Product, 'id' | 'urls' | 'created_at' | 'updated_at'> & {
	urls: { value: string }[];
};

const ProductModal = (props: Props) => {
	const { modal, product } = props;
	const { cx, classes } = useStyles();
	const [search, _] = React.useState<string>('');
	const debouncedSearch = useDebounce(search, 500);

	const {
		control,
		handleSubmit,
		formState: { errors }
	} = useForm<FormValues>({
		defaultValues: product
			? { ...product, urls: product.urls.map(url => ({ value: url })) }
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
			{ numberPerPage: 1000, search: debouncedSearch },
			{
				initialData: { data: [], metadata: { count: 0 } }
			}
		);

	const { data: entities } = entitiesResult;

	const entityOptions = entities.map(entity => ({
		label: `${entity.name} (${entity.acronym})`,
		value: entity.id
	}));

	const saveProductTmp = trpc.product.create.useMutation({});
	const updateProduct = trpc.product.update.useMutation({});

	const onSubmit: SubmitHandler<FormValues> = async data => {
		const { urls, ...tmpProduct } = data;

		const filteredUrls = urls
			.filter(url => url.value !== '')
			.map(url => url.value);

		if (product && product.id) {
			await updateProduct.mutateAsync({
				id: product.id,
				product: {
					...tmpProduct,
					urls: filteredUrls
				}
			});
		} else {
			await saveProductTmp.mutateAsync({
				...tmpProduct,
				urls: filteredUrls
			});
		}

		props.onSubmit();
		modal.close();
	};

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
					? 'Modifier les informations du produit'
					: 'Ajouter un nouveau produit'
			}
			size="large"
			buttons={[
				{
					children:
						product && product.id ? 'Annuler les modifications' : 'Annuler'
				},
				{
					doClosesModal: false,
					onClick: handleSubmit(onSubmit),
					children:
						product && product.id
							? 'Sauvegarder les modifications'
							: 'Ajouter ce produit'
				}
			]}
		>
			<p>
				Les champs marqués d&apos;un{' '}
				<span className={cx(classes.asterisk)}>*</span> sont obligatoires
			</p>
			<form id="product-form">
				<div className={fr.cx('fr-input-group')}>
					<Controller
						control={control}
						name="title"
						rules={{ required: 'Ce champ est obligatoire' }}
						render={({ field: { onChange, value, name } }) => (
							<Input
								label={
									<p className={fr.cx('fr-mb-0')}>
										Nom du produit{' '}
										<span className={cx(classes.asterisk)}>*</span>
									</p>
								}
								nativeInputProps={{
									onChange,
									defaultValue: value
								}}
								state={errors[name] ? 'error' : 'default'}
								stateRelatedMessage={errors[name]?.message}
							/>
						)}
					/>
				</div>
				<div className={fr.cx('fr-input-group')}>
					<label
						htmlFor={'product-description'}
						className={fr.cx('fr-label', 'fr-mb-1w')}
					>
						Entité de rattachement{' '}
						<span className={cx(classes.asterisk)}>*</span>
					</label>
					{!isLoadingEntities && entityOptions.length > 0 && (
						<Controller
							name="entity_id"
							control={control}
							rules={{ required: 'Ce champ est obligatoire' }}
							render={({ field: { onChange, value, name } }) => (
								<Autocomplete
									disablePortal
									id="entity-select-autocomplete"
									noOptionsText="Aucune organisation trouvée"
									sx={{ width: '100%' }}
									options={entityOptions}
									onChange={(_, optionSelected) => {
										onChange(optionSelected?.value);
									}}
									isOptionEqualToValue={option => option.value === value}
									defaultValue={entityOptions.find(
										option => option.value === value
									)}
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
											/>
											{errors[name] && (
												<p className={fr.cx('fr-error-text')}>
													{errors[name]?.message}
												</p>
											)}
										</div>
									)}
								/>
							)}
						/>
					)}
				</div>

				<div className={fr.cx('fr-input-group')}>
					<Controller
						control={control}
						name="isPublic"
						render={({ field: { onChange, value } }) => (
							<Checkbox
								className={fr.cx('fr-mt-3w')}
								options={[
									{
										label: 'Données statistiques publiques',
										hintText:
											'Cocher cette case pour rendre les statistiques de ce produit publiques.',
										nativeInputProps: {
											name: 'essential',
											onChange,
											checked: value === true
										}
									}
								]}
							/>
						)}
					/>
				</div>
				<div className={fr.cx('fr-input-group')}>
					<label className={fr.cx('fr-label')}>URL(s)</label>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
											stateRelatedMessage={
												errors['urls']?.[index]?.value?.message
											}
											nativeInputProps={{
												name,
												value,
												onChange
											}}
										/>
									)}
								/>
								{index !== 0 && (
									<Button
										priority="secondary"
										type="button"
										className={cx(classes.innerButton)}
										onClick={() => removeUrl(index)}
									>
										<i className="ri-delete-bin-line"></i>
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
							onClick={() => appendUrl({ value: '' })}
						>
							Ajouter un URL
						</Button>
					</div>
				</div>
				<div className={fr.cx('fr-input-group')}>
					<Controller
						control={control}
						name="volume"
						render={({ field: { onChange, value } }) => (
							<Input
								className={fr.cx('fr-mt-3w')}
								id="product-volume"
								label="Volumétrie par an"
								nativeInputProps={{
									inputMode: 'numeric',
									pattern: '[0-9]*',
									type: 'number',
									defaultValue: value !== null ? value : undefined,
									onChange: e => onChange(parseInt(e.target.value))
								}}
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
		alignItems: 'center'
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
	}
}));
export default ProductModal;
