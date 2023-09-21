import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';

export default function JDMAForm() {
	const { classes, cx } = useStyles();

	const product = {
		title: '1000J BLUES - AUTO DEPISTAGE DE LA DEPRESSION POST PARTUM'
	};

	return (
		<div>
			<div className={classes.blueSection}></div>
			<div className={fr.cx('fr-container')}>
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
					<div className={fr.cx('fr-col-8')}>
						<div className={cx(classes.formSection)}>
							<h1>Je donne mon avis</h1>
							<h2 className={fr.cx('fr-mt-14v')}>
								Démarche :{' '}
								<span className={classes.productTitle}>{product.title}</span>
							</h2>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

const blueSectionPxHeight = 200;
const useStyles = tss
	.withName(JDMAForm.name)
	.withParams()
	.create(() => ({
		blueSection: {
			height: `${blueSectionPxHeight}px`,
			backgroundColor: fr.colors.decisions.background.alt.blueFrance.default
		},
		formSection: {
			backgroundColor: fr.colors.decisions.background.default.grey.default,
			transform: `translateY(-${blueSectionPxHeight / 2}px)`,
			...fr.spacing('padding', { topBottom: '8v', rightLeft: '16v' }),
			h1: {
				textAlign: 'center',
				color: fr.colors.decisions.background.flat.blueFrance.default,
				...fr.spacing('margin', { bottom: '8v' })
			}
		},
		productTitle: {
			fontWeight: 400
		}
	}));
