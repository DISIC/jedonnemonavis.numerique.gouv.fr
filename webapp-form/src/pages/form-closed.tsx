import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Image from 'next/image';
import Button from '@codegouvfr/react-dsfr/Button';
import { trpc } from '../utils/trpc';
import { useEffect } from 'react';
import { useTranslation } from 'next-i18next';

const FormClosed = ({ buttonId }: { buttonId: number }) => {
	const { classes, cx } = useStyles();
	const { t } = useTranslation('common');

	const newVisitOnClosedButton =
		trpc.closedButtonLog.createOrUpdate.useMutation();

	useEffect(() => {
		newVisitOnClosedButton.mutateAsync({ button_id: buttonId });
	}, []);

	return (
		<div className={cx(fr.cx('fr-container'), classes.root)}>
			<div>
				<h1>{t('pages.form_closed.h1')}</h1>
				<div>{t('pages.form_closed.text')}</div>
				<div className={classes.buttonsGroup}>
					<Button
						linkProps={{
							href: 'https://www.plus.transformation.gouv.fr/experience/step_1?pk_campaign=DINUM_v2'
						}}
					>
						{t('pages.form_closed.button')}
					</Button>
				</div>
			</div>
			<Image
				src="/Demarches/assets/warning_picto_illu.svg"
				alt={t('pages.form_closed.warning_alt')}
				width={282}
				height={319}
			/>
		</div>
	);
};

export default FormClosed;

const useStyles = tss.withParams().create(() => ({
	root: {
		minHeight: '80vh',
		maxWidth: 996,
		display: 'flex',
		gap: fr.spacing('6v'),
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: fr.spacing('20v'),
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column-reverse',
			img: {
				maxHeight: 200
			}
		}
	},
	buttonsGroup: {
		display: 'flex',
		gap: fr.spacing('4v'),
		marginTop: fr.spacing('8v'),
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column-reverse',
			'button,a': { width: '100%', justifyContent: 'center' }
		}
	}
}));
