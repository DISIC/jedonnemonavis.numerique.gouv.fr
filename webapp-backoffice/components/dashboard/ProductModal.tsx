import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { tss } from 'tss-react/dsfr';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { SearchBar } from '@codegouvfr/react-dsfr/SearchBar';
import { Checkbox } from '@codegouvfr/react-dsfr/Checkbox';

import { useDebounce } from 'usehooks-ts';

import React from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { Entity } from '@prisma/client';
import { Autocomplete } from '@mui/material';

interface CustomProps {
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
	isOpen: boolean;
}

const ProductModal = (modal: CustomProps) => {
	const { cx, classes } = useStyles();
	const [search, setSearch] = React.useState<string>('');
	const debouncedSearch = useDebounce(search, 1500);
	const [entities, setEntities] = React.useState<Entity[]>([]);

	const retrieveOwners = async (query: string) => {
		const res = await fetch(`/api/prisma/entities?name=${query}`);
		const data = await res.json();
		setEntities(data);
	};

	React.useEffect(() => {
		retrieveOwners(debouncedSearch);
	}, [debouncedSearch]);

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
					onClick: () => modal.close(),
					children: 'Annuler'
				},
				{
					onClick: () => console.log('produit créé'),
					children: 'Ajouter ce produit'
				}
			]}
		>
			<p>
				Les champs marqués d&apos;un{' '}
				<span className={cx(classes.asterisk)}>*</span> sont obligatoires
			</p>
			<form id="product-form">
				<Input id="product-name" label="Nom du produit" />
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
							// onChange={(event, value) => setSearch(value)}
							renderInput={params => (
								<div ref={params.InputProps.ref}>
									<input
										id="freeSolo"
										{...params.inputProps}
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
					id="essential"
					className={fr.cx('fr-mt-3w')}
					options={[
						{
							label: 'Démarche essentielle',
							hintText:
								'Cocher cette case si ce produit fait parti des démarches suivies sur le site Vos démarches essentielles',
							nativeInputProps: {
								id: 'essential',
								name: 'essential',
								value: 'essential'
							}
						}
					]}
				/>
				<Input id="product-url" label="URL" />
				<Button
					priority="secondary"
					iconId="fr-icon-add-circle-line"
					iconPosition="left"
				>
					Ajouter un URL
				</Button>
				<Input id="product-volume" label="Volumétrie par an" />
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
