import { CustomModalProps } from '@/src/types/custom';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import { push } from '@socialgouv/matomo-next';
import { useSession } from 'next-auth/react';
import React from 'react';
import { Loader } from '../../ui/Loader';

interface Props {
	modal: CustomModalProps;
	counts: {
		countFiltered: number;
		countAll: number;
	};
	product_id: number;
	form_id: number;
	params: string;
	onExportCreated: () => void;
	hasExportsInProgress: boolean;
}

const ExportModal = (props: Props) => {
	const {
		modal,
		counts,
		product_id,
		form_id,
		params,
		onExportCreated,
		hasExportsInProgress
	} = props;
	const { data: session } = useSession({ required: true });
	const modalOpen = useIsModalOpen(modal);

	const [choice, setChoice] = React.useState<'all' | 'filtered' | null>(
		'filtered'
	);
	const [format, setFormat] = React.useState<'csv' | 'xls' | null>('xls');
	const [startDate, setStartDate] = React.useState<string | null>(null);
	const [endDate, setEndDate] = React.useState<string | null>(null);

	const createExport = trpc.export.create.useMutation({
		onSuccess: () => {
			onExportCreated();
		}
	});

	const validateExport = () => {
		createExport.mutate({
			user_id: parseInt(session?.user?.id as string),
			params: choice == 'filtered' ? params : '',
			product_id: product_id,
			form_id: form_id,
			type: format ?? 'csv'
		});
	};

	React.useEffect(() => {
		setStartDate(JSON.parse(params).startDate || null);
		setEndDate(JSON.parse(params).endDate || null);
	}, [params]);

	return (
		<modal.Component
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
			buttons={[
				{
					children: 'Recevoir un lien de téléchargement par e-mail',
					type: 'submit',
					priority: 'primary',
					disabled: choice === null || format === null,
					onClick: () => {
						if (choice) {
							validateExport();
							push(['trackEvent', 'Avis', 'Filtre-Téléchargement']);
						}
					}
				}
			]}
			concealingBackdrop={false}
			title={'Exporter les réponses'}
			size="large"
		>
			<RadioButtons
				legend="Mode d'exportation"
				name="choice"
				hintText={`Le délais des exports volumineux peut prendre jusqu'à une heure. ${
					!startDate || !endDate
						? `Les formats de date de vos filtres sont actuellement invalides`
						: ''
				}`}
				options={[
					{
						label: `En fonction des filtres sélectionnés (${counts.countFiltered} réponses)`,
						nativeInputProps: {
							value: 'filtered',
							checked: choice === 'filtered',
							onChange: () => {
								setChoice('filtered');
							},
							disabled: !startDate || !endDate
						}
					},
					{
						label: `Tous les avis (${counts.countAll} réponses)`,
						nativeInputProps: {
							value: 'all',
							checked: choice === 'all',
							onChange: () => {
								setChoice('all');
							}
						}
					}
				]}
				className={fr.cx('fr-mt-10v')}
			/>
			<RadioButtons
				legend="Format de fichier"
				name="format"
				options={[
					{
						label: `Fichier .XLSX`,
						hintText: `Format Excel`,
						nativeInputProps: {
							value: 'xls',
							checked: format === 'xls',
							onChange: () => {
								setFormat('xls');
							}
						}
					},
					{
						label: `Fichier .CSV`,
						nativeInputProps: {
							value: 'csv',
							checked: format === 'csv',
							onChange: () => {
								setFormat('csv');
							}
						}
					}
				]}
				className={fr.cx('fr-mt-10v')}
			/>
		</modal.Component>
	);
};

export default ExportModal;
