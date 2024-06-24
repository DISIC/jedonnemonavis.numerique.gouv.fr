import React, { useState } from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import { Skeleton } from '@mui/material';
import { tss } from 'tss-react/dsfr';

interface DataItem {
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
	const totalFormatted = total
		?.toString()
		.replace(/(?<=[0-9])(?=(?:[0-9]{3})+(?![0-9]))/g, ' ');
	const [view, setView] = useState<'chart' | 'table'>('chart');
	const { classes, cx } = useStyles({ view });

	const hasSpecificData = data?.some(
		d =>
			(d.name === 'incomprehensible' && d.value === 0) ||
			(d.name === 'très clair' && d.value === 0)
	);

	const filteredData = hasSpecificData
		? data?.filter(
				d =>
					!(d.name === 'incomprehensible' && d.value === 0) &&
					!(d.name === 'très clair' && d.value === 0)
			)
		: data;

	const table = () => {
		if (filteredData) {
			const groupDataByName = (
				data: DataItem[]
			): { [name: string]: DataItem[] } => {
				let groupedData: { [name: string]: DataItem[] } = {};
				data.forEach(d => {
					if (!groupedData[d.name]) {
						groupedData[d.name] = [];
					}
					groupedData[d.name].push(d);
				});
				return groupedData;
			};

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
															<span>incomprehensible</span>
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
												const matchingItem = groupedData[name].find(
													item =>
														item.type === header ||
														header === 'Nombre de réponses'
												);
												if (header === 'Nombre de réponses') {
													const valueItem = groupedData[name].find(
														item => item.value !== undefined
													);
													return (
														<td key={index}>
															{valueItem ? valueItem.value : 0}
														</td>
													);
												} else if (header === 'Pourcentage de réponses') {
													const percentageItem = groupedData[name].find(
														item =>
															item['Pourcentage de réponses'] !== undefined
													);
													return (
														<td key={index}>
															{percentageItem
																? percentageItem['Pourcentage de réponses']
																: 0}
															%
														</td>
													);
												} else if (header === 'Total des réponses') {
													const totalItem = groupedData[name].find(
														item => item['Total des réponses'] !== undefined
													);
													return (
														<td key={index}>
															{totalItem ? totalItem['Total des réponses'] : 0}
														</td>
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
					<h4 className={fr.cx('fr-mb-0')}>{title}</h4>
					{totalFormatted && <span>{totalFormatted} réponses</span>}
				</div>
				<div className={classes.flexAlignCenter}>
					<button
						className={cx(
							classes.button,
							view === 'chart' && classes.activeButton
						)}
						onClick={() => setView('chart')}
					>
						Graphique
					</button>
					<button
						className={cx(
							classes.button,
							view === 'table' && classes.activeButton
						)}
						onClick={() => setView('table')}
					>
						Tableau
					</button>
				</div>
			</div>
			<div className={classes.container}>
				{view === 'chart' ? children : table()}
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
		border: '1px solid',
		borderRadius: '0.25rem',
		color: 'grey',
		borderColor: 'grey',
		cursor: 'pointer',
		padding: '0.2rem 0.5rem'
	},
	activeButton: {
		color: fr.colors.decisions.background.flat.blueFrance.default,
		borderColor: fr.colors.decisions.background.flat.blueFrance.default
	}
}));

export default GlobalChart;
