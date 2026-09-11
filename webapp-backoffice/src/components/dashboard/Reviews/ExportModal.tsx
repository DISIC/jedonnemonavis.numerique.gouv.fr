import { CustomModalProps } from '@/src/types/custom';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import {
	getExportSummaryLabels,
	getFilterableBlocks,
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
import { tss } from 'tss-react/dsfr';

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
	const { classes, cx } = useStyles();

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

	const currentFiltersLabels = React.useMemo(
		() =>
			getExportSummaryLabels(
				parseExportParams(params),
				buttons,
				getFilterableBlocks(form)
			),
		[params, buttons, form]
	);

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
			<section className={fr.cx('fr-mt-6v')}>
				<h2 className={fr.cx('fr-text--md', 'fr-text--regular', 'fr-mb-2v')}>
					Filtres sélectionnés
				</h2>
				<ul
					className={cx(classes.filtersList, fr.cx('fr-text--xs', 'fr-my-0'))}
				>
					{currentFiltersLabels.map((filter, index) => (
						<li key={index}>{filter}</li>
					))}
				</ul>
			</section>
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
						label: `Toutes les réponses (${counts.countAll} réponses)`,
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

const useStyles = tss.withName({ ExportModal }).create(() => ({
	filtersList: {
		color: fr.colors.decisions.text.mention.grey.default
	}
}));

export default ExportModal;
