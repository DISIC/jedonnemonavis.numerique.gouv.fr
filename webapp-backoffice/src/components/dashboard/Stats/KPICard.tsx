import { fr } from '@codegouvfr/react-dsfr';
import Link from 'next/link';
import { tss } from 'tss-react/dsfr';

type Props = {
	mainNumber: number;
	title: string;
	description?: string;
	link?: string;
	linkName?: string;
	isRow?: boolean;
};

const KPICard = ({
	mainNumber,
	title,
	description,
	link,
	linkName,
	isRow
}: Props) => {
	const { classes, cx } = useStyles({ link, isRow });
	const parseMainNumber = () => {
		return mainNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	};

	return (
		<div className={cx(classes.kpiCardWrapper)}>
			<h2 className={cx(classes.mainNumberText)}>{parseMainNumber()}</h2>
			<h6 className={cx(classes.title, link ? cx(classes.blueText) : '')}>
				{title}
			</h6>
			<div className={cx(classes.description)}>
				{description && <p>{description}</p>}
			</div>
			{link && linkName && (
				<Link href={link} className={cx(classes.blueText, classes.linkLabel)}>
					{linkName}{' '}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="1.2em"
						height="1.2em"
						viewBox="0 0 28 28"
					>
						<path
							fill="currentColor"
							d="M15.705 4.289a1 1 0 1 0-1.406 1.422L21.675 13H4a1 1 0 1 0 0 2h17.673l-7.374 7.286a1 1 0 0 0 1.406 1.423l8.927-8.821a1.25 1.25 0 0 0 0-1.778z"
						/>
					</svg>
				</Link>
			)}
		</div>
	);
};

const useStyles = tss
	.withName(KPICard.name)
	.withParams<{ link: string | undefined; isRow: boolean | undefined }>()
	.create(({ link, isRow }) => ({
		kpiCardWrapper: {
			background: 'white',
			border: '1px solid lightgray',
			padding: '2rem 1.5rem',
			width: '100%',
			[fr.breakpoints.up('md')]: {
				width: isRow ? '100%' : '33%'
			},
			display: 'flex',
			alignItems: 'center',
			justifyContent: isRow ? 'center' : 'initial',
			flexDirection: isRow ? 'row' : 'column',
			gap: isRow ? '3rem' : 0,
			borderBottom: `5px solid ${link ? fr.colors.decisions.text.title.blueFrance.default : '#3A3A3A'}`
		},
		mainNumberText: {
			textAlign: 'center',
			marginBottom: isRow ? 0 : '1.5rem'
		},
		title: {
			...fr.typography[19].style,
			marginBottom: isRow ? 0 : '0.25rem',
			textAlign: 'center'
		},
		blueText: {
			color: fr.colors.decisions.text.title.blueFrance.default
		},
		linkLabel: {
			display: 'flex',
			alignItems: 'center',
			gap: '0.5rem',
			...fr.typography[18].style,
			margin: 0,
			background: 'none',
			fontWeight: 500,
			['&:hover']: {
				textDecoration: 'underline'
			}
		},
		description: {
			minHeight: isRow ? 'auto' : 50,
			textAlign: 'center',
			p: {
				marginBottom: isRow ? 0 : '1.5rem'
			}
		}
	}));

export default KPICard;
