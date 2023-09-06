import { fr } from '@codegouvfr/react-dsfr';
import Image from 'next/image';
import React, { ReactElement, ReactNode } from 'react';
import { tss } from 'tss-react';

interface HFDProps {
	icon: ReactElement<any, any>;
	title: string;
	description: string;
	image: string;
	imagePosition: 'left' | 'right';
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
					className={cx(
						fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-grid-row--center'),
						classes.grid
					)}
				>
					<div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
						<div className={cx(classes.textContainer)}>
							<div className={cx(classes.iconContainer)}>{props.icon}</div>
							<h2>{props.title}</h2>
							<p>{props.description}</p>
						</div>
					</div>
					<div
						className={cx(
							fr.cx('fr-col-12', 'fr-col-md-6'),
							classes.imageContainer
						)}
					>
						<Image src={props.image} alt="" width={448} height={316} />
					</div>
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
			...fr.spacing('margin', {
				topBottom: '16v'
			}),
			...fr.spacing('padding', {
				topBottom: '16v'
			}),
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
			left: imagePosition === 'left' ? '30%' : '0',
			[fr.breakpoints.down('md')]: {
				left: imagePosition === 'left' ? 100 : '0'
			}
		},
		grid: {
			flexDirection: imagePosition === 'left' ? 'row-reverse' : 'initial'
		},
		imageContainer: {
			display: 'flex',
			justifyContent: imagePosition === 'left' ? 'flex-start' : 'flex-end',
			[fr.breakpoints.down('md')]: {
				justifyContent: 'center',
				flexDirection: 'column'
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
