import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { FormConfigKind } from '@prisma/client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { tss } from 'tss-react';
import Checkboxes from './blocks/Checkboxes';
import Mark from './blocks/Mark';
import Paragraph from './blocks/Paragraph';
import Smiley from './blocks/Smiley';
import Textarea from './blocks/Textarea';
import Radios from './blocks/Radios';
import { FormConfigHelper } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]/edit';
import TextInput from './blocks/TextInput';

const Editor = dynamic(() => import('../../ui/Editor'), { ssr: false });

type Step = FormWithElements['form_template']['form_template_steps'][0];
interface Props {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
	form: FormWithElements;
	configHelper: FormConfigHelper;
	disabled: boolean;
	step: Step;
	onConfigChange: (config: FormConfigHelper) => void;
}

const NO_FIELD_BLOCKS = ['heading_1', 'heading_2', 'heading_3'];

const FormBlockDisplay = (props: Props) => {
	const { block, form, configHelper, disabled, step, onConfigChange } = props;

	const [isUpdating, setIsUpdating] = useState(false);

	const [isBlockHidden, setIsBlockHidden] = useState(
		configHelper.displays.some(
			d => d.kind === 'block' && d.parent_id === block.id && d.hidden
		)
	);

	useEffect(() => {
		setIsBlockHidden(
			configHelper.displays.some(
				d => d.kind === 'block' && d.parent_id === block.id && d.hidden
			)
		);
	}, [block, configHelper]);

	useEffect(() => {
		onConfigChange({
			displays: [
				...configHelper.displays.filter(
					d => !(d.parent_id === block.id && d.kind === 'block')
				),
				...(isBlockHidden
					? [
							{
								hidden: true,
								parent_id: block.id,
								kind: 'block' as FormConfigKind
							}
					  ]
					: [])
			],
			labels: configHelper.labels
		});
	}, [isBlockHidden]);

	const { classes, cx } = useStyles();

	const getBlockFromType = (block: Props['block']) => {
		switch (block.type_bloc) {
			case 'paragraph':
				return isUpdating ? (
					<Editor
						form={form}
						block={block}
						configHelper={configHelper}
						initialValue={block.content}
						onConfigChange={config => {
							onConfigChange(config);
							setIsUpdating(false);
						}}
						onCancel={() => setIsUpdating(false)}
					/>
				) : (
					<Paragraph block={block} configHelper={configHelper} form={form} />
				);

			case 'smiley_input':
				return <Smiley block={block} />;
			case 'mark_input':
				return <Mark block={block} />;
			case 'checkbox':
				return (
					<Checkboxes
						block={block}
						configHelper={configHelper}
						onConfigChange={onConfigChange}
						disabled={disabled}
					/>
				);
			case 'input_text_area':
				return <Textarea block={block} form={form} />;
			case 'input_text':
				return <TextInput block={block} form={form} />;
			case 'radio':
				return (
					<Radios
						block={block}
						configHelper={configHelper}
						disabled={disabled}
						onConfigChange={onConfigChange}
					/>
				);
			default:
				return <p className={fr.cx('fr-mb-0')}>Type non implémenté</p>;
		}
	};

	const [nbrModified, setNbrModified] = useState(
		configHelper.displays.filter(
			d =>
				d.kind === 'blockOption' &&
				block.options.map(opt => opt.id).includes(d.parent_id) &&
				d.hidden
		).length
	);

	useEffect(() => {
		setNbrModified(
			configHelper.displays.filter(
				d =>
					d.kind === 'blockOption' &&
					block.options.map(opt => opt.id).includes(d.parent_id) &&
					d.hidden
			).length
		);
	}, [configHelper]);

	return (
		<>
			<div className={cx(classes.header, fr.cx('fr-grid-row'))}>
				<div
					className={
						block.isUpdatable || block.isHideable
							? fr.cx('fr-col-12', 'fr-col-md-8')
							: fr.cx('fr-col-12')
					}
				>
					<div className={cx(classes.headerInfo)}>
						<h3>{block.label}</h3>
						{isBlockHidden && (
							<Badge
								className={cx(classes.hiddenBadge, fr.cx('fr-ml-2v'))}
								small
							>
								<span className={fr.cx('ri-eye-off-line', 'fr-mr-2v')} />
								question masquée
							</Badge>
						)}
					</div>
				</div>
				{!disabled &&
					(block.isUpdatable || block.isHideable) &&
					!isUpdating && (
						<div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
							<div className={cx(classes.headerActions)}>
								{block.isHideable && (
									<Button
										priority="secondary"
										iconId={isBlockHidden ? 'ri-eye-line' : 'ri-eye-off-line'}
										iconPosition="right"
										onClick={() => setIsBlockHidden(!isBlockHidden)}
									>
										{isBlockHidden
											? 'Afficher la question'
											: 'Masquer la question'}
									</Button>
								)}
								{block.isUpdatable && !isBlockHidden && (
									<Button
										priority="secondary"
										iconId={'ri-pencil-line'}
										iconPosition="right"
										onClick={() => setIsUpdating(true)}
									>
										Éditer
									</Button>
								)}
							</div>
						</div>
					)}
			</div>
			{isBlockHidden && (
				<>
					<hr className={fr.cx('fr-mb-5v', 'fr-mt-6v', 'fr-pb-1v')} />
					<div className={cx(classes.boxDisabled)}>
						<p
							className={cx(
								classes.disabledAlertMessage,
								fr.cx('fr-mr-2v', 'fr-mb-0')
							)}
						>
							<span className={fr.cx('ri-alert-fill', 'fr-mr-1v')} />
							Cette question est masquée sur le formulaire
						</p>
					</div>
				</>
			)}
			{!isBlockHidden && !NO_FIELD_BLOCKS.includes(block.type_bloc) && (
				<>
					<hr className={fr.cx('fr-mb-5v', 'fr-mt-6v', 'fr-pb-1v')} />
					{!disabled && nbrModified > 0 && (
						<div>
							<div className={cx(classes.boxDisabled)}>
								<p
									className={cx(
										classes.disabledAlertMessage,
										fr.cx('fr-mb-2v')
									)}
								>
									<span className={fr.cx('ri-alert-fill', 'fr-mr-1v')} /> Vous
									avez masqué {nbrModified}{' '}
									{`option${nbrModified > 1 ? 's' : ''}`}
								</p>
								<p className={fr.cx('fr-mb-0')}>
									Ces options ne sont pas visibles sur le formulaire. Si elles
									existent, les questions conditionnelles associées seront
									également masquées.
								</p>
							</div>
						</div>
					)}
					<div className={cx(classes.container)}>
						<div>{getBlockFromType(block)}</div>
					</div>
				</>
			)}
		</>
	);
};

const useStyles = tss.withName(FormBlockDisplay.name).create({
	container: {
		color: fr.colors.decisions.text.default.grey.default
	},
	header: {
		'& > div:nth-child(2)': {
			textAlign: 'right'
		}
	},
	headerInfo: {
		display: 'flex',
		alignItems: 'center',
		flexWrap: 'wrap' as const,
		gap: fr.spacing('2v')
	},
	headerActions: {
		display: 'flex',
		justifyContent: 'flex-end',
		gap: fr.spacing('2v'),
		flexWrap: 'wrap' as const
	},
	hiddenBadge: {
		backgroundColor: fr.colors.decisions.background.default.grey.active,
		'.ri-eye-off-line::before': {
			'--icon-size': '1rem'
		}
	},
	boxDisabled: {
		padding: fr.spacing('4v'),
		backgroundColor: fr.colors.decisions.background.default.grey.hover,
		color: fr.colors.decisions.text.actionHigh.grey.default
	},
	disabledAlertMessage: {
		fontWeight: 'bold',
		color: fr.colors.decisions.background.flat.blueFrance.default
	}
});

export default FormBlockDisplay;
