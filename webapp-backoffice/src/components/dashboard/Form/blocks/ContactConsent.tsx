import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { tss } from 'tss-react';

interface Props {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
}

const ContactConsent = (props: Props) => {
	const { block } = props;
	const { classes, cx } = useStyles();

	return (
		<>
			<Checkbox
				className={fr.cx('fr-mb-2v')}
				options={[
					{
						label: block.label ?? '',
						nativeInputProps: { disabled: true }
					}
				]}
			/>
			<p className={cx(classes.infoText, fr.cx('fr-mt-0'))}>
				<span className={fr.cx('fr-icon-info-fill', 'fr-mr-1v')} /> Si l’usager
				coche cette case, l’étape Email s’affiche pour qu’il laisse son adresse.
				Masquer cette case masque aussi l’étape Email.
			</p>
		</>
	);
};

const useStyles = tss.withName({ ContactConsent }).create({
	infoText: {
		color: fr.colors.decisions.text.default.info.default,
		fontSize: '0.8rem',
		'.fr-icon-info-fill::before': {
			'--icon-size': '1rem'
		}
	}
});

export default ContactConsent;
