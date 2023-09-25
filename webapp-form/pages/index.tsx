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

	const { t } = useTranslation('common');

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
			<div className={classes.blueSection}>
				{opinion.satisfaction ? (
					<h1>
						{t('second_block.title')}
						<br />
						{t('second_block.subtitle')}
					</h1>
				) : (
					<h1>{t('first_block.title')}</h1>
				)}
			</div>
			<div className={fr.cx('fr-container--fluid', 'fr-container-md')}>
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
					<div className={fr.cx('fr-col-12', 'fr-col-lg-8')}>
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
			backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
			...fr.spacing('padding', { topBottom: '6v', rightLeft: '10v' }),
			h1: {
				textAlign: 'center',
				fontSize: '2.5rem',
				margin: 0,
				color: fr.colors.decisions.background.flat.blueFrance.default,
				[fr.breakpoints.up('md')]: {
					display: 'none'
				}
			},
			[fr.breakpoints.up('md')]: {
				height: `${blueSectionPxHeight}px`
			}
		},
		formSection: {
			backgroundColor: fr.colors.decisions.background.default.grey.default,
			...fr.spacing('padding', { topBottom: '4v', rightLeft: '4v' }),
			h1: {
				textAlign: 'center',
				color: fr.colors.decisions.background.flat.blueFrance.default,
				...fr.spacing('margin', { bottom: '8v' })
			},
			[fr.breakpoints.up('md')]: {
				transform: `translateY(-${blueSectionPxHeight / 2}px)`,
				...fr.spacing('padding', { topBottom: '8v', rightLeft: '16v' })
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
