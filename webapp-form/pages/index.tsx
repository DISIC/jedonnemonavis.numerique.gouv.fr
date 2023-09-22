import { FormFirstBlock } from '@/components/form/layouts/FormFirstBlock';
import { FormSecondBlock } from '@/components/form/layouts/FormSecondBlock';
import { Opinion, Product } from '@/utils/types';
import { fr } from '@codegouvfr/react-dsfr';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

export default function JDMAForm() {
	const { classes, cx } = useStyles();
	const router = useRouter();

	const product: Product = {
		title: '1000J BLUES - AUTO DEPISTAGE DE LA DEPRESSION POST PARTUM'
	};

	const onToggleLanguageClick = (newLocale: string) => {
		const { pathname, asPath, query } = router;
		router.push({ pathname, query }, asPath, { locale: newLocale });
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
							<button
								onClick={() => {
									onToggleLanguageClick('fr');
								}}
							>
								fr
							</button>
							<button
								onClick={() => {
									onToggleLanguageClick('en');
								}}
							>
								en
							</button>
							{opinion.satisfaction ? (
								<FormSecondBlock
									opinion={opinion}
									onSubmit={result => setOpinion({ ...result })}
								/>
							) : (
								<FormFirstBlock
									opinion={opinion}
									product={product}
									onSubmit={tmpOpinion => {
										setOpinion({ ...tmpOpinion });
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

export async function getStaticProps({ locale }: { locale: any }) {
	return {
		props: {
			...(await serverSideTranslations(locale ?? 'fr', ['common']))
		}
	};
}
