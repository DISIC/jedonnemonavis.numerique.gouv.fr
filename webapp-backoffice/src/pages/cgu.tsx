import { fr } from '@codegouvfr/react-dsfr';
import Head from 'next/head';
import React from 'react';
import { CGU } from '../utils/content';

const GeneralConditions = () => {
	return (
		<>
			<Head>
				<title>Conditions générales d'utilisation | Je donne mon avis</title>
				<meta
					name="description"
					content={`Conditions générales d'utilisation | Je donne mon avis`}
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
						<h1 className={fr.cx('fr-mb-12v')}>{CGU.title}</h1>
						<h2>{CGU.firstPart.subtitle}</h2>
						<p>{CGU.firstPart.firstBlock}</p>
						<p>{CGU.firstPart.secondBlock}</p>
						<p>{CGU.firstPart.thirdBlock.firstBlock}</p>
						<ul>
							{CGU.firstPart.thirdBlock.secondBlock.map(el => (
								<li>{el}</li>
							))}
						</ul>
						<p>{CGU.firstPart.fourthBlock}</p>
						<p>{CGU.firstPart.fifthBlock.firstBlock}</p>
						<p>
							{CGU.firstPart.fifthBlock.firstBlock}{' '}
							<span>
								<a href={CGU.firstPart.fifthBlock.url1} target="blank">
									{CGU.firstPart.fifthBlock.url1}.
								</a>
							</span>{' '}
							{CGU.firstPart.fifthBlock.secondBlock}{' '}
							<span>
								{' '}
								<a href={CGU.firstPart.fifthBlock.url2} target="blank">
									{CGU.firstPart.fifthBlock.url2}.
								</a>
							</span>
						</p>
						<h2>{CGU.secondPart.title}</h2>
						{Object.keys(CGU.secondPart.sections).map(sectionKey => (
							<div key={sectionKey}>
								<h3>{sectionKey}</h3>
								{CGU.secondPart.sections[sectionKey].blocks.map(
									(block, index) => (
										<p key={index}>{block}</p>
									)
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
};
export default GeneralConditions;
