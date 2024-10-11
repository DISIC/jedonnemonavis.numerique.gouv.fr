import {
	formatNumberWithSpaces,
	getKeysFromArrayOfObjects
} from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import React, { useState } from 'react';
import { tss } from 'tss-react/dsfr';

interface AnyKey {
	[key: string]: string | number;
}

export interface FormattedData {
	name: string;
	[key: string]: number | string;
}

type Props = {
	children: React.ReactNode;
	title: string;
	total?: number;
	data?: FormattedData[];
	sortOrder?: { [key: string]: number };
	reverseData?: boolean;
	singleRowLabel?: string;
	displayTotal?: 'classic' | 'percentage';
};

const orderData = (
	inputArray: FormattedData[],
	sortOrder: { [key: string]: number }
) => {
	return inputArray.sort((a, b) => sortOrder[a['name']] - sortOrder[b['name']]);
};

const reverseDataInput = (
	inputArray: FormattedData[],
	singleRowLabel?: string
) => {
	const outputArray: FormattedData[] = [];

	if (!inputArray.length) return outputArray;

	const hasMultipleValues = !('value' in inputArray[0]);

	if (hasMultipleValues) {
		inputArray.forEach(item => {
			Object.keys(item)
				.filter(key => key !== 'name')
				.forEach(key => {
					const targetItemIndex = outputArray.findIndex(
						oaItem => oaItem.name === key
					);
					if (targetItemIndex !== -1) {
						if (!outputArray[targetItemIndex][item.name]) {
							outputArray[targetItemIndex][item.name] = 0;
						}

						(outputArray[targetItemIndex][item.name] as number) += parseInt(
							item[key].toString()
						);
					} else {
						const value = parseInt(item[key].toString());
						outputArray.push({
							name: key,
							[item.name]: isNaN(value) ? 0 : value
						});
					}
				});
		});
	} else {
		let outputObject: FormattedData = {
			name: singleRowLabel || 'Nombre de réponses'
		};

		inputArray.forEach(item => {
			outputObject[item.name] = item.value;
		});

		outputArray.push(outputObject);
	}

	return outputArray;
};

const ChartWrapper = ({
	children,
	title,
	total,
	data,
	sortOrder,
	reverseData,
	singleRowLabel,
	displayTotal
}: Props) => {
	const totalFormatted = total ? formatNumberWithSpaces(total) : '';
	const [view, setView] = useState<'chart' | 'table'>('chart');
	const { classes, cx } = useStyles({ view });

	if (!data || !data.length) return <>{children}</>;

	let cleanData = data.filter(
		item =>
			!item.name ||
			(item.name !== 'pas clair du tout' && item.name !== 'très clair')
	);

	if (reverseData) {
		cleanData = reverseDataInput(cleanData, singleRowLabel);
	}

	if (sortOrder) {
		cleanData = orderData(cleanData, sortOrder);
	}

	const headers = cleanData.map(item => item.name);
	const singleRow =
		Object.keys(cleanData[0]).length === 2 && 'value' in cleanData[0];

	const cells = cleanData
		.filter(
			item =>
				!item.name ||
				(item.name !== 'pas clair du tout' && item.name !== 'très clair')
		)
		.map(item => {
			const { name, ...rest } = item;
			return Object.keys(rest)
				.filter(key => !key.includes('value_'))
				.reduce((obj, key) => {
					obj[key] = rest[key];
					return obj;
				}, {} as AnyKey);
		});

	let rows = getKeysFromArrayOfObjects(cells);

	const displayCellValue = (
		cell: AnyKey,
		key: keyof FormattedData,
		dataIndex: number
	) => {
		const value = parseInt((((cell[key] as number) || 0) * 10).toString()) / 10;
		const attachedValue = cleanData[dataIndex][`value_${key}`];

		if (attachedValue) {
			return Math.round(value) + `% (${attachedValue})`;
		}

		return Math.round(value * 100) / 100;
	};

	const getTotalFromKeys = (object: AnyKey, masterKey?: keyof AnyKey) => {
		return Object.keys(object).reduce(
			(accKeys, currentKey) =>
				currentKey !== 'name'
					? !masterKey || (masterKey && masterKey === currentKey)
						? isNaN(parseInt(object[currentKey].toString()))
							? accKeys
							: parseInt(object[currentKey].toString()) + accKeys
						: accKeys
					: accKeys,
			0
		);
	};

	const displayTotalValue = (cells: AnyKey[], currentKey?: keyof AnyKey) => {
		if (displayTotal === 'classic') {
			return cells.reduce(
				(acc, cell) => getTotalFromKeys(cell, currentKey) + acc,
				0
			);
		} else if (displayTotal === 'percentage') {
			const total = cells.reduce((acc, cell) => {
				return getTotalFromKeys(cell) + acc;
			}, 0);
			return (
				Math.round(
					(cells.reduce(
						(acc, cell) => getTotalFromKeys(cell, currentKey) + acc,
						0
					) /
						total) *
						10000
				) /
					100 +
				'%'
			);
		}
	};

	const displayRows = () => {
		if (singleRow) {
			return (
				<tr>
					<td>{singleRowLabel || 'Nombre de réponses'}</td>
					{cells.map((c, index) => (
						<td key={`${JSON.stringify(c)}_${index}_${title}`}>{c.value}</td>
					))}
				</tr>
			);
		}

		return rows.map((r, index) => (
			<tr key={`${r}_${index}_${title}`}>
				<td>{r}</td>
				{cells.map((c, indexC) => (
					<>
						<td key={`${r}_${index}_${JSON.stringify(c)}_${indexC}_${title}`}>
							{displayCellValue(c, r, indexC)}
						</td>
					</>
				))}
				{displayTotal && <td>{displayTotalValue(cells, r)}</td>}
			</tr>
		));
	};

	const displayTable = () => {
		return (
			<div className={cx(classes.tableContainer)}>
				<table className={cx(fr.cx('fr-table'), classes.table)}>
					<thead>
						<tr>
							<th scope="col"></th>
							{headers.map((h, index) => (
								<th scope="col" key={`${h}_${index}_${title}`}>
									{h}
								</th>
							))}
							{displayTotal && (
								<th>
									{displayTotal === 'classic'
										? 'Total des réponses'
										: 'Pourcentage des réponses'}
								</th>
							)}
						</tr>
					</thead>
					<tbody>{displayRows()}</tbody>
				</table>
			</div>
		);
	};

	return (
		<div className={cx(classes.container, fr.cx('fr-mt-10v'))}>
			<div className={classes.header}>
				<div className={classes.container}>
					<h6 className={fr.cx('fr-mb-0')}>{title}</h6>
					{totalFormatted && (
						<p className={fr.cx('fr-hint-text')}>{totalFormatted} réponses</p>
					)}
				</div>
				<div className={classes.flexAlignCenter}>
					<button
						className={cx(
							classes.button,
							view === 'chart' && classes.activeButton,
							view !== 'chart' && classes.inactiveChartBtn
						)}
						onClick={() => setView('chart')}
						role="tab"
					>
						Graphique
					</button>
					<button
						className={cx(
							classes.button,
							view === 'table' && classes.activeButton,
							view !== 'table' && classes.inactiveTableBtn
						)}
						onClick={() => setView('table')}
						role="tab"
					>
						Tableau
					</button>
				</div>
			</div>
			<div className={classes.container}>
				{view === 'chart' ? children : displayTable()}
			</div>
		</div>
	);
};

