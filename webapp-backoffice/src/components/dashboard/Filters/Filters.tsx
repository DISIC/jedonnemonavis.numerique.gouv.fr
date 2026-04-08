import { Filters, useFilters } from '@/src/contexts/FiltersContext';
import { tss } from 'tss-react/dsfr';
import { fr } from '@codegouvfr/react-dsfr';
import { useEffect } from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { getDatesByShortCut } from '@/src/utils/tools';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { CustomModalProps } from '@/src/types/custom';
import { Button as PrismaButton } from '@prisma/client';
import DateRangePickerButton from './DateRangePickerButton';
import IntegrationLinksDropdown from './IntegrationLinksDropdown';

const dateShortcuts = [
	{
		label: '365 derniers jours',
		name: 'one-year'
	},
	{
		label: '30 derniers jours',
		name: 'one-month'
	},
	{
		label: '7 derniers jours',
		name: 'one-week'
	}
] as const;

export type DateShortcutName =
	| (typeof dateShortcuts)[number]['name']
	| undefined;

export type FilterSectionKey = keyof Pick<
	Filters,
	'productActivityLogs' | 'productReviews' | 'productStats'
>;

type FiltersProps<T extends FilterSectionKey> = {
	filterKey: T;
	sticky?: Boolean;
	children?: React.ReactNode;
	topRight?: React.ReactNode;
	renderTags?: () => (React.JSX.Element | null)[] | React.JSX.Element | null;
	form?: FormWithElements;
	productId?: number;
	filterModal?: CustomModalProps;
	buttons?: PrismaButton[];
	showNewReviewsOption?: boolean;
	reviewLogDate?: string;
};

const GenericFilters = <T extends FilterSectionKey>({
	filterKey,
	sticky,
	children,
	topRight,
	renderTags,
	form,
	productId,
	filterModal,
	buttons,
	showNewReviewsOption,
	reviewLogDate
}: FiltersProps<T>) => {
	const { classes, cx } = useStyles();
	const { filters, updateFilters, resetSectionFilters } = useFilters();

	const sharedFilters = filters['sharedFilters'];

	useEffect(() => {
		if (sharedFilters.dateShortcut) {
			const { startDate, endDate } = getDatesByShortCut(
				sharedFilters.dateShortcut
			);

			if (
				startDate !== sharedFilters.currentStartDate ||
				endDate !== sharedFilters.currentEndDate
			) {
				updateFilters({
					...filters,
					[filterKey]: {
						...filters[filterKey]
					},
					sharedFilters: {
						...filters['sharedFilters'],
						currentStartDate: startDate,
						currentEndDate: endDate
					},
					currentPage: 1
				});
			}
		}
	}, [sharedFilters.hasChanged, sharedFilters.dateShortcut]);

	return (
		<div
			className={cx(classes.filterContainer, sticky && classes.stickyContainer)}
		>
			<div className={cx(fr.cx('fr-mb-1v'), classes.titleContainer)}>
				<span className={fr.cx('fr-mb-2v', 'fr-h5')}>Filtrer</span>
				{topRight}
			</div>

			<div className={cx(classes.filterButtonsContainer)}>
				<DateRangePickerButton
					filterKey={filterKey}
					showNewReviewsOption={showNewReviewsOption}
					reviewLogDate={reviewLogDate}
					form={form}
					productId={productId}
				/>
				{buttons && buttons.length > 0 && (
					<IntegrationLinksDropdown
						buttons={buttons}
						filterKey={filterKey}
					/>
				)}
				{filterModal && (
					<Button
						priority="tertiary"
						className={cx(classes.filterButton)}
						iconId="fr-icon-filter-line"
						iconPosition="right"
						type="button"
						nativeButtonProps={filterModal.buttonProps}
					>
						Plus de filtres
					</Button>
				)}
			</div>

			{children && <div>{children}</div>}

			{sharedFilters.hasChanged ? (
				<div className={cx(classes.filterActionContainer)}>
					<Button
						priority="tertiary no outline"
						iconPosition="right"
						iconId="ri-refresh-line"
						onClick={() => {
							resetSectionFilters(filterKey);
						}}
					>
						Réinitialiser les filtres
					</Button>
				</div>
			) : null}

			{renderTags && (
				<div
					className={fr.cx(
						'fr-col-12',
						'fr-col--bottom',
						'fr-py-0',
						'fr-mt-2v'
					)}
				>
					{renderTags()}
				</div>
			)}
		</div>
	);
};

const useStyles = tss.create({
	filterContainer: {
		display: 'flex',
		flexDirection: 'column',
		gap: '0.5rem'
	},
	stickyContainer: {
		[fr.breakpoints.up('md')]: {
			position: 'sticky',
			top: -1,
			zIndex: 99,
			backgroundColor: fr.colors.decisions.background.default.grey.default
		}
	},
	titleContainer: {
		display: 'flex',
		justifyContent: 'space-between'
	},
	filterButtonsContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: fr.spacing('2v'),
		alignItems: 'center'
	},
	filterButton: {
		border: '1px solid #DDDDDD'
	},
	filterActionContainer: {
		display: 'flex',
		justifyContent: 'flex-end',
		alignContent: 'flex-end',
		gap: '1rem'
	}
});

export default GenericFilters;
