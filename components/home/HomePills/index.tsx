import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';

interface HomePillsProps {
	pills: Pill[];
}

export interface Pill {
	title: string;
	description: string;
}

const HomePills = (props: HomePillsProps) => {
	const { cx, classes } = useStyles();

	return (
		<section className={fr.cx('fr-container')}>
			<div
				className={fr.cx(
					'fr-grid-row',
					'fr-grid-row--gutters',
					'fr-grid-row--center',
					'fr-py-12w',
					'fr-px-10v'
				)}
			>
				{props.pills.map((pill, index) => (
					<div
						key={index}
						className={cx(fr.cx('fr-col', 'fr-col-12', 'fr-col-md-4'))}
					>
						<div className={cx(classes.badge)}>
							<h2 className={cx(classes.title)}>{pill.title}</h2>
							<div className={cx(classes.badgeIcon)}>
								<i className="ri-check-line"></i>
							</div>
						</div>
						<div className={cx(classes.paragraph)}>
							<p>{pill.description}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
};

const useStyles = tss
	.withName(HomePills.name)
	.withParams()
	.create(() => ({
		badge: {
			...fr.spacing('margin', {
				rightLeft: '5w'
			}),
			position: 'relative',
			...fr.spacing('padding', {
				rightLeft: '3w'
			})
		},
		title: {
			color: fr.colors.decisions.text.title.blueFrance.default,
			textAlign: 'center',
			backgroundColor: fr.colors.decisions.background.alt.blueEcume.default,
			...fr.spacing('padding', {
				topBottom: '1v'
			}),
			borderRadius: fr.spacing('3w')
		},
		badgeIcon: {
			position: 'absolute',
			top: '0',
			right: '0',
			transform: 'translate(-50%, -50%)',
			color: fr.colors.decisions.background.default.grey.default,
			backgroundColor:
				fr.colors.decisions.background.actionHigh.success.default,
			borderRadius: '50%',
			...fr.spacing('padding', {
				topBottom: '1v',
				rightLeft: '1v'
			})
		},
		paragraph: {
			...fr.spacing('padding', {
				rightLeft: '4w'
			}),
			textAlign: 'center',
			fontWeight: fr.typography[0].style.fontWeight
		}
	}));

export default HomePills;
