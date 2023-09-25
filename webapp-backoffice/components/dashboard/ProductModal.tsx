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
}

const ProductModal = (props: Props) => {
	const { modal, isOpen } = props;
	const { cx, classes } = useStyles();
	const [search, setSearch] = React.useState<string>('');
	const debouncedSearch = useDebounce(search, 500);
	const [entities, setEntities] = React.useState<Entity[]>([]);
	const [product, setProduct] = React.useState<Omit<Product, 'id'>>();
	const [urlInputs, setUrlInputs] = React.useState<any[]>([
		<Input
			id="product-url"
			label="URL"
			nativeInputProps={{
				name: 'url',
				onChange: event => {
					setUrls([...urls, event.target.value]);
				}
			}}
		/>
	]);
	const [urls, setUrls] = React.useState<string[]>([]);
	const debouncedUrls = useDebounce(urls, 1500);

	const retrieveEntities = async (query: string) => {
		const res = await fetch(`/api/prisma/entities?name=${query}`);
		const data = await res.json();
		setEntities(data);
	};

	React.useEffect(() => {
		isOpen && retrieveEntities(debouncedSearch);
	}, [debouncedSearch]);

	React.useEffect(() => {
		if (urls.length > 0) {
			setProduct({
				...product,
				urls: urls,
				entity_id: entities[0].id
			} as Omit<Product, 'id'>);
		}
	}, [urls]);

	const saveProduct = async () => {
		if (!product) return;

		fetch('/api/prisma/products', {
			method: 'POST',
			body: JSON.stringify(product)
		})
			.then(res => res.json())
			.finally(() => {
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
						setUrlInputs([<Input id="product-url" label="URL" />]);
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
					label="Nom du produit"
					nativeInputProps={{
						name: 'title',
						onChange: event =>
							setProduct({
								...product,
								title: event.target.value
							} as Omit<Product, 'id'>)
					}}
				/>
				<SearchBar
					className={fr.cx('fr-mb-3v')}
					id="entity-search"
					label="Rechercher"
					renderInput={({ className, id, placeholder, type }) => (
						<Autocomplete
							freeSolo
							className={cx(classes.autocomplete)}
							id={id}
							value={search}
							renderInput={params => (
								<div ref={params.InputProps.ref}>
									<input
										id="freeSolo"
										{...params.inputProps}
										onChange={event => setSearch(event.target.value)}
										className={cx(params.inputProps.className, className)}
										placeholder={placeholder}
										type={type}
									/>
								</div>
							)}
							options={entities.map(entity => {
								return entity.name;
							})}
						/>
					)}
				/>

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
									} as Omit<Product, 'id'>);
								}
							}
						}
					]}
				/>

				{urlInputs.map((input, index) => {
					return input;
				})}
				<Button
					priority="secondary"
					iconId="fr-icon-add-circle-line"
					iconPosition="left"
					type="button"
					onClick={() => {
						setUrlInputs([
							...urlInputs,
							<Input
								id="product-url"
								hideLabel={true}
								label="url"
								nativeInputProps={{
									name: 'url',
									onChange: event => {
										setUrls([...urls, event.target.value]);
									}
								}}
							/>
						]);
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
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	},
	autocomplete: {
		width: '100%'
	}
}));
export default ProductModal;
