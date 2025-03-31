import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import { useState } from 'react';
import { tss } from 'tss-react';

interface Props {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
	disabled: boolean;
}

const Radios = (props: Props) => {
	const { block, disabled } = props;
	const { classes, cx } = useStyles();

	const [selectedValue, setSelectedValue] = useState<string>();

	return (
		<div className={classes.container}>
			<fieldset>
				<ul>
					{block.options.map(opt => (
						<li
							key={opt.id}
							className={cx(
								selectedValue === opt.value ? classes.selectedOption : null
							)}
						>
							<input
								className={fr.cx('fr-sr-only')}
								id={`radio-${block.id}-${opt.id}`}
								type="radio"
								name={`radio-${block.id}`}
								value={opt.value || ''}
								onChange={e => {
									setSelectedValue(e.target.value);
								}}
								disabled={disabled}
							/>
							<label htmlFor={`radio-${block.id}-${opt.id}`}>{opt.label}</label>
						</li>
					))}
				</ul>
			</fieldset>
		</div>
	);
};

const useStyles = tss.withName(Radios.name).create({
	container: {
		fieldset: {
			border: 0,
			padding: 0,
			margin: 0,
			ul: {
				padding: 0,
				margin: 0,
				listStyle: 'none',
				display: 'flex',
				flexWrap: 'wrap',
				gap: fr.spacing('4v'),
				li: {
					display: 'flex',
					textAlign: 'center',
					padding: `0 ${fr.spacing('2v')}`,
					border: `1px solid ${fr.colors.decisions.background.alt.grey.hover}`,
					label: {
						width: '100%',
						padding: fr.spacing('1v'),
						color: fr.colors.decisions.text.label.blueFrance.default
					}
				}
			}
		}
	},
	selectedOption: {
		border: `1px solid ${fr.colors.decisions.background.flat.blueFrance.default} !important`
	}
});

export default Radios;
