import { FormConfigHelper } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]/edit';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { RadioButtons } from '@codegouvfr/react-dsfr/RadioButtons';
import { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
	configHelper: FormConfigHelper;
	disabled: boolean;
	onConfigChange: (config: FormConfigHelper) => void;
}

const Radios = (props: Props) => {
	const { block, configHelper, disabled, onConfigChange } = props;
	const { classes, cx } = useStyles();

	const [selectedValue, setSelectedValue] = useState<number | null>(null);
	const [displayHelper, setDisplayHelper] = useState<
		FormConfigHelper['displays']
	>(
		block.options.map(opt => ({
			hidden:
				configHelper.displays.some(display => {
					return display.parent_id === opt.id && display.hidden;
				}) || false,
			parent_id: opt.id,
			kind: 'blockOption'
		}))
	);

	const onChangeDisplay = (
		option: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0]['options'][0]
	) => {
		const newDisplayHelper = displayHelper.map(helper => {
			if (helper.parent_id === option.id) {
				return {
					...helper,
					hidden: !helper.hidden
				};
			}
			return helper;
		});

		setDisplayHelper(newDisplayHelper);
		if (selectedValue === option.id) {
			setSelectedValue(null);
		}
	};

	useEffect(() => {
		if (displayHelper) {
			onConfigChange({
				displays: [
					...configHelper.displays.filter(
						d =>
							!(
								block.options.map(opt => opt.id).includes(d.parent_id) &&
								d.kind === 'blockOption'
							)
					),
					...displayHelper.filter(({ hidden }) => !!hidden)
				],
				labels: configHelper.labels
			});
		}
	}, [displayHelper]);

	return (
		<div className={classes.container}>
			<RadioButtons
				options={block.options.map(opt => {
					const isHidden = disabled
						? false
						: !!displayHelper.find(helper => helper.parent_id === opt.id)
								?.hidden;

					return {
						label: (
							<span className={classes.radioLabel}>
								<span>
									{opt.label}
									{isHidden && (
										<Badge
											className={cx(classes.hiddenBadge, fr.cx('fr-ml-4v'))}
											small
										>
											<span className={fr.cx('ri-eye-off-line', 'fr-mr-1v')} />
											option masquée
										</Badge>
									)}
								</span>
								{!disabled && opt.isHideable && (
									<Button
										size="small"
										priority="secondary"
										iconId={isHidden ? 'ri-eye-line' : 'ri-eye-off-line'}
										iconPosition="right"
										onClick={() => {
											onChangeDisplay(opt);
										}}
									>
										{isHidden ? 'Afficher' : 'Masquer'}
									</Button>
								)}
							</span>
						),
						nativeInputProps: {
							value: opt.id.toString(),
							checked: selectedValue === opt.id,
							disabled: isHidden || disabled,
							onChange: () => {
								setSelectedValue(opt.id);
							}
						}
					};
				})}
			/>
		</div>
	);
};

const useStyles = tss.withName(Radios.name).create(() => ({
	container: {
		marginTop: fr.spacing('4v'),
		'.fr-radio-group': {
			padding: `${fr.spacing('3v')} ${fr.spacing('2v')}`,
			borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
			maxWidth: 'none'
		}
	},
	radioLabel: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: fr.spacing('2v'),
		width: '100%'
	},
	hiddenBadge: {
		color: fr.colors.decisions.text.actionHigh.grey.default,
		'.ri-eye-off-line::before': {
			'--icon-size': '1rem'
		}
	}
}));

export default Radios;
