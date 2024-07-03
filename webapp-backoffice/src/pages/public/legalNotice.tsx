import { fr } from '@codegouvfr/react-dsfr';
import Head from 'next/head';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { LegalNotice as LN } from '../../utils/content';

const LegalNotice = () => {
	const { cx, classes } = useStyles();

	return (
		<>
			<Head>
				<title>Mentions légales | Je donne mon avis</title>
				<meta
					name="description"
					content={`Mentions légales | Je donne mon avis`}
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
							Mentions légales du formulaire de dépôt d’avis Je donne mon avis
						</h1>
						{Object.keys(LN).map(key => (
							<div key={key} className={cx(classes.blockWrapper)}>
								<h2>{LN[key].title}</h2>
								{LN[key].content.map((line, index) => {
									const isBreakAfter =
										typeof line === 'object' && line.type === 'breakAfter';
									const isBreakBoth =
										typeof line === 'object' && line.type === 'breakBoth';
									const isLink =
										typeof line === 'object' && line.type === 'link';
									const isMailto =
										typeof line === 'object' && line.type === 'mailto';

									return (
										<React.Fragment key={index}>
											{isLink ? (
												<>
													<br />
													<a
														href={line.href}
														target="_blank"
														rel="noopener noreferrer"
													>
														{line.text}
													</a>
												</>
											) : isMailto ? (
												<a href={line.href}>{line.text}</a>
											) : typeof line === 'string' ? (
												line
											) : (
												line.text
											)}
											{isMailto ? null : <br />}
											{isBreakAfter ? <br /> : null}
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

const useStyles = tss.withName(LegalNotice.name).create(() => ({
	blockWrapper: {
		display: 'flex',
		flexDirection: 'column',
		marginBottom: '2rem',
		p: {
			marginBottom: '0 !important'
		},
		a: {
			width: 'fit-content'
		}
	}
}));

export default LegalNotice;
