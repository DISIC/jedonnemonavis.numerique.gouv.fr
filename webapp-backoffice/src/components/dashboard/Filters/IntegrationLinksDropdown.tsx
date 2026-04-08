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
		}

		push(['trackEvent', 'Filters', 'Sélection-lien-intégration']);
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
					}
				}}
			>
				{getLabel()}
			</Button>
			<Popover
				open={open}
				anchorEl={anchorEl}
				onClose={() => setAnchorEl(null)}
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
						className: cx(classes.popoverPaper)
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
							Tous les liens d'intégration
						</button>
					</li>
					{buttons.map(button => (
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
								{button.title}
							</button>
						</li>
					))}
				</ul>
			</Popover>
		</>
	);
};

const useStyles = tss.create({
	filterButton: {
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
		padding: `${fr.spacing('1v')} 0`,
		minWidth: '250px'
	},
	optionItem: {
		...fr.typography[17].style,
		display: 'block',
		width: '100%',
		padding: `${fr.spacing('2v')} ${fr.spacing('3w')}`,
		border: 'none',
		background: 'none',
		textAlign: 'left',
		cursor: 'pointer',
		color: fr.colors.decisions.text.default.grey.default,
		'&:hover': {
			backgroundColor:
				fr.colors.decisions.background.default.grey.hover
		}
	},
	optionItemSelected: {
		backgroundColor:
			fr.colors.decisions.background.actionLow.blueFrance.default,
		color: fr.colors.decisions.background.actionHigh.blueFrance.default,
		fontWeight: 'bold'
	}
});

export default IntegrationLinksDropdown;
