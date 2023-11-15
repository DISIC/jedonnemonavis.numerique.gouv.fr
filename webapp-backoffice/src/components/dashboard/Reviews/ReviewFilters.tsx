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
					code:
						props.sort === 'created_at:desc'
							? 'created_at:asc'
							: 'created_at:desc'
				},

				{
					label: 'Satisfaction'
				},
				{
					label: 'Facilité'
				},
				{
					label: 'Langage'
				},
				{
					label: 'Verbatim'
				},
				{
					label: 'Source'
				}
			]);
		} else {
			setSortList([
				{
					label: 'Date',
					code:
						props.sort === 'created_at:desc'
							? 'created_at:asc'
							: 'created_at:desc'
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
		<div className={cx(classes.lineContainer)}>
			{sortList.map((sort, index) => (
				<div
					className={cx(classes.badge)}
					key={index}
					onClick={() => {
						if (sort.code) {
							onClick(sort.code);
						}
					}}
				>
					<span>
						{sort.label}{' '}
						{sort.code && (
							<i
								className={
									props.sort.includes('asc')
										? 'ri-arrow-drop-down-fill'
										: 'ri-arrow-drop-up-fill'
								}
							></i>
						)}
					</span>
				</div>
			))}
			<div className={cx(classes.badge)}></div>
		</div>
	);
};

const useStyles = tss.create({
	lineContainer: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'start',
		width: '100%',
		padding: 12,
		gap: 24
	},
	badge: {
		width: 'fit-content',
		minWidth: 100,
		paddingVertical: 4,
		fontSize: 14,
		cursor: 'pointer'
	}
});

export default ReviewFilters;
