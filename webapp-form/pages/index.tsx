import { FormFirstBlock } from '@/components/form/layouts/FormFirstBlock';
import { FormSecondBlock } from '@/components/form/layouts/FormSecondBlock';
import { Opinion, Product } from '@/utils/types';
import { fr } from '@codegouvfr/react-dsfr';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';

export default function JDMAForm() {
	const { classes, cx } = useStyles();

	const product: Product = {
		title: '1000J BLUES - AUTO DEPISTAGE DE LA DEPRESSION POST PARTUM'
	};

	const [opinion, setOpinion] = useState<Opinion>({
		satisfaction: undefined,
		comprehension: undefined,
		easy: undefined,
		difficulties: [],
		difficulties_verbatim: undefined,
		help: [],
		help_verbatim: undefined,
		verbatim: undefined
	});

	return (
		<div>
			<div className={classes.blueSection}></div>
			<div className={fr.cx('fr-container')}>
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
					<div className={fr.cx('fr-col-8')}>
						<div className={cx(classes.formSection)}>
							{opinion.satisfaction ? (
								<FormSecondBlock
									opinion={opinion}
									onSubmit={result => setOpinion({ ...result })}
								/>
							) : (
								<FormFirstBlock
									product={product}
									onSubmit={satisfaction => {
										setOpinion({ ...opinion, satisfaction });
									}}
								/>
							)}
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
		}
	}));
