import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';

const ReviewFilters = () => {
	const { cx, classes } = useStyles();

	const filterList = [
		'Date',
		'Satisfaction',
		'Facilité',
		'Langage',
		'Verbatim',
		'Source'
	];

	return (
		<div className={cx(classes.lineContainer)}>
			{filterList.map((filter, index) => (
				<div className={cx(classes.badge)} key={index}>
					<span>
						{filter} <i className={'ri-arrow-drop-down-fill'}></i>
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
