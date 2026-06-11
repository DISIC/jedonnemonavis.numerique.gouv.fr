import { fr } from '@codegouvfr/react-dsfr';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { TermsOfUse as TOU } from '../utils/content';

const TermsOfUse = () => {
	const { cx, classes } = useStyles();
	const { t } = useTranslation('common');

	return (
		<>
			<Head>
				<title>{t('pages.terms_of_use.meta_title')}</title>
				<meta name="description" content={t('pages.terms_of_use.meta_title')} />
			</Head>
			<div
				className={fr.cx(
					'fr-container',
					'fr-col-lg-10',
					'fr-col-xl-8',
					'fr-py-20v'
				)}
			>
				<div
					className={fr.cx(
						'fr-grid-row',
						'fr-grid-row--gutters',
						'fr-grid-row--middle'
					)}
				>
					<div className={'fr-col-lg-12'}>
						<h1 className={fr.cx('fr-mb-12v')}>{t('pages.terms_of_use.h1')}</h1>
						{Object.keys(TOU).map(key => (
							<div key={key} className={cx(classes.blockWrapper)}>
								{!TOU[key].hideTitle && <h2>{t(TOU[key].titleKey)}</h2>}
								<div className={'fr-col-lg-10'}>
									{TOU[key].content.map((line, index) => {
										const text = t(line.key);
										return (
											<React.Fragment key={index}>
												{line.type === 'subtitle' ? (
													<h3 className={classes.subtitle}>{text}</h3>
												) : line.type === 'link' ? (
													<p>
														<a
															href={line.href}
															target="_blank"
															rel="noopener noreferrer"
														>
															{text}
														</a>
													</p>
												) : line.type === 'list' ? (
													<ul>
														<li>{text}</li>
													</ul>
												) : (
													<p
														className={cx(
															line.type === 'noSpaces'
																? classes.noSpacesParagraph
																: ''
														)}
													>
														{text}
													</p>
												)}
											</React.Fragment>
										);
									})}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
};

const useStyles = tss.withName({ TermsOfUse }).create(() => ({
	blockWrapper: {
		display: 'flex',
		flexDirection: 'column',
		marginBottom: '1rem',

		a: {
			width: 'fit-content'
		},
		ul: {
			margin: '2rem 0 2rem 2rem'
		}
	},
	subtitle: {
		...fr.typography[3].style
	},
	noSpacesParagraph: {
		marginBottom: '0 !important'
	}
}));

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'fr', ['common']))
	}
});

export default TermsOfUse;
