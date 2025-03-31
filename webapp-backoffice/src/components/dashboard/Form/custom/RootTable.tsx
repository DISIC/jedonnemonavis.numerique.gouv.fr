import { FormConfigHelper } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { tss } from 'tss-react/dsfr';

type Props = {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
	step: FormWithElements['form_template']['form_template_steps'][0];
	configHelper: FormConfigHelper;
	disabled: boolean;
};

const RootTable = (props: Props) => {
	const { block, step, disabled, configHelper } = props;

	const { classes, cx } = useStyles();

	const exampleBlock = step.form_template_blocks[7];

	const getIsParentHidden = (childBlock: typeof block) => {
		const labelSplitted = childBlock.label?.split(' ') || [];
		const templateBlockOption = step.form_template_blocks[0].options.find(b =>
			labelSplitted.length > 1
				? (b.label || '').includes(labelSplitted[1])
				: true
		);

		return configHelper.displays.some(
			d => d.parent_id === templateBlockOption?.id && d.hidden
		);
	};

	return (
		<div className={cx(classes.container, disabled ? classes.disabled : null)}>
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
					{step.form_template_blocks.slice(7).map(childBlock => {
						const isParentHidden = getIsParentHidden(childBlock);
						return (
							<tr
								key={childBlock.id}
								className={cx(isParentHidden ? classes.parentHidden : null)}
							>
								<td>
									<label className={cx(classes.childLabel)}>
										{childBlock.label}
									</label>
								</td>
								<td colSpan={6}>
									<fieldset>
										{isParentHidden ? (
											<Badge className={cx(classes.hiddenBadge)} small>
												Réponse parente masquée
											</Badge>
										) : (
											Array.from(Array(6).keys()).map(radio => (
												<div className={fr.cx('fr-fieldset__content')}>
													<div className={fr.cx('fr-radio-group')}>
														<input
															id={`radio-${block.id}-${childBlock.id}-${radio}`}
															type="radio"
															name={`radio-${block.id}-${childBlock.id}`}
															disabled={disabled || isParentHidden}
														/>
														<label
															className={fr.cx('fr-label')}
															htmlFor={`radio-${block.id}-${childBlock.id}-${radio}`}
														/>
													</div>
												</div>
											))
										)}
									</fieldset>
								</td>
							</tr>
						);
					})}
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
	},
	disabled: {
		p: {
			marginTop: fr.spacing('4v')
		},
		'*': {
			color: fr.colors.decisions.text.mention.grey.default
		}
	},
	parentHidden: {
		'*': {
			color: fr.colors.decisions.text.mention.grey.default
		}
	},
	hiddenBadge: {
		width: '100%',
		justifyContent: 'center',
		backgroundColor: fr.colors.decisions.background.default.grey.active
	}
});

export default RootTable;
