import { useState } from 'react';
import { SmileyInput } from '../elements/SmileyInput';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { fr } from '@codegouvfr/react-dsfr';
import { Feeling, Product } from '@/utils/types';

type Props = {
	product: Product;
	onSubmit: (satisfaction: Feeling) => void;
};

export const FormFirstBlock = (props: Props) => {
	const { onSubmit, product } = props;
	const [satisfaction, setSatisfaction] = useState<Feeling | null>();

	return (
		<div>
			<h1>Je donne mon avis</h1>
			<h2 className={fr.cx('fr-mt-14v', 'fr-mb-10v')}>
				Démarche :{' '}
				<span className={fr.cx('fr-text--regular')}>{product.title}</span>
			</h2>
			<form
				onSubmit={e => {
					e.preventDefault();
					if (!!satisfaction) onSubmit(satisfaction);
				}}
			>
				<SmileyInput
					label="Comment s'est passée cette démarche pour vous ?"
					hint="Ce champ est obligatoire"
					name="satisfaction"
					onChange={value => {
						setSatisfaction(value);
					}}
				/>
				<div className={fr.cx('fr-mt-16v')}>
					<Button type="submit" disabled={!satisfaction}>
						Valider
					</Button>
				</div>
			</form>
		</div>
	);
};
