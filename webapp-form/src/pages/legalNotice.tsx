import { fr } from '@codegouvfr/react-dsfr';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { LegalNotice as LN } from '../utils/content';

const LegalNotice = () => {
	const { cx, classes } = useStyles();
	const { t } = useTranslation('common');

	return (
		<>
			<Head>
				<title>{t('pages.legal_notice.meta_title')}</title>
				<meta name="description" content={t('pages.legal_notice.meta_title')} />
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
						<h1 className={fr.cx('fr-mb-12v')}>{t('pages.legal_notice.h1')}</h1>
						{Object.keys(LN).map(key => (
							<div key={key} className={cx(classes.blockWrapper)}>
								{!LN[key].hideTitle && <h2>{t(LN[key].titleKey)}</h2>}{' '}
								{LN[key].content.map((line, index) => {
									const text = t(line.key);
									return (
										<React.Fragment key={index}>
											{line.type === 'link' ? (
												<p>
													<a
														href={line.href}
														target="_blank"
														rel="noopener noreferrer"
													>
														{text}
													</a>
												</p>
											) : line.type === 'mailto' ? (
												<p>
													<a href={line.href}>{text}</a>
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
						))}
					</div>
				</div>
			</div>
		</>
	);
};

const useStyles = tss.withName({ LegalNotice }).create(() => ({
	blockWrapper: {
		display: 'flex',
		flexDirection: 'column',
		marginBottom: '1rem',

		a: {
			width: 'fit-content'
		}
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

export default LegalNotice;
