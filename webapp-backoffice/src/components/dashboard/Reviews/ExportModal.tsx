import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { tss } from 'tss-react/dsfr';
import React from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { useSession } from 'next-auth/react';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import { trpc } from '@/src/utils/trpc';

interface CustomModalProps {
	buttonProps: {
		id: string;
		'aria-controls': string;
		'data-fr-opened': boolean;
	};
	Component: (props: ModalProps) => JSX.Element;
	close: () => void;
	open: () => void;
	isOpenedByDefault: boolean;
	id: string;
}

interface Props {
	modal: CustomModalProps;
	counts: {
		countFiltered: number;
		countAll: number;
	};
	product_id: number;
	params: string;
	hasExportsInProgress: boolean;
	action: (choice: 'all' | 'filtered') => void;
}

const ExportModal = (props: Props) => {
	const { modal, counts, action, product_id, params, hasExportsInProgress } = props;
	const [choice, setChoice] = React.useState<'all' | 'filtered' | null>(null);
	const [validate, setValidate] = React.useState<boolean>(false);
	const { cx, classes } = useStyles();
	const { data: session } = useSession({ required: true });

	const createExport = trpc.export.create.useMutation();

	const validateExport = () => {
		createExport.mutate({
			user_id: parseInt(session?.user?.id as string),
			params: choice == 'filtered' ? params : '',
			product_id: product_id
		});
		setValidate(true);
	};

	return (
		<modal.Component
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
			concealingBackdrop={false}
			title={'Télécharger les avis'}
			size="large"
		>
			{!validate && !hasExportsInProgress ? (
				<>
					<Alert
						description="
						Vous pouvez télécharger l'ensemble des avis relatifs à cette démarche ou uniquement ceux correspondant aux critères spécifiés par les filtres que vous avez sélectionnés. Le délai de traitement des exports volumineux peut nécessiter jusqu'à 24 heures."
						severity="info"
						small
						className={fr.cx('fr-mt-10v')}
					/>
					<RadioButtons
						legend="Que souhaitez-vous télécharger ?"
						name="radio"
						options={[
							{
								label: `Télécharger tous les avis (${counts.countAll} avis)`,
								nativeInputProps: {
									value: 'all',
									onClick: () => {
										setChoice('all');
									}
								}
							},
							{
								label: `Télécharger en fonction des filtres (${counts.countFiltered} avis)`,
								nativeInputProps: {
									value: 'filtered',
									onClick: () => {
										setChoice('filtered');
									}
								}
							}
						]}
						className={fr.cx('fr-mt-10v')}
					/>
					<div className={cx(classes.buttonWrapper, fr.cx('fr-col-12'))}>
						<Button
							priority="primary"
							type="button"
							disabled={choice === null}
							nativeButtonProps={{
								onClick: () => {
									if (choice) validateExport();
								}
							}}
							className={fr.cx('fr-mt-10v')}
						>
							Valider
						</Button>
					</div>
				</>
			) : 
			(
				<>
					<p className={fr.cx('fr-mt-10v')}>
						Vous avez un export en cours de traitement sur ce service, vous recevrez un lien de téléchargement par email dès qu'il sera prêt.
					</p>
					<p className={fr.cx('fr-mt-10v')}>
						Vous pourrez lancer un nouvel export une fois que le précédent sera achevé.
					</p>
					<div className={cx(classes.buttonWrapper, fr.cx('fr-col-12'))}>
						<Button
							priority="secondary"
							type="button"
							disabled={choice === null}
							nativeButtonProps={{
								onClick: () => {
									if (choice) action(choice);
								}
							}}
							className={fr.cx('fr-mt-10v')}
						>
							Fermer
						</Button>
					</div>
				</>
			)}
		</modal.Component>
	);
};

const useStyles = tss.withName(ExportModal.name).create(() => ({
	buttonWrapper: {
		display: 'flex',
		justifyContent: 'flex-end'
	}
}));

export default ExportModal;
