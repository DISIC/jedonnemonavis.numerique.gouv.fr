import { fr } from '@codegouvfr/react-dsfr';
import Head from 'next/head';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { CGU } from '../../utils/content';

const GeneralConditions = () => {
	const { cx, classes } = useStyles();

	return (
		<>
			<Head>
				<title>Politique de confidentialité | Je donne mon avis</title>
				<meta
					name="description"
					content={`Politique de confidentialité | Je donne mon avis`}
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
							Politique de confidentialité du formulaire de dépôt d’avis Je
							donne mon avis
						</h1>
						{Object.keys(CGU).map(key => (
							<div key={key} className={cx(classes.blockWrapper)}>
								<h2>{CGU[key].title}</h2>
								<div className={'fr-col-lg-10'}>
									{CGU[key].content.map((line, index) => {
										const isBreakAfter =
											typeof line === 'object' && line.type === 'breakAfter';
										const isBreakBefore =
											typeof line === 'object' && line.type === 'breakBefore';
										const isBreakBoth =
											typeof line === 'object' && line.type === 'breakBoth';
										const isLink =
											typeof line === 'object' && line.type === 'link';
										const isList =
											typeof line === 'object' && line.type === 'list';

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
														<br />
													</>
												) : isList ? (
													<ul>
														<li>{line.text}</li>
													</ul>
												) : typeof line === 'string' ? (
													<>
														{(isBreakBefore || isBreakBoth) && <br />}
														{line}
													</>
												) : (
													<>
														{(isBreakBefore || isBreakBoth) && <br />}
														{line.text}
													</>
												)}
												{(isBreakAfter || isBreakBoth) && <br />}
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

const useStyles = tss.withName(GeneralConditions.name).create(() => ({
	blockWrapper: {
		display: 'flex',
		flexDirection: 'column',
		marginBottom: '2rem',
		p: {
			marginBottom: '0 !important'
		},
		a: {
			width: 'fit-content'
		},
		ul: {
			margin: '2rem 0 2rem 2rem'
		}
	}
}));

export default GeneralConditions;
