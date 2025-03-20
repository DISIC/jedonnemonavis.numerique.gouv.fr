import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react';
import FormBlockDisplay from './FormBlockDisplay';

type Step = FormWithElements['form_template']['form_template_steps'][0];
interface Props {
	step: Step;
	form: FormWithElements;
}

const FormStepDisplay = (props: Props) => {
	const { step, form } = props;

	const { classes, cx } = useStyles();

	return (
		<div className={cx(classes.container)}>
			<div className={cx(classes.box)}>
				<h2>{step.title}</h2>
			</div>
			{step.form_template_blocks.map(block => {
				return (
					<div key={block.id} className={cx(classes.box)}>
						<h3>{block.label}</h3>
						<hr className={fr.cx('fr-mb-5v', 'fr-mt-6v', 'fr-pb-1v')} />
						<FormBlockDisplay block={block} form={form} />
					</div>
				);
			})}
		</div>
	);
};

const useStyles = tss.withName(FormStepDisplay.name).create({
	container: {
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('6v'),
		padding: fr.spacing('6v'),
		backgroundColor: fr.colors.decisions.background.contrast.blueFrance.default,
		h3: {
			...fr.typography[1].style,
			color: fr.colors.decisions.background.flat.blueFrance.default
		}
	},
	box: {
		padding: fr.spacing('6v'),
		backgroundColor: fr.colors.decisions.background.default.grey.default,
		color: fr.colors.decisions.background.flat.blueFrance.default,
		['h2, h3, h4, h5, h6']: {
			color: fr.colors.decisions.background.flat.blueFrance.default,
			marginBottom: 0
		}
	}
});

export default FormStepDisplay;
