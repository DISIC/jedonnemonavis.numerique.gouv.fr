import { CustomModalProps } from '@/src/types/custom';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import {
	getExportFiltersLabel,
	getExportPeriodLabel,
	parseExportParams
} from '@/src/utils/export';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import { Button } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import { useSession } from 'next-auth/react';
import React from 'react';

interface Props {
	modal: CustomModalProps;
	counts: {
		countFiltered: number;
		countAll: number;
	};
	params: string;
	onExportCreated: (exportId: number) => void;
	hasExportsInProgress: boolean;
	form: FormWithElements;
	buttons: Button[];
}

const ExportModal = (props: Props) => {
	const {
		modal,
		counts,
		form,
		params,
		onExportCreated,
		hasExportsInProgress,
		buttons
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
		onSuccess: data => {
			onExportCreated(data.data.id);
		}
	});

	const validateExport = () => {
		createExport.mutate({
			user_id: parseInt(session?.user?.id as string),
			params: choice == 'filtered' ? params : '',
			product_id: form.product_id,
			form_id: form.id,
			type: format ?? 'csv'
		});
	};

	React.useEffect(() => {
		setStartDate(JSON.parse(params).startDate || null);
		setEndDate(JSON.parse(params).endDate || null);
	}, [params]);

	const currentFiltersLabels = React.useMemo(() => {
		const parsedParams = parseExportParams(params);
		return [
			`Période : ${getExportPeriodLabel(parsedParams)}`,
			...(getExportFiltersLabel(parsedParams, true, buttons) as string[])
		];
	}, [params, buttons]);

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
					children: 'Exporter les réponses',
					type: 'submit',
					priority: 'primary',
					disabled: choice === null || format === null,
					onClick: () => {
						if (choice) {
							validateExport();
							push(['trackEvent', 'Avis', 'Filtre-Téléchargement']);
							window._mtm?.push({
								event: 'matomo_event',
								container_type: 'backoffice',
								service_id: form.product_id,
								form_id: form.id,
								template_slug: form.form_template.slug,
								category: 'reviews',
								action_type: 'export',
								action: `review_export`,
								value:
									choice === 'filtered' ? counts.countFiltered : counts.countAll
							});
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
						hintText: (
							<ul className={fr.cx('fr-mb-0')}>
								{currentFiltersLabels.map((filter, index) => (
									<li key={index}>{filter}</li>
								))}
							</ul>
						),
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
