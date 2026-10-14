import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	form: FormWithElements;
}

const FormStatsVisibility = ({ form }: Props) => {
	const { cx, classes } = useStyles();
	const router = useRouter();
	const [isPublic, setIsPublic] = useState(form.isPublic);

	const setVisibility = trpc.form.setVisibility.useMutation({
		onSuccess: () => {
			router.replace(router.asPath, undefined, { scroll: false });
		},
		onError: (_error, variables) => {
			setIsPublic(!variables.isPublic);
		}
	});

	const publicPageLink = (
		<Link
			className={cx(classes.publicLink)}
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
		<div className={cx(fr.cx('fr-col-12', 'fr-mb-12v'))}>
			<RadioButtons
				legend={
					<h3 className={fr.cx('fr-h4')}>
						Définir la visibilité des statistiques
					</h3>
				}
				name={`form-visibility-${form.id}`}
				state={setVisibility.isError ? 'error' : 'default'}
				stateRelatedMessage={
					setVisibility.isError
						? setVisibility.error.message ||
						  'La visibilité des statistiques n’a pas pu être modifiée.'
						: undefined
				}
				options={[
					{
						label: 'Privé',
						hintText:
							'Seuls les administrateurs de ce service peuvent voir les statistiques. Ils doivent être connectés.',
						nativeInputProps: {
							checked: !isPublic,
							disabled: setVisibility.isLoading,
							onChange: () => updateVisibility(false)
						}
					},
					{
						label: 'Public',
						hintText: (
							<>
								Tout le monde peut voir les statistiques. La page est accessible
								sans connexion. {isPublic && publicPageLink}
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
		marginLeft: fr.spacing('1v')
	}
});

export default FormStatsVisibility;
