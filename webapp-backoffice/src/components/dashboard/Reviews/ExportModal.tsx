import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import { useSession } from 'next-auth/react';
import React from 'react';
import { Loader } from '../../ui/Loader';
import { push } from '@socialgouv/matomo-next';

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
}

const ExportModal = (props: Props) => {
	const { modal, counts, product_id, params } = props;
	const { data: session } = useSession({ required: true });
	const modalOpen = useIsModalOpen(modal);

	const [choice, setChoice] = React.useState<'all' | 'filtered' | null>(null);
	const [format, setFormat] = React.useState<'csv' | 'xls' | null>(null);
	const [startDate, setStartDate] = React.useState<string | null>(null);
	const [endDate, setEndDate] = React.useState<string | null>(null);

	const {
		data: exportCsv,
		isFetching: isLoadingExport,
		refetch: refetchExport
	} = trpc.export.getByUser.useQuery(
		{
			user_id: parseInt(session?.user?.id as string),
			status: ['idle', 'processing'],
			product_id: product_id
		},
		{
			enabled: modalOpen,
			initialData: {
				data: []
			}
		}
	);

	const hasExportsInProgress = exportCsv?.data.length > 0;

	const createExport = trpc.export.create.useMutation({
		onSuccess: () => {
			refetchExport();
		}
	});

	const validateExport = () => {
		createExport.mutate({
			user_id: parseInt(session?.user?.id as string),
			params: choice == 'filtered' ? params : '',
			product_id: product_id,
			type: format ?? 'csv'
		});
	};

	React.useEffect(() => {
		setStartDate(JSON.parse(params).startDate || null);
		setEndDate(JSON.parse(params).endDate || null);
	}, [params]);

	const getModalContent = () => {
		if (isLoadingExport)
			return (
				<div className={fr.cx('fr-pb-10v', 'fr-pt-10w')}>
					<Loader />
				</div>
			);

		if (!hasExportsInProgress) {
			return (
				<>
					<Alert
						description="
					Vous pouvez télécharger l'ensemble des avis relatifs à cette démarche ou uniquement ceux correspondant aux critères spécifiés par les filtres que vous avez sélectionnés. Le délai de traitement des exports volumineux peut nécessiter jusqu'à une heure."
						severity="info"
						small
						className={fr.cx('fr-mt-10v')}
					/>
					<RadioButtons
						legend="Que souhaitez-vous télécharger ?"
						name="choice"
						hintText={
							(!startDate || !endDate) &&
							`Les formats de date de vos filtres sont actuellement invalides`
						}
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
									},
									disabled: !startDate || !endDate
								}
							}
						]}
						className={fr.cx('fr-mt-10v')}
					/>
					<RadioButtons
						legend="Sous quel format souhaitez-vous télécharger ?"
						name="format"
						options={[
							{
								label: `Format CSV`,
								nativeInputProps: {
									value: 'csv',
									onClick: () => {
										setFormat('csv');
									}
								}
							},
							{
								label: `Format XLSX`,
								nativeInputProps: {
									value: 'xls',
									onClick: () => {
										setFormat('xls');
									}
								}
							}
						]}
						className={fr.cx('fr-mt-10v')}
					/>
				</>
			);
		} else {
			return (
				<>
					<p className={fr.cx('fr-mt-10v')}>
						Vous avez un export en cours de traitement sur ce service, vous
						recevrez un lien de téléchargement par email à l'adresse{' '}
						<b>{session?.user.email}</b> dès qu'il sera prêt.
					</p>
				</>
			);
		}
	};

	return (
		<modal.Component
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
			buttons={[
				!hasExportsInProgress
					? {
							children: 'Valider',
							type: 'submit',
							doClosesModal: false,
							priority: 'primary',
							disabled: choice === null || format === null,
							onClick: () => {
								if (choice) {
									validateExport();
									push(['trackEvent', 'Avis', 'Filtre-Téléchargement']);
								}
							}
						}
					: {
							children: 'Fermer',
							type: 'button',
							doClosesModal: true,
							priority: 'secondary'
						}
			]}
			concealingBackdrop={false}
			title={'Télécharger les avis'}
			size="large"
		>
			{getModalContent()}
		</modal.Component>
	);
};

export default ExportModal;