const useStyles = tss.withName(ChartWrapper.name).create(() => ({
	container: {
		display: 'flex',
		flexDirection: 'column',
		gap: '0.25rem'
	},
	tableContainer: {
		overflowX: 'auto',
		width: '100%'
	},
	table: {
		textAlign: 'center',
		...fr.typography[17].style,
		width: '100%',
		borderCollapse: 'collapse',
		margin: 0,
		th: {
			padding: ' 0 2rem',
			minWidth: '9rem',
			'&:first-of-type': {
				minWidth: '12rem'
			}
		},
		thead: {
			background: fr.colors.decisions.background.contrast.grey.default,
			tr: {
				borderBottom: '2px solid black'
			}
		},
		tbody: {
			tr: {
				':nth-of-type(even)': {
					backgroundColor: fr.colors.decisions.background.contrast.grey.default
				},
				':nth-of-type(odd)': {
					backgroundColor: fr.colors.decisions.background.default.grey.hover
				},
				td: {
					'&:first-of-type': {
						fontWeight: 'bold'
					}
				}
			}
		},
		'td, th': {
			padding: '1.25rem 0.5rem'
		}
	},
	customValue: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		span: {
			color: fr.colors.decisions.text.mention.grey.default,
			fontWeight: 100
		}
	},
	categoryLabel: {
		fontWeight: 600
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: '1rem'
	},
	flexAlignCenter: {
		display: 'flex',
		alignItems: 'center'
	},
	button: {
		backgroundColor: 'transparent',
		borderTop: '1px solid',
		borderBottom: '1px solid',
		color: 'black',
		borderColor: 'grey',
		cursor: 'pointer',
		padding: '0.2rem 0.5rem'
	},
	activeButton: {
		color: fr.colors.decisions.background.flat.blueFrance.default,
		borderTopColor: fr.colors.decisions.background.flat.blueFrance.default,
		borderBottomColor: fr.colors.decisions.background.flat.blueFrance.default,
		borderTop: '3px solid',
		borderLeft: '1px solid',
		borderRight: '1px solid',
		borderRadius: '0.25rem'
	},
	inactiveTableBtn: {
		borderRight: '1px solid',
		borderTopRightRadius: '0.25rem',
		borderBottomRightRadius: '0.25rem',
		borderColor: 'lightgray'
	},
	inactiveChartBtn: {
		borderLeft: '1px solid',
		borderTopLeftRadius: '0.25rem',
		borderBottomLeftRadius: '0.25rem',
		borderColor: 'lightgray'
	}
}));

export default ChartWrapper;
