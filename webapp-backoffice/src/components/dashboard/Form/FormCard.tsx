import { Form } from '@/prisma/generated/zod';
import { OnClickActionForm } from '@/src/pages/administration/dashboard/forms';
import { formatDateToFrenchString } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { tss } from 'tss-react/dsfr';
import Link from 'next/link';

type Props = {
	form: Form;
	handleActionForm: ({ type, form }: OnClickActionForm) => void;
};

const FormCard = ({ form, handleActionForm }: Props) => {
	const { cx, classes } = useStyles();

	return (
		<div className={fr.cx('fr-card', 'fr-my-3w', 'fr-p-2w')}>
			<div
				className={fr.cx(
					'fr-grid-row',
					'fr-grid-row--gutters',
					'fr-grid-row--middle'
				)}
			>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
					<Link
						href={`/administration/dashboard/form/${form.id}/builder`}
						className={cx(classes.formTitle)}
					>
						<p className={cx(fr.cx('fr-mb-0'), classes.spanFullName)}>
							{form.title}{' '}
						</p>
					</Link>
				</div>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
					{formatDateToFrenchString(
						form.created_at?.toISOString().split('T')[0] || ''
					)}
				</div>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
					{formatDateToFrenchString(
						form.updated_at?.toISOString().split('T')[0] || ''
					)}
				</div>
				<div
					className={cx(
						fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3'),
						classes.wrapperButtons
					)}
				>
					<Button
						iconId="fr-icon-delete-bin-line"
						priority="tertiary"
						size="small"
						title="Supprimer le formulaire"
						iconPosition="right"
						onClick={() => handleActionForm({ form, type: 'delete' })}
						className={cx(fr.cx('fr-mr-5v'), classes.errorColor)}
					>
						Supprimer
					</Button>
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.withName(FormCard.name).create(() => ({
	spanFullName: {
		fontWeight: 'bold'
	},
	wrapperButtons: {
		display: 'flex',
		justifyContent: 'end'
	},
	errorColor: {
		color: fr.colors.decisions.text.default.error.default
	},
	formTitle: {
		fontSize: '18px',
		fontWeight: 'bold',
		color: fr.colors.decisions.text.title.blueFrance.default,
		backgroundImage: 'none',
		'&:hover': {
			textDecoration: 'underline'
		}
	}
}));

export default FormCard;
