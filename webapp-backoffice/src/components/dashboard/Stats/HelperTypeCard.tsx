import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';

type Props = {
	review: string;
	title: string;
	icon: string;
};

const HelperTypeCard = ({ review, title, icon }: Props) => {
	const { classes, cx } = useStyles();

	return (
		<div className={cx(classes.helperCardWrapper)}>
			<span className={cx(classes.blueText, icon)} aria-hidden="true"></span>
			<h6 className={cx(classes.title)}>{title}</h6>
			<h1 className={cx(classes.review)}>{review}</h1>
		</div>
	);
};

const useStyles = tss
	.withName(HelperTypeCard.name)
	.withParams<{}>()
	.create(() => ({
		helperCardWrapper: {
			background: 'white',
			border: '1px solid lightgray',
			padding: '1rem',
			width: '100%',
			[fr.breakpoints.up('md')]: {
				flex: '1 1 0'
			},
			display: 'flex',
			alignItems: 'center',
			flexDirection: 'column',
			justifyContent: 'center',
			borderRadius: '4px',
			boxSizing: 'border-box'
		},
		title: {
			...fr.typography[19].style,
			textAlign: 'center',
			color: fr.colors.decisions.text.title.grey.default,
			margin: 0,
			padding: '1rem 0'
		},
		blueText: {
			color: fr.colors.decisions.text.title.blueFrance.default
		},
		review: {
			margin: 0,
			textAlign: 'center',
			fontWeight: 600
		}
	}));

export default HelperTypeCard;
