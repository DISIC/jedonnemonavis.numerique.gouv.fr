import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Radios from '../blocks/Radios';

type Props = {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
	step: FormWithElements['form_template']['form_template_steps'][0];
	disabled: boolean;
};

const RootYesNo = (props: Props) => {
	const { block, step, disabled } = props;

	const { classes, cx } = useStyles();

	return (
		<div className={cx(classes.container, disabled ? classes.disabled : null)}>
			<h3>{block.label}</h3>
			<p>
				Cette question ne s'affiche que si l'utilisateur a coché une des options
				correspondantes dans la question précédente
			</p>
			{step.form_template_blocks.slice(2, 5).map(childBlock => (
				<div key={childBlock.id} className={classes.childContainer}>
					<label className={cx(classes.childLabel)}>{childBlock.label}</label>
					<Radios block={childBlock} disabled={disabled} />
				</div>
			))}
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
	}
});

export default RootYesNo;
