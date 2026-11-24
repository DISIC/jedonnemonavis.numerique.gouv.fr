import { fr } from '@codegouvfr/react-dsfr';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { Accessibility as A11E } from '../utils/content';

const Accessibility = () => {
	const { cx, classes } = useStyles();
	const { t } = useTranslation('common');

	return (
		<>
			<Head>
				<title>{t('pages.accessibility.meta_title')}</title>
				<meta
					name="description"
					content={t('pages.accessibility.meta_title')}
				/>
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
						<h1 className={fr.cx('fr-mb-12v')}>
							{t('pages.accessibility.h1')}
						</h1>
						{Object.keys(A11E).map(key => (
							<div key={key} className={cx(classes.blockWrapper)}>
								{!A11E[key].hideTitle && (
									<h2 className={fr.cx('fr-mt-8v')}>{t(A11E[key].titleKey)}</h2>
								)}
								<div>
									{A11E[key].content.map((line, index) => {
										const text = t(line.key);
										return (
											<React.Fragment key={index}>
												{line.type === 'link' ? (
													<span>
														<a
															href={line.href}
															target="_blank"
															rel="noopener noreferrer"
														>
															{text}
														</a>
													</span>
												) : line.type === 'mailto' ? (
													<a href={line.href}>{text}</a>
												) : line.type === 'list' ? (
													<ul>
														<li>{text}</li>
													</ul>
												) : line.type === 'bold' ? (
													<span className={fr.cx('fr-text--bold')}>{text}</span>
												) : (
													<span>{text}</span>
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

const useStyles = tss.withName({ Accessibility }).create(() => ({
	blockWrapper: {
		display: 'inline-block',
		flexDirection: 'column',
		marginBottom: '2rem',

		a: {
			width: 'fit-content'
		}
	},
	noSpacesParagraph: {
		marginBottom: '0 !important'
	},
	inLine: {
		display: 'inline-flex'
	}
}));

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'fr', ['common']))
	}
});

export default Accessibility;
