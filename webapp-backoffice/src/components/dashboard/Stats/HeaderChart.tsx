import { fr } from '@codegouvfr/react-dsfr';
import { Skeleton } from '@mui/material';
import { tss } from 'tss-react/dsfr';

type Props = {
	children: React.ReactNode;
	title: string;
	total?: number;
};

const HeaderChart = ({ children, title, total }: Props) => {
	const { classes, cx } = useStyles();

	return (
		<div className={cx(classes.container, fr.cx('fr-mt-10v'))}>
			<div className={classes.header}>
				<div className={classes.container}>
					<h4 className={fr.cx('fr-mb-0')}>{title}</h4>
					{total && <span>{total} réponses</span>}
				</div>
				{/* <div className={classes.flexAlignCenter}>
					<button className={cx(classes.button, 'button-chart')}>
						Graphique
					</button>
					<button className={cx(classes.button, 'button-table')}>
						Tableau
					</button>
				</div> */}
			</div>
			<div className={classes.container}>{children}</div>
		</div>
	);
};

const useStyles = tss.withName(HeaderChart.name).create({
	container: {
		display: 'flex',
		flexDirection: 'column',
		gap: '0.25rem'
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
		color: fr.colors.decisions.background.flat.blueFrance.default,
		borderColor: fr.colors.decisions.background.flat.blueFrance.default
	}
});

export default HeaderChart;
