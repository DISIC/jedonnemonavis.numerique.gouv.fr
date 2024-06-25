import { formatNumberWithSpaces, groupDataByName } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import React, { useState } from 'react';
import { tss } from 'tss-react/dsfr';

export interface DataItem {
	name: string;
	value: number;
	'Pourcentage de réponses'?: number;
	'Total des réponses'?: number;
	type?: string;
}

interface FormattedData {
	name: string;
	data: { name: string; value: number }[];
}

type Props = {
	children: React.ReactNode;
	title: string;
	total?: number;
	data?: DataItem[];
	intervalData?: FormattedData[];
	singleRowLabel?: string;
	tableHeaders?: string[];
};

const GlobalChart = ({
	children,
	title,
	total,
	data,
	intervalData,
	singleRowLabel,
	tableHeaders
}: Props) => {
	const totalFormatted = total ? formatNumberWithSpaces(total) : '';
	const [view, setView] = useState<'chart' | 'table'>('chart');
	const { classes, cx } = useStyles({ view });

	const hasSpecificData = data?.some(
		d =>
			(d.name === 'pas clair du tout' && d.value === 0) ||
			(d.name === 'très clair' && d.value === 0)
	);

	const filteredData = hasSpecificData
		? data?.filter(
				d =>
					!(d.name === 'pas clair du tout' && d.value === 0) &&
					!(d.name === 'très clair' && d.value === 0)
			)
		: data;

	const getCellData = (data: DataItem[], header: string, index: number) => {
		const matchingItem = data.find(
			item => item.type === header || header === 'Nombre de réponses'
		);
		if (header === 'Nombre de réponses') {
			const valueItem = data.find(item => item.value !== undefined);
			return <td key={index}>{valueItem ? valueItem.value : 0}</td>;
		} else if (header === 'Pourcentage de réponses') {
			const percentageItem = data.find(
				item => item['Pourcentage de réponses'] !== undefined
			);
			return (
				<td key={index}>
					{percentageItem ? percentageItem['Pourcentage de réponses'] : 0}%
				</td>
			);
		} else if (header === 'Total des réponses') {
			const totalItem = data.find(
				item => item['Total des réponses'] !== undefined
			);
			return (
				<td key={index}>{totalItem ? totalItem['Total des réponses'] : 0}</td>
			);
		} else {
			return (
				<td key={index}>
					{matchingItem ? matchingItem.value : 0}{' '}
					{matchingItem?.['Pourcentage de réponses']
						? `(${matchingItem?.['Pourcentage de réponses']}%)`
						: ''}
				</td>
			);
		}
	};

	const displayTable = () => {
		if (filteredData) {
			const groupedData = groupDataByName(filteredData);

			return (
				<div className={classes.tableContainer}>
					<table className={cx(classes.table)}>
						<thead>
							<tr>
								<th></th>
								{singleRowLabel && !tableHeaders?.length ? (
									filteredData.map(d => (
										<th key={d.name}>
											{hasSpecificData ? (
												<>
													{d.name}
													{d.name === '1' && (
														<div className={cx(classes.customValue)}>
															<span>pas clair du tout</span>
														</div>
													)}
													{d.name === '5' && (
														<div className={cx(classes.customValue)}>
															<span>très clair</span>
														</div>
													)}
												</>
											) : (
												<> {d.name}</>
											)}
										</th>
									))
								) : (
									<>
										{tableHeaders?.map((label, index) => (
											<th key={index}>{label}</th>
										))}
									</>
								)}
							</tr>
						</thead>
						<tbody>
							{singleRowLabel ? (
								<tr>
									<td className={cx(classes.categoryLabel)}>
										{singleRowLabel}
									</td>
									{filteredData?.map(d => <td key={d.name}>{d.value}</td>)}
								</tr>
							) : (
								<>
									{Object.keys(groupedData).map(name => (
										<tr key={name}>
											<td>{name}</td>
											{tableHeaders?.map((header, index) => {
												return getCellData(groupedData[name], header, index);
											})}
										</tr>
									))}
								</>
							)}
						</tbody>
					</table>
				</div>
			);
		}

		if (intervalData?.length) {
			const allCategoryNames = Array.from(
				new Set(
					intervalData.flatMap(interval => interval.data.map(data => data.name))
				)
			);

			return (
				<div className={classes.tableContainer}>
					<table className={cx(classes.table)}>
						<thead>
							<tr>
								<th></th>
								{tableHeaders?.map(d => <th key={d}> {d}</th>)}
							</tr>
						</thead>
						<tbody>
							{singleRowLabel ? (
								<tr>
									<td className={cx(classes.categoryLabel)}>
										{singleRowLabel}
									</td>
									{intervalData.map((interval, intervalIndex) => (
										<React.Fragment key={intervalIndex}>
											{interval.data.map((data, dataIndex) => (
												<td key={dataIndex}>{data.value}</td>
											))}
										</React.Fragment>
									))}
								</tr>
							) : (
								<>
									{allCategoryNames.map((categoryName, categoryIndex) => (
										<tr key={categoryIndex}>
											<td className={cx(classes.categoryLabel)}>
												{categoryName}
											</td>
											{intervalData.map((interval, intervalIndex) => {
												const categoryData = interval.data.find(
													data => data.name === categoryName
												);
												return (
													<td key={intervalIndex}>
														{categoryData ? categoryData.value : 0}
													</td>
												);
											})}
										</tr>
									))}
								</>
							)}
						</tbody>
					</table>
				</div>
			);
		}
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

const useStyles = tss.withName(GlobalChart.name).create(() => ({
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
			minWidth: '120px'
		},
		thead: {
			background: '#EEEEEE',
			tr: {
				borderBottom: '2px solid black'
			}
		},
		tbody: {
			tr: {
				':nth-child(even)': {
					backgroundColor: '#EEEEEE'
				},
				':nth-child(odd)': {
					backgroundColor: '#F6F6F6'
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
		borderColor: fr.colors.decisions.background.flat.blueFrance.default,
		borderLeft: '1px solid',
		borderRight: '1px solid',
		borderRadius: '0.25rem'
	},
	inactiveTableBtn: {
		borderRight: '1px solid',
		borderTopRightRadius: '0.25rem',
		borderBottomRightRadius: '0.25rem',
		borderColor: 'grey'
	},
	inactiveChartBtn: {
		borderLeft: '1px solid',
		borderTopLeftRadius: '0.25rem',
		borderBottomLeftRadius: '0.25rem',
		borderColor: 'grey'
	}
}));

export default GlobalChart;
