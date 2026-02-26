import {
	FormWithElements,
	ProductWithForms
} from '@/src/types/prismaTypesExtended';
import { formatDateToFrenchString } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';

type FormConfigVersionsDisplayProps = {
	form: FormWithElements;
};

const FormConfigVersionsDisplay = (props: FormConfigVersionsDisplayProps) => {
	const { form } = props;

	const { classes } = useStyles();

	const formConfigs = form.form_configs;

	if (!formConfigs.length) return;

	const zeroVersionForm = formConfigs.find(fc => fc.version === 0);
	const zeroVersionFormConfig = {
		...zeroVersionForm,
		displays: zeroVersionForm?.form_config_displays || [],
		labels: zeroVersionForm?.form_config_labels || []
	};
	const formConfigsToDisplay = formConfigs.filter(fc => fc.version !== 0);

	return (
		<div className={classes.container}>
			<b>
				<i className={fr.cx('ri-alert-fill')} /> Depuis sa création, le
				formulaire a été modifié {formConfigsToDisplay.length} fois :
			</b>
			<ul className={fr.cx('fr-mt-4v')}>
				<li>
					<a
						className={fr.cx('fr-link')}
						href={`${process.env.NEXT_PUBLIC_FORM_APP_URL}/Demarches/${form.form_template.slug !== 'root' ? `avis/${form.id}` : form.product_id}?iframe=true&formConfig=${encodeURIComponent(JSON.stringify(zeroVersionFormConfig))}`}
						target="_blank"
						title="Accéder à la version 0 du formulaire, nouvelle fenêtre"
					>
						<b>Version 0</b>
					</a>{' '}
					: en vigueur du {formatDateToFrenchString(form.created_at.toString())}{' '}
					au {formatDateToFrenchString(formConfigs[0].created_at.toString())}
				</li>
				{formConfigsToDisplay.map((formConfig, index) => (
					<li key={formConfig.id}>
						<a
							className={fr.cx('fr-link')}
							href={`${process.env.NEXT_PUBLIC_FORM_APP_URL}/Demarches/${form.form_template.slug !== 'root' ? `avis/${form.id}` : form.product_id}?iframe=true&formConfig=${encodeURIComponent(JSON.stringify({ ...formConfig, displays: formConfig.form_config_displays, labels: formConfig.form_config_labels }))}`}
							target="_blank"
							title={`Accéder à la version ${index + 1} du formulaire, nouvelle fenêtre`}
						>
							<b>Version {index + 1}</b>
						</a>{' '}
						:{' '}
						{index < formConfigs.length - 1
							? `en vigueur du ${formatDateToFrenchString(formConfig.created_at.toString())} au ${formatDateToFrenchString(formConfigs[index + 1]?.created_at.toString())}`
							: `en vigueur à compter du ${formatDateToFrenchString(formConfig.created_at.toString())}`}
					</li>
				))}
			</ul>
		</div>
	);
};

const useStyles = tss.withName(FormConfigVersionsDisplay.name).create(() => ({
	container: {
		backgroundColor: fr.colors.decisions.background.default.grey.hover,
		padding: fr.spacing('4v'),
		ul: {
			display: 'flex',
			flexDirection: 'column-reverse',
			marginLeft: fr.spacing('8v'),
			'li::marker': {
				color: fr.colors.decisions.background.actionHigh.blueFrance.default
			}
		},
		'.ri-alert-fill': {
			color: fr.colors.decisions.background.actionHigh.blueFrance.default,
			marginRight: fr.spacing('1v')
		}
	}
}));

export default FormConfigVersionsDisplay;
