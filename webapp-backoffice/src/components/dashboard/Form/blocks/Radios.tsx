import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import { RadioButtons } from '@codegouvfr/react-dsfr/RadioButtons';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
	disabled: boolean;
}

const Radios = (props: Props) => {
	const { block, disabled } = props;
	const { classes } = useStyles();

	const [selectedValue, setSelectedValue] = useState<number | null>(null);

	return (
		<div className={classes.container}>
			<RadioButtons
				options={block.options.map(opt => ({
					label: opt.label || '',
					nativeInputProps: {
						value: opt.id.toString(),
						checked: selectedValue === opt.id,
						disabled: disabled,
						onChange: () => {
							setSelectedValue(opt.id);
						}
					}
				}))}
			/>
		</div>
	);
};

const useStyles = tss.withName(Radios.name).create(() => ({
	container: {
		marginTop: fr.spacing('4v')
	}
}));

export default Radios;
