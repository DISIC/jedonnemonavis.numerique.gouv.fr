import React, { useState } from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import { Skeleton } from '@mui/material';
import { tss } from 'tss-react/dsfr';

type DataItem = {
	value: number;
	name: string;
};

type Props = {
	children: React.ReactNode;
	title: string;
	total?: number;
	data: DataItem[];
	labelX?: string;
};

const GlobalChart = ({ children, title, total, data, labelX }: Props) => {
	const totalFormatted = total
		?.toString()
		.replace(/(?<=[0-9])(?=(?:[0-9]{3})+(?![0-9]))/g, ' ');
	const [view, setView] = useState<'chart' | 'table'>('chart');
	const { classes, cx } = useStyles({ view });

	const hasSpecificData = data.some(
		d =>
			(d.name === 'incomprehensible' && d.value === 0) ||
			(d.name === 'très clair' && d.value === 0)
	);

	const filteredData = hasSpecificData
		? data.filter(
				d =>
					!(d.name === 'incomprehensible' && d.value === 0) &&
					!(d.name === 'très clair' && d.value === 0)
			)
		: data;

	const tableContent = () => (
		<div className={classes.tableContainer}>
			<table className={cx(classes.table)}>
				<thead>
					<tr>
						<th></th>
						{filteredData?.map(d => (
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
						))}
					</tr>
				</thead>
				<tbody>
					<tr>
						<td className={cx(classes.categoryLabel)}>{labelX}</td>
						{filteredData.map(d => (
							<td key={d.name}>{d.value}</td>
						))}
					</tr>
				</tbody>
			</table>
		</div>
	);

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
						onClick={() => {
							setView('table');
							console.log('DATA: ', data);
						}}
					>
						Tableau
					</button>
				</div>
			</div>
			<div className={classes.container}>
				{view === 'chart' ? children : tableContent()}
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
			background: '#F6F6F6'
		},
		'td, th': {
			padding: '1.25rem 0'
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
