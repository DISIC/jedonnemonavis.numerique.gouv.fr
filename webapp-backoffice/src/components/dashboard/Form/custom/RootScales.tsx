import { FormConfigHelper } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';

type Props = {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
	step: FormWithElements['form_template']['form_template_steps'][0];
	configHelper: FormConfigHelper;
	disabled: boolean;
};

const RootScales = (props: Props) => {
	const { block, step, disabled, configHelper } = props;

	const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

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

			<div className={cx(classes.reviews)}>
				{step.form_template_blocks.slice(7).map(childBlock => {
					const isParentHidden = getIsParentHidden(childBlock);

					return (
						<div className={cx(classes.optionRow, (isParentHidden ? classes.parentHidden : null))} key={childBlock.id}>
							<div className={cx(classes.labelWrapper)}>
								<label className={cx(classes.label)}>
									{childBlock.label}
								</label>
							</div>
							{!disabled && isParentHidden ? (
								<Badge className={cx(classes.hiddenBadge)} small>
									<span
										className={fr.cx('ri-eye-off-line', 'fr-mr-1v')}
									/>
									option parente masquée
								</Badge>
							) : (
								<ul>
									{exampleBlock.options.map(opt => (
										<li key={opt.id}>
											<input
												id={`radio-${block.id}-${childBlock.id}-${opt.id}`}
												type="radio"
												name={`radio-${block.id}-${childBlock.id}`}
												disabled={disabled || isParentHidden}
												onClick={() => {
													setSelectedOptions((prev) => ({
														...selectedOptions,
														[childBlock.id]: prev[childBlock.id] === opt.id.toString() ? '' : opt.id.toString()
													}));
												}}
												checked={selectedOptions[childBlock.id] === opt.id.toString()}
											/>
											<label
												className={cx(fr.cx('fr-label'), classes.reviewInputLabel)}
												htmlFor={`radio-${block.id}-${childBlock.id}-${opt.id}`}
											>
												{opt.label}
											</label>
										</li>
									))}
								</ul>
							)}
						</div>
					)
				})}
				
			</div>
		</div>
	);
};

const useStyles = tss.withName(RootScales.name).create({
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
		},
		["input:checked + label"]: {
			borderColor: fr.colors.decisions.background.flat.blueFrance.default,
			backgroundColor: fr.colors.decisions.background.flat.blueFrance.default,
			color: 'white',
		},
	},
	reviews: {
		ul: {
			display: "flex",
			flexDirection:'row',
			flexWrap: "wrap",
			listStyle: "none",
			...fr.spacing("margin", { topBottom: 0, rightLeft: 0 }),
			marginBottom: fr.spacing("6v"),
			paddingLeft: 0,
			li: {
				flex: 1,
				paddingBottom: 0,
				marginBottom: fr.spacing("3v"),

				minWidth: "100%",
				':last-child': {
					marginBottom: 0,
				},
				input: {
					position: "absolute",
					opacity: 0,
					width: 0,
					height: 0,
				},
			},
			"::-webkit-scrollbar": {
				display: "none",
			},
			[fr.breakpoints.up("md")]: {
				flexWrap: "nowrap",
				li: {
					minWidth: "initial",
					marginBottom: 0,
					marginRight: fr.spacing("3v"),
					':last-child': {
						marginRight: 0,
					},
				}
			},
		},
	},
	optionRow: {
		background: "white !important",
	},
	labelWrapper: {
		paddingBottom: fr.spacing("4v"),
		color: fr.colors.decisions.text.default.grey.default,
	},
	label: {
		...fr.typography[19].style,
	},
	reviewInputLabel: {
		border: `1px solid ${fr.colors.decisions.background.alt.grey.hover}`,
		...fr.spacing("padding", {topBottom: "2v", rightLeft: "4v"}),
		display: "flex",
		alignItems:'center',
		justifyContent: "center",
		textAlign: "center",
		cursor: "pointer",
		height: "100%",
		fontWeight: 500,
		color: fr.colors.decisions.background.flat.blueFrance.default,
		["&:hover"]: {
			borderColor: fr.colors.decisions.background.alt.grey.active,
		},
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
		backgroundColor: fr.colors.decisions.background.default.grey.active,
		'.ri-eye-off-line::before': {
			'--icon-size': '1rem'
		}
	}
});

export default RootScales;
