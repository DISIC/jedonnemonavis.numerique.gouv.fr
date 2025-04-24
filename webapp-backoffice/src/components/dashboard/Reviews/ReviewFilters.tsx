import { fr } from '@codegouvfr/react-dsfr';
import React from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	onClick: (sort: string) => void;
	sort: string;
	displayMode: 'reviews' | 'verbatim';
}

const ReviewFilters = (props: Props) => {
	const { onClick, displayMode } = props;

	const { cx, classes } = useStyles({});

	const [sortList, setSortList] = React.useState<
		{
			label: string;
			code?: string;
		}[]
	>([]);

	React.useEffect(() => {
		if (displayMode === 'reviews') {
			setSortList([
				{
					label: 'Date',
					code: 'created_at'
				},
				{
					label: 'Heure'
				},
				{
					label: 'Id'
				},
				{
					label: 'Source'
				},

				{
					label: 'Satisfaction'
				},
				{
					label: 'Verbatim'
				}
			]);
		} else {
			setSortList([
				{
					label: 'Date'
				},

				{
					label: 'Satisfaction'
				},
				{
					label: 'Verbatim'
				}
			]);
		}
	}, [displayMode]);

	return (
		<thead className={cx(classes.lineContainer)}>
			<tr className={cx(classes.trContainer, fr.cx('fr-hidden', 'fr-unhidden-lg'))}>
				{sortList.map((sort, index) => (
					<th
						className={cx(
							displayMode === 'reviews' ? classes.badge : classes.badgeVerbatim,
							sort.code ? classes.pointer : '',
							fr.cx('fr-hidden', 'fr-unhidden-lg'),
							classes.thContainer
						)}
						key={index}
						onClick={() => {
							if (sort.code) {
								onClick(sort.code);
							}
						}}
					>
						<span>
							{sort.label}{' '}
							{props.sort.includes(sort.code || sort.label) && (
								<i
									className={
										props.sort.includes('asc')
											? 'ri-arrow-drop-down-fill'
											: 'ri-arrow-drop-up-fill'
									}
								></i>
							)}
						</span>
					</th>
				))}
				{new Array(displayMode === 'reviews' ? 1 : 3)
					.fill(0)
					.map((i, index) => (
						<div
							className={cx(
								displayMode === 'reviews'
									? classes.badge
									: classes.badgeVerbatim
							)}
							key={`fake_div_${index}`}
						></div>
					))}
			</tr>
		</thead>
	);
};

const useStyles = tss.create({
	lineContainer: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		padding: 12
	},
	trContainer: {
		width: '100%',
		display: 'flex'
	},
	thContainer: {
		width: 'max-content'
	},
	pointer: {
		cursor: 'pointer'
	},
	badge: {
		fontSize: 14,
		flex: '1 1 10%',
		[fr.breakpoints.down('lg')]: {
			flex: '50%',
			marginTop: 12
		},
		['&:nth-of-type(2), &:nth-of-type(3)']: {
			flex: '1 1 8%'
		},
		['&:nth-of-type(9)']: {
			flex: '1 1 14%'
		}
	},
	badgeVerbatim: {
		width: 'fit-content',
		minWidth: 120,
		paddingVertical: 4,
		fontSize: 14,
		flex: '0 0 calc(100% / 6);'
	}
});

export default ReviewFilters;
