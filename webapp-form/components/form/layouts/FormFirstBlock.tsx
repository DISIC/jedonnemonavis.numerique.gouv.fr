import { firstSection } from '@/utils/form';
import { FormField, Opinion, Product } from '@/utils/types';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { Field } from '../elements/Field';
import { SmileyInput } from '../elements/SmileyInput';

type Props = {
	product: Product;
	opinion: Opinion;
	onSubmit: (opinion: Opinion) => void;
};

export const FormFirstBlock = (props: Props) => {
	const { onSubmit, product, opinion } = props;
	const [tmpOpinion, setTmpOpinion] = useState<Opinion>(opinion);

	const { classes, cx } = useStyles();

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
					onSubmit(tmpOpinion);
				}}
			>
				{firstSection.map((field: FormField) => (
					<div key={field.name} className={cx(classes.field)}>
						<Field
							field={field}
							opinion={tmpOpinion}
							setOpinion={setTmpOpinion}
						/>
					</div>
				))}
				<div className={fr.cx('fr-mt-16v')}>
					<Button type="submit" disabled={!tmpOpinion.satisfaction}>
						Valider
					</Button>
				</div>
			</form>
		</div>
	);
};

const useStyles = tss
	.withName(SmileyInput.name)
	.withParams()
	.create(() => ({
		field: {
			marginBottom: fr.spacing('14v')
		}
	}));
