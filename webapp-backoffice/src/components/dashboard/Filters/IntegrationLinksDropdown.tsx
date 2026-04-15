import { useFilters } from '@/src/contexts/FiltersContext';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Popover } from '@mui/material';
import { Button as PrismaButton } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { FilterSectionKey } from './Filters';

interface IntegrationLinksDropdownProps {
	buttons: PrismaButton[];
	filterKey: FilterSectionKey;
}

const IntegrationLinksDropdown = ({
	buttons,
	filterKey
}: IntegrationLinksDropdownProps) => {
	const { classes, cx } = useStyles();
	const { filters, updateFilters } = useFilters();
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);

	const getSelectedButtonId = (): number | undefined => {
		if (filterKey === 'productStats') {
			return filters.productStats.buttonId;
		}
		if (filterKey === 'productReviews') {
			const ids = filters.productReviews.filters.buttonId;
			return ids.length === 1 ? parseInt(ids[0]) : undefined;
		}
		return undefined;
	};

	const selectedButtonId = getSelectedButtonId();

	const getLabel = () => {
		if (selectedButtonId) {
			const found = buttons.find(b => b.id === selectedButtonId);
			if (found) return found.title;
		}
		return "Tous les liens d'intégration";
	};

	const handleSelect = (buttonId: number | undefined) => {
		if (filterKey === 'productStats') {
			updateFilters({
				...filters,
				productStats: {
					...filters.productStats,
					buttonId: buttonId
				},
				sharedFilters: {
					...filters.sharedFilters,
					hasChanged: true
				}
			});
			push(['trackEvent', 'Product - Stats', 'selection-source']);
		} else if (filterKey === 'productReviews') {
			updateFilters({
				...filters,
				productReviews: {
					...filters.productReviews,
					filters: {
						...filters.productReviews.filters,
						buttonId: buttonId ? [String(buttonId)] : []
					}
				},
				sharedFilters: {
					...filters.sharedFilters,
					hasChanged: true
				}
			});
			push(['trackEvent', 'Product - Reviews', 'selection-source']);
		}

		setAnchorEl(null);
	};

	return (
		<>
			<Button
				className={cx(classes.filterButton)}
				priority="tertiary"
				iconId="ri-arrow-down-s-line"
				iconPosition="right"
				type="button"
				nativeButtonProps={{
					onClick: (e: React.MouseEvent<HTMLElement>) => {
						setAnchorEl(e.currentTarget);
					},
					'aria-expanded': open ? 'true' : 'false',
					'aria-controls': 'source-select-menu'
				}}
			>
				{getLabel()}
			</Button>
			<Popover
				open={open}
				anchorEl={anchorEl}
				onClose={() => setAnchorEl(null)}
				disablePortal
				disableScrollLock
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left'
				}}
				slotProps={{
					paper: {
						className: cx(classes.popoverPaper),
						id: 'source-select-menu'
					}
				}}
			>
				<ul className={cx(classes.optionsList)}>
					<li>
						<button
							type="button"
							className={cx(
								classes.optionItem,
								selectedButtonId === undefined
									? classes.optionItemSelected
									: undefined
							)}
							onClick={() => handleSelect(undefined)}
						>
							<span
								className={cx(
									classes.optionItemLabel,
									selectedButtonId === undefined
										? classes.optionItemLabelSelected
										: undefined
								)}
							>
								Tous les liens d'intégration
							</span>
						</button>
						<hr />
					</li>
					{buttons.map((button, index) => (
						<li key={button.id}>
							<button
								type="button"
								className={cx(
									classes.optionItem,
									selectedButtonId === button.id
										? classes.optionItemSelected
										: undefined
								)}
								onClick={() => handleSelect(button.id)}
							>
								<span
									className={cx(
										classes.optionItemLabel,
										selectedButtonId === button.id
											? classes.optionItemLabelSelected
											: undefined
									)}
								>
									{button.title}
								</span>
							</button>
							{index < buttons.length - 1 && <hr />}
						</li>
					))}
				</ul>
			</Popover>
		</>
	);
};

const useStyles = tss.create({
	filterButton: {
		display: 'inline-flex',
		flexDirection: 'row',
		alignItems: 'center',
		width: 'fit-content',
		fontWeight: 500,
		fontSize: '1rem',
		lineHeight: '1.5rem',
		minHeight: '2.5rem',
		padding: '0.5rem 1rem',
		backgroundColor: 'transparent',
		color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		boxShadow: `inset 0 0 0 1px #DDDDDD`,
		border: '1px solid #DDDDDD'
	},
	popoverPaper: {
		marginTop: fr.spacing('1v'),
		borderRadius: 0,
		boxShadow: '0px 4px 12px rgba(0, 0, 18, 0.16)'
	},
	optionsList: {
		listStyle: 'none',
		margin: 0,
		padding: 0,
		minWidth: '250px',
		li: { paddingBottom: 0 },
		hr: {
			paddingBottom: 1,
			...fr.spacing('margin', { rightLeft: '3w' })
		}
	},
	optionItem: {
		display: 'block',
		width: '100%',
		...fr.spacing('padding', { topBottom: '3v', right: '3w', left: 0 }),
		...fr.spacing('margin', { topBottom: '1v' }),
		border: 'none',
		background: 'none',
		textAlign: 'left',
		cursor: 'pointer',
		color: fr.colors.decisions.text.default.grey.default,
		'&:hover': {
			backgroundColor: fr.colors.decisions.background.default.grey.hover
		}
	},
	optionItemSelected: {
		color: fr.colors.decisions.background.actionHigh.blueFrance.default,
		fontWeight: 'bold'
	},
	optionItemLabel: {
		paddingLeft: fr.spacing('3w')
	},
	optionItemLabelSelected: {
		borderLeft: `3px solid ${fr.colors.decisions.background.actionHigh.blueFrance.default}`
	}
});

export default IntegrationLinksDropdown;
