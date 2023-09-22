import { secondSection } from '@/utils/form';
import { FormField, Opinion } from '@/utils/types';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { Field } from '../elements/Field';
import { SmileyInput } from '../elements/SmileyInput';

type Props = {
	opinion: Opinion;
	onSubmit: (opinion: Opinion) => void;
};

export const FormSecondBlock = (props: Props) => {
	const { onSubmit, opinion } = props;
	const [tmpOpinion, setTmpOpinion] = useState<Opinion>(opinion);

	const { classes, cx } = useStyles();

	return (
		<div>
			<h1 className={fr.cx('fr-mb-14v')}>
				Merci !<br />
				Pouvez-vous nous en dire plus ?
			</h1>
			<form
				onSubmit={e => {
					e.preventDefault();
					onSubmit(tmpOpinion);
				}}
			>
				{secondSection.map((field: FormField) => (
					<div key={field.name} className={cx(classes.field)}>
						<Field
							field={field}
							opinion={tmpOpinion}
							setOpinion={setTmpOpinion}
						/>
					</div>
				))}
				<div className={fr.cx('fr-mt-8v')}>
					<Button type="submit">Valider mon avis</Button>
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
