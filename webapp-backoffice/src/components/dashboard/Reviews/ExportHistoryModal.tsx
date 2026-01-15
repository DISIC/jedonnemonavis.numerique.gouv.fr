import { Loader } from '@/src/components/ui/Loader';
import { Export, ExportWithPartialRelations } from '@/prisma/generated/zod';
import { CustomModalProps } from '@/src/types/custom';
import {
	getExportFiltersLabel,
	getExportPeriodLabel,
	parseExportParams
} from '@/src/utils/export';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Table from '@codegouvfr/react-dsfr/Table';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	modal: CustomModalProps;
	product_id: number;
	form_id: number;
}

type SortColumn = 'date' | 'user' | 'period' | null;
type SortDirection = 'asc' | 'desc';
type ExportWithLabels = ExportWithPartialRelations & {
	periodLabel: string;
	filtersLabel: string;
};

const ExportHistoryModal = ({ modal, product_id, form_id }: Props) => {
	const { classes, cx } = useStyles();
	const { data: session } = useSession({ required: true });
	const modalOpen = useIsModalOpen(modal);

	const [sortColumn, setSortColumn] = useState<SortColumn>(null);
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

	const {
		data: exportData,
		isLoading: isLoadingData,
		refetch: refetchData
	} = trpc.export.getByUser.useQuery(
		{
			user_id: parseInt(session?.user?.id as string),
			product_id: product_id,
			form_id: form_id
		},
		{
			enabled: modalOpen,

			initialData: {
				data: []
			}
		}
	);

	const exportsWithLabels: ExportWithLabels[] = useMemo(() => {
		return (exportData?.data || []).map(record => {
			const parsedParams = parseExportParams(record.params);
			const periodLabel = getExportPeriodLabel({
				...parsedParams,
				startDate: parsedParams.startDate,
				endDate: parsedParams.endDate
			});
			const filtersLabel = getExportFiltersLabel(parsedParams);

			return {
				...record,
				periodLabel: periodLabel || '',
				filtersLabel: filtersLabel || ''
			};
		});
	}, [exportData]);

	useEffect(() => {
		if (!modalOpen) return;

		const interval = setInterval(() => {
			const hasIncompleteExports = (exportData?.data || []).some(
				exp => exp.status !== 'done'
			);

			if (hasIncompleteExports) {
				refetchData();
			}
		}, 5000);

		return () => clearInterval(interval);
	}, [modalOpen, refetchData, exportData]);

	const handleSort = (column: SortColumn) => {
		if (sortColumn === column) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortColumn(column);
			setSortDirection('desc');
		}
	};

	const finalData: ExportWithLabels[] = useMemo(() => {
		if (!sortColumn) return exportsWithLabels;

		return [...exportsWithLabels].sort((a, b) => {
			let comparison = 0;

			switch (sortColumn) {
				case 'date':
					comparison =
						new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
					break;
				case 'user': {
					const aName =
						`${a.user?.firstName ?? ''} ${a.user?.lastName ?? ''}`.trim();
					const bName =
						`${b.user?.firstName ?? ''} ${b.user?.lastName ?? ''}`.trim();

					comparison = aName.localeCompare(bName);
					break;
				}
				case 'period':
					comparison = (a.periodLabel || '').localeCompare(b.periodLabel || '');
					break;
			}

			return sortDirection === 'asc' ? comparison : -comparison;
		});
	}, [exportsWithLabels, sortColumn, sortDirection]);

	const getSortIcon = (column: SortColumn) => {
		if (sortColumn === column) {
			return sortDirection === 'asc' ? (
				<i
					className={fr.cx('ri-arrow-up-line', 'fr-icon--sm')}
					aria-hidden="true"
				/>
			) : (
				<i
					className={fr.cx('ri-arrow-down-line', 'fr-icon--sm')}
					aria-hidden="true"
				/>
			);
		}
		return (
			<i
				className={fr.cx('ri-arrow-up-down-line', 'fr-icon--sm')}
				aria-hidden="true"
			/>
		);
	};

	return (
		<modal.Component
			className={cx(
				fr.cx('fr-grid-row', 'fr-grid-row--center', 'fr-my-0'),
				classes.modal
			)}
			title={'Historique des exports'}
			size="large"
		>
			<div className={fr.cx('fr-col-12')}>
				{isLoadingData ? (
					<div className={cx(classes.loaderContainer)}>
						<Loader />
					</div>
				) : finalData.length === 0 ? (
					<div className={cx(classes.emptyStateContainer)}>
						<p className={fr.cx('fr-grid-row--center')}>
							Aucun export trouvé pour ce formulaire
						</p>
					</div>
				) : (
					<Table
						bordered
						headers={[
							<div key="date" className={classes.headerCellWithButton}>
								Date d'export
								<Button
									priority="tertiary"
									size="small"
									onClick={() => handleSort('date')}
									aria-label="Trier par date d'export"
								>
									{getSortIcon('date')}
								</Button>
							</div>,
							<div key="user" className={classes.headerCellWithButton}>
								Exporté par
								<Button
									priority="tertiary"
									size="small"
									onClick={() => handleSort('user')}
									aria-label="Trier par utilisateur"
								>
									{getSortIcon('user')}
								</Button>
							</div>,
							<div key="period" className={classes.headerCellWithButton}>
								Période exportée
								<Button
									priority="tertiary"
									size="small"
									onClick={() => handleSort('period')}
									aria-label="Trier par période"
								>
									{getSortIcon('period')}
								</Button>
							</div>,
							'Filtres actifs',
							'Lien'
						]}
						data={finalData.map(record => [
							<b>
								{new Date(record.created_at).toLocaleDateString('fr-FR', {
									day: '2-digit',
									month: '2-digit',
									year: 'numeric'
								})}
							</b>,
							record.user?.firstName + ' ' + record.user?.lastName,
							record.periodLabel,
							record.filtersLabel || '-',
							<div className={classes.linkCell}>
								{record.link ? (
									<Link
										key={record.id}
										href={record.link}
										className={fr.cx('fr-link', 'fr-link--sm')}
										rel="noopener noreferrer"
									>
										Télécharger&nbsp;
										<i
											className={fr.cx('fr-icon-download-line', 'fr-icon--sm')}
											aria-hidden="true"
										/>
									</Link>
								) : (
									<Badge small severity="warning" noIcon>
										Bientôt disponible
									</Badge>
								)}
							</div>
						])}
					/>
				)}
			</div>
		</modal.Component>
	);
};

const useStyles = tss.create({
	modal: {
		'& .fr-col-lg-8': {
			flexGrow: 0,
			flexShrink: 0,
			flexBasis: 'calc(1100% / 12)',
			width: 'calc(1100% / 12)',
			maxWidth: 'calc(1100% / 12)'
		},
		table: {
			display: 'table'
		}
	},
	loaderContainer: {
		display: 'flex',
		justifyContent: 'center',
		padding: fr.spacing('10v')
	},
	emptyStateContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		padding: fr.spacing('10v'),
		color: fr.colors.decisions.text.default.grey.default
	},
	headerCellWithButton: {
		display: 'flex',
		alignItems: 'center',
		gap: fr.spacing('2v')
	},
	linkCell: {
		minWidth: '10rem'
	}
});

export default ExportHistoryModal;
