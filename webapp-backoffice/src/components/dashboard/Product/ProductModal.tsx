import { fr } from '@codegouvfr/react-dsfr';
import { Checkbox } from '@codegouvfr/react-dsfr/Checkbox';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { tss } from 'tss-react/dsfr';
import { useDebounce } from 'usehooks-ts';
import Button from '@codegouvfr/react-dsfr/Button';
import Autocomplete from '@mui/material/Autocomplete';
import { Product } from '@prisma/client';
import React, { useRef } from 'react';
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
	onTitleChange: (title: string) => void;
}

type FormValues = Omit<Product, 'id' | 'urls' | 'created_at' | 'updated_at'> & {
	urls: { value: string }[];
};

const ProductModal = (props: Props) => {
	const { modal, product } = props;
	const { cx, classes } = useStyles();
	const [search, _] = React.useState<string>('');
	const debouncedSearch = useDebounce(search, 500);
	const lastUrlRef = useRef<HTMLInputElement>(null);

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
				initialData: { data: [], metadata: { count: 0, myEntities: [] } }
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
					: 'Ajouter un nouveau service'
			}
			size="large"
			buttons={[
				{
					children: 'Annuler'
				},
				{
					doClosesModal: false,
					onClick: handleSubmit(onSubmit),
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
						render={({ field: { onChange, value, name } }) => (
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
										props.onTitleChange(e.target.value);
									},
									defaultValue: value,
									required: true
								}}
								state={errors[name] ? 'error' : 'default'}
								stateRelatedMessage={errors[name]?.message}
							/>
						)}
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
												required
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
					<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
						<fieldset>
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
												stateRelatedMessage={
													errors['urls']?.[index]?.value?.message
												}
												nativeInputProps={{
													name,
													value,
													onChange
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
	}
}));
export default ProductModal;
