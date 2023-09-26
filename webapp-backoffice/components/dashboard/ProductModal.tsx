import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { tss } from 'tss-react/dsfr';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { SearchBar } from '@codegouvfr/react-dsfr/SearchBar';
import { Checkbox } from '@codegouvfr/react-dsfr/Checkbox';

import { useDebounce } from 'usehooks-ts';

import React from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { Entity, Product } from '@prisma/client';
import Autocomplete from '@mui/material/Autocomplete';
import { Popper, TextField } from '@mui/material';

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
	onProductCreated: () => void;
}

type CreationPayload = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

const defaultProduct = {
	title: '',
	entity_id: '',
	isEssential: false,
	urls: ['']
};

const ProductModal = (props: Props) => {
	const { modal, isOpen } = props;
	const { cx, classes } = useStyles();
	const [search, setSearch] = React.useState<string>('');
	const debouncedSearch = useDebounce(search, 500);
	const [entities, setEntities] = React.useState<Entity[]>([]);
	const [product, setProduct] = React.useState<CreationPayload>(defaultProduct);

	const retrieveEntities = async (query: string) => {
		const res = await fetch(`/api/prisma/entities?name=${query}`);
		const data = await res.json();
		setEntities(data);
	};

	React.useEffect(() => {
		isOpen && retrieveEntities(debouncedSearch);
	}, [isOpen, debouncedSearch]);

	const saveProduct = async () => {
		if (!product) return;

		fetch('/api/prisma/products', {
			method: 'POST',
			body: JSON.stringify(product)
		})
			.then(res => res.json())
			.finally(() => {
				props.onProductCreated();
				setProduct(defaultProduct);
				modal.close();
			});
	};

	return (
		<modal.Component
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
			title="Ajouter un nouveau produit"
			size="large"
			buttons={[
				{
					onClick: () => {
						modal.close();
					},
					children: 'Annuler'
				},
				{
					onClick: () => {
						saveProduct();
					},
					children: 'Ajouter ce produit'
				}
			]}
		>
			<p>
				Les champs marqués d&apos;un{' '}
				<span className={cx(classes.asterisk)}>*</span> sont obligatoires
			</p>
			<form id="product-form">
				<Input
					id="product-name"
					label={
						<p className={fr.cx('fr-mb-0')}>
							Nom du produit <span className={cx(classes.asterisk)}>*</span>
						</p>
					}
					nativeInputProps={{
						name: 'title',
						value: product?.title,
						onChange: event =>
							setProduct({
								...product,
								title: event.target.value
							} as CreationPayload)
					}}
				/>
				<div className={fr.cx('fr-input-group')}>
					<label
						htmlFor={'product-description'}
						className={fr.cx('fr-label', 'fr-mb-1w')}
					>
						Entité de rattachement{' '}
						<span className={cx(classes.asterisk)}>*</span>
					</label>
					<SearchBar
						id="product-description"
						label="Entité de rattachement"
						renderInput={({ className, id, placeholder, type }) => (
							<Autocomplete
								disablePortal
								id={id}
								sx={{ width: '100%' }}
								options={entities.map((entity: Entity) => entity.name)}
								onChange={(event, value) => {
									setProduct({
										...product,
										entity_id: entities.find(entity => entity.name === value)
											?.id
									} as CreationPayload);
								}}
								renderInput={params => (
									<div ref={params.InputProps.ref}>
										<input
											{...params.inputProps}
											className={cx(params.inputProps.className, className)}
											placeholder={placeholder}
											type={type}
										/>
									</div>
								)}
							/>
						)}
					/>
				</div>

				<Checkbox
					className={fr.cx('fr-mt-3w')}
					options={[
						{
							label: 'Démarche essentielle',
							hintText:
								'Cocher cette case si ce produit fait parti des démarches suivies sur le site Vos démarches essentielles',
							nativeInputProps: {
								name: 'essential',
								onChange: event => {
									setProduct({
										...product,
										isEssential: event.target.checked
									} as CreationPayload);
								}
							}
						}
					]}
				/>
				{product.urls.map((url, index) => (
					<div className={cx(classes.flexContainer)}>
						<Input
							className={cx(classes.autocomplete)}
							id={`product-url-${index + 1}`}
							hideLabel={true}
							label={`url ${index + 1}`}
							nativeInputProps={{
								name: `url-${index + 1}`,
								value: url,
								onChange: event => {
									setProduct({
										...product,
										urls: product.urls.map((url, i) =>
											i === index ? event.target.value : url
										)
									});
								}
							}}
						/>
						<Button
							priority="secondary"
							type="button"
							className={cx(classes.innerButton)}
							onClick={() => {
								setProduct({
									...product,
									urls: product.urls.filter((url, i) => i !== index)
								});
							}}
						>
							<i className="ri-delete-bin-line"></i>
						</Button>
					</div>
				))}
				<Button
					priority="secondary"
					iconId="fr-icon-add-circle-line"
					iconPosition="left"
					type="button"
					onClick={() => {
						setProduct({
							...product,
							urls: [...product.urls, '']
						});
					}}
				>
					Ajouter un URL
				</Button>
				<Input
					className={fr.cx('fr-mt-3w')}
					id="product-volume"
					label="Volumétrie par an"
					nativeInputProps={{
						inputMode: 'numeric',
						pattern: '[0-9]*',
						type: 'number'
					}}
				/>
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
