import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Radios from '../blocks/Radios';

type Props = {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
	step: FormWithElements['form_template']['form_template_steps'][0];
};

const RootTable = (props: Props) => {
	const { block, step } = props;

	const { classes, cx } = useStyles();

	const exampleBlock = step.form_template_blocks[7];

	return (
		<div className={cx(classes.container)}>
			<h3>{block.label}</h3>
			<p>
				Cette question ne s'affiche que si l'utilisateur a coché une des options
				correspondantes dans la question précédente
			</p>
			<table>
				<thead>
					<tr>
						<th></th>
						{exampleBlock.options.map(opt => (
							<th scope="col">{opt.label}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{step.form_template_blocks.slice(7).map(childBlock => (
						<tr key={childBlock.id}>
							<td>
								<label className={cx(classes.childLabel)}>
									{childBlock.label}
								</label>
							</td>
							<td colSpan={6}>
								<fieldset>
									{Array.from(Array(6).keys()).map(radio => (
										<div className={fr.cx('fr-fieldset__content')}>
											<div className={fr.cx('fr-radio-group')}>
												<input
													id={`radio-${block.id}-${childBlock.id}-${radio}`}
													type="radio"
													name={`radio-${block.id}-${childBlock.id}`}
												/>
												<label
													className={fr.cx('fr-label')}
													htmlFor={`radio-${block.id}-${childBlock.id}-${radio}`}
												/>
											</div>
										</div>
									))}
								</fieldset>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

const useStyles = tss.withName(RootTable.name).create({
	container: {
		h3: {
			marginBottom: fr.spacing('6v')
		},
		p: {
			color: fr.colors.decisions.text.default.grey.default,
			...fr.typography[18].style
		},
		table: {
			width: '100%',
			borderCollapse: 'collapse',
			thead: {
				tr: {
					borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
					th: {
						...fr.typography[17].style,
						fontWeight: 'normal',
						color: fr.colors.decisions.text.default.grey.default,
						'&:first-of-type': {
							width: '9rem'
						},
						'&:not(:first-of-type)': {
							width: 'calc(100% / 6)',
							display: 'inline-block',
							padding: `0 ${fr.spacing('4v')}`
						}
					}
				}
			},
			tbody: {
				tr: {
					borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
					td: {
						padding: `${fr.spacing('4v')} 0`
					}
				}
			},
			fieldset: {
				display: 'flex',
				justifyContent: 'space-around',
				border: 0,
				padding: 0,
				margin: 0,
				'.fr-fieldset__content': {
					display: 'flex',
					justifyContent: 'center',
					width: 'calc((100% - 20rem) / 6)',
					label: {
						backgroundPosition: '50% 50%'
					},
					'.fr-radio-group': {
						marginTop: 0
					}
				}
			}
		}
	},
	childLabel: {
		color: fr.colors.decisions.text.default.grey.default,
		fontWeight: 'bold'
	}
});

export default RootTable;
