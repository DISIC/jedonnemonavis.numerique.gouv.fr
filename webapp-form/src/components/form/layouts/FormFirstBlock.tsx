import { primarySection } from '@/src/utils/form';
import { FormField, Opinion, Product } from '@/src/utils/types';
import { fr } from '@codegouvfr/react-dsfr';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { Field } from '../elements/Field';
import { SmileyInput } from '../elements/SmileyInput';

type Props = {
	product: Product;
	opinion: Opinion;
	onSubmit: (opinion: Opinion) => void;
	isRateLimitReached: boolean;
	setIsRateLimitReached: (value: boolean) => void;
};

export const FormFirstBlock = (props: Props) => {
	const {
		onSubmit,
		product,
		opinion,
		isRateLimitReached,
		setIsRateLimitReached,
	} = props;
	const [tmpOpinion, setTmpOpinion] = useState<Opinion>(opinion);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { t } = useTranslation('common');

	const { classes, cx } = useStyles();

	const formTemplateStep = product.form.form_template.form_template_steps.find(
		fts => fts.position === 0,
	);

	const formTemplateBlock = formTemplateStep?.form_template_blocks.find(
		ftb => ftb.label === "Texte d'introduction",
	);
	const formConfgIntro = product.form.form_configs[0]?.form_config_labels.find(
		fcl => fcl.kind === 'block' && fcl.parent_id === formTemplateBlock?.id,
	);

	return (
		<div>
			<h1 className={cx(classes.title)}>{t('first_block.title')}</h1>
			<div className={fr.cx('fr-grid-row')}>
				<div className={cx(classes.notice, fr.cx('fr-col-12', 'fr-p-10v'))}>
					{formConfgIntro ? (
						<span
							className={cx(classes.customIntro)}
							dangerouslySetInnerHTML={{
								__html: formConfgIntro.label.replace(
									'{{title}}',
									product.title,
								),
							}}
						/>
					) : (
						<p className={fr.cx('fr-mb-0')}>
							<span>{t('first_block.subtitle_part_1')}</span>
							<span className={cx(classes.bold)}> {product.title}</span>
							<span> {t('first_block.subtitle_part_2')}</span>
						</p>
					)}
				</div>
			</div>
			<form
				onSubmit={e => {
					e.preventDefault();
					setIsLoading(true);
					onSubmit(tmpOpinion);
				}}
				// TO REMOVE WHEN UNCOMMENT PRODCT NAME
				className={fr.cx('fr-mt-12v')}
			>
				{primarySection.map((field: FormField) => (
					<div key={field.name} className={cx(classes.field)}>
						<Field
							field={field}
							opinion={tmpOpinion}
							setOpinion={setTmpOpinion}
							form={primarySection}
							formConfig={product.form.form_configs[0]}
							formTemplateStep={formTemplateStep}
						/>
					</div>
				))}
				{isRateLimitReached && (
					<div role="alert">
						<Alert
							closable
							onClose={function noRefCheck() {
								setIsRateLimitReached(false);
							}}
							severity="error"
							title=""
							description="Trop de tentatives de dépôt d'avis, veuillez patienter 1h avant de pouvoir re-déposer."
						/>
					</div>
				)}
				<div className={cx(fr.cx('fr-mt-12v'), classes.buttonsContainer)}>
					{isLoading ? (
						<Button
							type="button"
							className={cx(classes.loading, classes.validateButton)}
						>
							<div>
								<i className={fr.cx('ri-loader-4-line')} />
							</div>
						</Button>
					) : (
						<Button
							type="submit"
							disabled={!tmpOpinion.satisfaction || isRateLimitReached}
							className={classes.validateButton}
						>
							{t('first_block.validate')}
						</Button>
					)}
				</div>
			</form>
		</div>
	);
};

const useStyles = tss
	.withName(SmileyInput.name)
	.withParams()
	.create(() => ({
		notice: {
			backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
		},
		bold: {
			fontWeight: 800,
		},
		title: {
			[fr.breakpoints.down('md')]: {
				display: 'none',
			},
		},
		field: {
			marginBottom: fr.spacing('12v'),
		},
		buttonsContainer: {
			[fr.breakpoints.up('md')]: {
				display: 'flex',
				justifyContent: 'end',
			},
		},
		validateButton: {
			width: '100%',
			display: 'flex',
			justifyContent: 'center',
			...fr.spacing('padding', { topBottom: '3v', rightLeft: '6v' }),
			[fr.breakpoints.up('md')]: {
				width: 'initial',
			},
		},
		loading: {
			i: {
				display: 'inline-block',
				animation: 'spin 1s linear infinite;',
				color: fr.colors.decisions.background.default.grey.default,
				width: '8.5rem',
				['&::before']: {
					'--icon-size': '1.5rem',
				},
			},
		},
		customIntro: {
			p: {
				marginBottom: 0,
				minHeight: fr.spacing('6v'),
			},
		},
	}));
