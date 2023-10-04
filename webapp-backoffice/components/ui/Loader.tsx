import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';

export const Loader = () => {
	const { cx, classes } = useStyles();

	return (
		<div className={classes.loaderContainer}>
			<div>
				<i className={fr.cx('ri-loader-4-line')} />
			</div>
		</div>
	);
};

const useStyles = tss.withName(Loader.name).create({
	loaderContainer: {
		display: 'flex',
		justifyContent: 'center',
		i: {
			display: 'inline-block',
			animation: 'spin 1s linear infinite;',
			color: fr.colors.decisions.background.actionHigh.blueFrance.default,
			['&::before']: {
				'--icon-size': '3rem'
			}
		}
	}
});
