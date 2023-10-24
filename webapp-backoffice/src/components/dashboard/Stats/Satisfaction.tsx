import ProductLayout from '@/src/layouts/Product/ProductLayout';
import dynamic from 'next/dynamic';
import { tss } from 'tss-react/dsfr';

const BarChart = dynamic(() => import('@/src/components/chart/BarChart'), {
	ssr: false
});

const SatisfactionStats = () => {
	const { classes } = useStyles();

	const data = [
		{
			name: 'happy',
			value: 65,
			color: '#18753C'
		},
		{
			name: 'neutral',
			value: 20,
			color: '#716043'
		},
		{
			name: 'bad',
			value: 15,
			color: '#CE0500'
		}
	];

	return (
		<div className={classes.wrapperGlobal}>
			<h3>Satisfaction usagers ⓘ</h3>
			<div className={classes.mainSection}>
				<BarChart kind="pie" data={data} />
			</div>
		</div>
	);
};

const useStyles = tss.create({
	wrapperGlobal: {
		display: 'flex',
		flexDirection: 'column',
		gap: '2rem',
		padding: '2rem',
		border: '1px solid #E5E5E5'
	},
	mainSection: {
		display: 'flex',
		gap: '3rem'
	}
});

export default SatisfactionStats;
