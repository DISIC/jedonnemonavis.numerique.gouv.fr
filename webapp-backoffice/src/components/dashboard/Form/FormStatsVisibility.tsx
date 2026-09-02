import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import Link from 'next/link';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	form: FormWithElements;
}

const FormStatsVisibility = ({ form }: Props) => {
	const { cx, classes } = useStyles();
	const [isPublic, setIsPublic] = useState(form.isPublic);

	const setVisibility = trpc.form.setVisibility.useMutation({
		onError: () => setIsPublic(!isPublic)
	});

	const publicPageLink = (
		<Link
			className={cx(classes.publicLink, fr.cx('fr-link', 'fr-text--sm'))}
			href={`/public/form/${form.id}/stats`}
			target="_blank"
		>
			Voir la page publique
		</Link>
	);

	if (form.isTop250) {
		return (
			<>
				<div className={fr.cx('fr-col-12', 'fr-col-md-8', 'fr-mb-6v')}>
					<h3 className={fr.cx('fr-mb-0', 'fr-h4')}>
						Visibilité des statistiques
					</h3>
				</div>
				<div className={fr.cx('fr-col-12', 'fr-mb-12v')}>
					<Alert
						severity="info"
						small
						description={
							<>
								Les statistiques de ce formulaire sont publiques car il s’agit
								d’une démarche essentielle. {publicPageLink}
							</>
						}
					/>
				</div>
			</>
		);
	}

	const updateVisibility = (nextIsPublic: boolean) => {
		setIsPublic(nextIsPublic);
		setVisibility.mutate({
			form_id: form.id,
			product_id: form.product_id,
			isPublic: nextIsPublic
		});
	};

	return (
		<div className={cx(classes.radiosWrapper, fr.cx('fr-col-12', 'fr-mb-12v'))}>
			<RadioButtons
				legend={
					<h3 className={fr.cx('fr-mb-0', 'fr-h4')}>
						Définir la visibilité des statistiques
					</h3>
				}
				hintText="En activant le partage public, toutes les personnes disposant du lien peuvent consulter la page de statistiques. Elles n’auront pas accès aux commentaires."
				name={`form-visibility-${form.id}`}
				options={[
					{
						label: 'Privé',
						nativeInputProps: {
							checked: !isPublic,
							disabled: setVisibility.isLoading,
							onChange: () => updateVisibility(false)
						}
					},
					{
						label: (
							<>
								<span>Publique</span>
								{isPublic && publicPageLink}
							</>
						),
						nativeInputProps: {
							checked: isPublic,
							disabled: setVisibility.isLoading,
							onChange: () => updateVisibility(true)
						}
					}
				]}
			/>
		</div>
	);
};

const useStyles = tss.withName({ FormStatsVisibility }).create({
	publicLink: {
		marginLeft: fr.spacing('3v')
	},
	radiosWrapper: {
		'.fr-radio-group .fr-label': {
			flexDirection: 'row'
		}
	}
});

export default FormStatsVisibility;
