import {
	FormConfigDisplayPartial,
	FormConfigLabelPartial
} from '@/prisma/generated/zod';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { useEffect, useState } from 'react';
import { tss } from 'tss-react';

interface Props {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
	form: FormWithElements;
	onConfigChange: (config: {
		displays: FormConfigDisplayPartial[];
		labels: FormConfigLabelPartial[];
	}) => void;
}

const uncheckText = '(cette option décoche les autres options)';

const Checkboxes = (props: Props) => {
	const { block, form, onConfigChange } = props;
	const { classes, cx } = useStyles();

	const formConfig = form.form_configs[0];

	const [selectedValues, setSelectedValues] = useState<string[]>([]);
	const [displayHelper, setDisplayHelper] = useState<
		FormConfigDisplayPartial[]
	>(
		block.options.map(opt => ({
			parent_id: opt.id,
			hidden:
				formConfig?.form_config_displays.some(display => {
					return display.parent_id === opt.id && display.hidden;
				}) || false,
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
		setSelectedValues(selectedValues.filter(val => val !== option.value));
	};

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
		const isChecked = event.target.checked;

		const option = block.options.find(
			opt => opt.value === value || opt.label === value
		);
		const isIsolated = option?.isIsolated || false;

		let newSelectedValues: string[];

		if (isChecked) {
			if (isIsolated) {
				newSelectedValues = [value];
			} else {
				const newValues = [...selectedValues, value];
				newSelectedValues = newValues.filter(val => {
					const opt = block.options.find(
						o => o.value === val || o.label === val
					);
					return !opt?.isIsolated;
				});
			}
		} else {
			newSelectedValues = selectedValues.filter(val => val !== value);
		}

		setSelectedValues(newSelectedValues);
	};

	useEffect(() => {
		if (displayHelper) {
			onConfigChange({
				displays: displayHelper.filter(({ hidden }) => !!hidden),
				labels: formConfig?.form_config_labels || []
			});
		}
	}, [displayHelper]);

	return (
		<div className={fr.cx('fr-grid-row')}>
			<div className={cx(fr.cx('fr-col-12'), classes.checkboxContainer)}>
				<>
					<Checkbox
						legend={<span className={fr.cx('fr-sr-only')}>{block.label}</span>}
						hintText={block.content ?? ''}
						options={block.options.map((opt, index) => {
							const isHidden = !!displayHelper.find(
								helper => helper.parent_id === opt.id
							)?.hidden;

							return {
								label: (
									<>
										<span>
											{opt.isIsolated ? (
												<>
													{opt.label}{' '}
													<span className="fr-sr-only">{uncheckText}</span>
												</>
											) : (
												opt.label
											)}
											{isHidden && (
												<Badge className={fr.cx('fr-ml-4v')}>Masqué</Badge>
											)}
										</span>
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
									</>
								),
								nativeInputProps: {
									name: `${block.label}-${index}`,
									value: opt.value || opt.label || '',
									checked: selectedValues.includes(
										opt.value || opt.label || ''
									),
									disabled: isHidden,
									onChange: handleChange
								}
							};
						})}
					/>
				</>
			</div>
		</div>
	);
};

const useStyles = tss.withName(Checkboxes.name).create({
	smallText: {
		fontSize: '0.8rem',
		color: fr.colors.decisions.text.disabled.grey.default
	},
	checkboxContainer: {
		'.fr-fieldset__content': {
			paddingTop: fr.spacing('2v')
		},
		'.fr-checkbox-group': {
			padding: `${fr.spacing('3v')} ${fr.spacing('2v')}`,
			borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
			label: {
				justifyContent: 'space-between !important',
				'&::before': {
					top: '1.05rem !important'
				}
			}
		}
	}
});

export default Checkboxes;
