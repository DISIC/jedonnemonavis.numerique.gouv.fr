import { hasAnyFilterChanged, useFilters } from '@/src/contexts/FiltersContext';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Popover } from '@mui/material';
import { Button as PrismaButton } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import { useRef, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { FilterSectionKey } from './Filters';

interface IntegrationLinksDropdownProps {
	buttons: PrismaButton[];
	filterKey: FilterSectionKey;
}

const MENU_ID = 'source-select-menu';

const IntegrationLinksDropdown = ({
	buttons,
	filterKey
}: IntegrationLinksDropdownProps) => {
	const { classes, cx } = useStyles();
	const { filters, updateFilters } = useFilters();
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const menuRef = useRef<HTMLUListElement | null>(null);

	// All options: "all" first, then each button.
	const allOptions = [{ id: undefined as number | undefined, title: "Tous les liens d'intégration" }, ...buttons.map(b => ({ id: b.id as number | undefined, title: b.title }))];

	const getSelectedButtonId = (): number | undefined => {
		if (filterKey === 'productStats') return filters.productStats.buttonId;
		if (filterKey === 'productReviews') {
			const ids = filters.productReviews.filters.buttonId;
			return ids.length === 1 ? parseInt(ids[0]) : undefined;
		}
		return undefined;
	};

	const selectedButtonId = getSelectedButtonId();

	const getLabel = () => {
		if (selectedButtonId !== undefined) {
			const found = buttons.find(b => b.id === selectedButtonId);
			if (found) return found.title;
		}
		return "Tous les liens d'intégration";
	};

	const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
		triggerRef.current?.focus();
	};

	const handleSelect = (buttonId: number | undefined) => {
		let nextFilters: typeof filters | null = null;

		if (filterKey === 'productStats') {
			nextFilters = {
				...filters,
				productStats: { ...filters.productStats, buttonId }
			};
			push(['trackEvent', 'Product - Stats', 'selection-source']);
		} else if (filterKey === 'productReviews') {
			nextFilters = {
				...filters,
				productReviews: {
					...filters.productReviews,
					filters: {
						...filters.productReviews.filters,
						buttonId: buttonId ? [String(buttonId)] : []
					}
				}
			};
			push(['trackEvent', 'Product - Reviews', 'selection-source']);
		}

		if (nextFilters) {
			updateFilters({
				...nextFilters,
				sharedFilters: {
					...nextFilters.sharedFilters,
					hasChanged: hasAnyFilterChanged(nextFilters)
				}
			});
		}

		handleClose();
	};

	const focusItemAt = (index: number) => {
		const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
		items?.[index]?.focus();
	};

	const handleMenuKeyDown = (e: React.KeyboardEvent) => {
		const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
		const current = document.activeElement;
		const currentIndex = items.indexOf(current as HTMLElement);

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				focusItemAt(currentIndex < items.length - 1 ? currentIndex + 1 : 0);
				break;
			case 'ArrowUp':
				e.preventDefault();
				focusItemAt(currentIndex > 0 ? currentIndex - 1 : items.length - 1);
				break;
			case 'Home':
				e.preventDefault();
				focusItemAt(0);
				break;
			case 'End':
				e.preventDefault();
				focusItemAt(items.length - 1);
				break;
			case 'Escape':
				e.preventDefault();
				handleClose();
				break;
			case 'Tab':
				handleClose();
				break;
		}
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
					ref: triggerRef,
					onClick: handleOpen,
					'aria-haspopup': 'menu',
					'aria-expanded': open ? 'true' : 'false',
					'aria-controls': open ? MENU_ID : undefined
				}}
			>
				{getLabel()}
			</Button>
			<Popover
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				disableScrollLock
				TransitionProps={{
					onEntered: () => {
						const selected = menuRef.current?.querySelector<HTMLElement>('[aria-checked="true"]');
						const first = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
						(selected ?? first)?.focus();
					}
				}}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				transformOrigin={{ vertical: 'top', horizontal: 'left' }}
				slotProps={{
					paper: {
						className: cx(classes.popoverPaper)
					}
				}}
			>
				<ul
					ref={menuRef}
					id={MENU_ID}
					role="menu"
					aria-label="Sélectionner une source"
					className={cx(classes.optionsList)}
					onKeyDown={handleMenuKeyDown}
				>
					{allOptions.map((option, index) => {
						const isSelected = option.id === selectedButtonId;
						const isLast = index === allOptions.length - 1;
						return (
							<li key={option.id ?? 'all'} role="none">
								<button
									type="button"
									role="menuitem"
									aria-checked={isSelected}
									className={cx(
										classes.optionItem,
										isSelected ? classes.optionItemSelected : undefined
									)}
									onClick={() => handleSelect(option.id)}
								>
									<span
										className={cx(
											classes.optionItemLabel,
											isSelected ? classes.optionItemLabelSelected : undefined
										)}
									>
										{option.title}
									</span>
								</button>
								{!isLast && <hr />}
							</li>
						);
					})}
				</ul>
			</Popover>
		</>
	);
};

const useStyles = tss.create({
	filterButton: {
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`
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
		},
		'&:focus-visible': {
			outline: `2px solid ${fr.colors.decisions.border.active.blueFrance.default}`,
			outlineOffset: -2
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
