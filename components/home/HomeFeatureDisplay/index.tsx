import { fr } from '@codegouvfr/react-dsfr';
import Image from 'next/image';
import { ReactElement, ReactNode } from 'react';
import { tss } from 'tss-react';

interface HFDProps {
	icon: ReactElement<any, any>;
	title: string;
	description: string;
	image: string;
	imagePosition?: string;
}

const HomeFeatureDisplay = (props: HFDProps) => {
	const { classes, cx } = useStyles({
		imagePosition: props.imagePosition as string
	});

	return (
		<div className={cx(classes.outerContainer)}>
			<div className={cx(classes.blueBlock)} />
			<section className={cx(classes.container, fr.cx('fr-container'))}>
				<div
					className={fr.cx(
						'fr-grid-row',
						'fr-grid-row--gutters',
						'fr-grid-row--center'
					)}
				>
					{props.imagePosition === 'left' && (
						<div
							className={cx(
								fr.cx('fr-col-12', 'fr-col-md-6'),
								classes.imageContainer
							)}
						>
							<Image src={props.image} alt="" width={448} height={316} />
						</div>
					)}
					<div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
						<div className={cx(classes.textContainer)}>
							<div className={cx(classes.iconContainer)}>{props.icon}</div>
							<h2>{props.title}</h2>
							<p>{props.description}</p>
						</div>
					</div>
					{props.imagePosition === 'right' && (
						<div
							className={cx(
								fr.cx('fr-col-12', 'fr-col-md-6'),
								classes.imageContainer
							)}
						>
							<Image src={props.image} alt="" width={448} height={316} />
						</div>
					)}
				</div>
			</section>
		</div>
	);
};

const useStyles = tss
	.withName(HomeFeatureDisplay.name)
	.withParams<{ imagePosition: string }>()
	.create(({ imagePosition }) => ({
		outerContainer: {
			position: 'relative'
		},
		container: {
			marginTop: '4rem',
			marginBottom: '4rem',
			paddingTop: '4rem',
			paddingBottom: '4rem',
			h2: {
				color: fr.colors.decisions.text.title.blueFrance.default
			},
			i: {
				color: fr.colors.decisions.text.title.blueFrance.default
			}
		},
		blueBlock: {
			backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
			width: '70%',
			height: '100%',
			zIndex: -1,
			position: 'absolute',
			left: imagePosition === 'left' ? '30%' : '0'
		},
		imageContainer: {
			[fr.breakpoints.down('md')]: {
				display: 'none'
			}
		},
		textContainer: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center'
		},
		iconContainer: {
			marginBottom: '1.5rem',
			width: '3rem',
			height: '3rem',
			borderRadius: '50%',
			backgroundColor: '#FFF',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center'
		}
	}));

export default HomeFeatureDisplay;
