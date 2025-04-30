import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Radios from '../blocks/Radios';
import { FormConfigHelper } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]';
import Badge from '@codegouvfr/react-dsfr/Badge';

type Props = {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
	step: FormWithElements['form_template']['form_template_steps'][0];
	configHelper: FormConfigHelper;
	disabled: boolean;
};

const RootYesNo = (props: Props) => {
	const { block, step, disabled, configHelper } = props;

	const { classes, cx } = useStyles();

	const getIsParentHidden = (childBlock: typeof block) => {
		const templateBlockOption = step.form_template_blocks[0].options.find(
			b => b.label === childBlock.label
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
			{step.form_template_blocks.slice(2, 6).map(childBlock => {
				const isParentHidden = getIsParentHidden(childBlock);
				return (
					<div
						key={childBlock.id}
						className={cx(
							classes.childContainer,
							isParentHidden ? classes.parentHidden : null
						)}
					>
						<label className={cx(classes.childLabel)}>
							{childBlock.label}{' '}
							{!disabled && isParentHidden && (
								<Badge
									className={cx(fr.cx('fr-ml-2v'), classes.hiddenBadge)}
									small
								>
									<span className={fr.cx('ri-eye-off-line', 'fr-mr-1v')} />
									option parente masquée
								</Badge>
							)}
						</label>
						<Radios block={childBlock} disabled={disabled || isParentHidden} nbItems={2} />
					</div>
				);
			})}
		</div>
	);
};

const useStyles = tss.withName(RootYesNo.name).create({
	container: {
		h3: {
			marginBottom: fr.spacing('6v')
		},
		p: {
			color: fr.colors.decisions.text.default.grey.default,
			...fr.typography[18].style
		}
	},
	childContainer: {
		padding: `${fr.spacing('6v')} 0`,
		borderTop: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		'&:last-of-type': {
			borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`
		}
	},
	childLabel: {
		display: 'block',
		color: fr.colors.decisions.text.default.grey.default,
		fontWeight: 'bold',
		marginBottom: fr.spacing('3v')
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
		backgroundColor: fr.colors.decisions.background.default.grey.active,
		'.ri-eye-off-line::before': {
			'--icon-size': '1rem'
		}
	}
});

export default RootYesNo;
