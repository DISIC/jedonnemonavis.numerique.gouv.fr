import { fr } from '@codegouvfr/react-dsfr';
import Head from 'next/head';
import React, { ReactNode } from 'react';
import { tss } from 'tss-react/dsfr';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Table } from '@codegouvfr/react-dsfr/Table';
import { GetStaticProps } from 'next';

// Définir les types pour les données extraites
interface TableItem {
	category: string;
	title: string;
	status: string;
	description: string;
}

interface HomeProps {
	intro: string;
	tableData: ReactNode[][];
}

export const getStaticProps: GetStaticProps = async () => {
	const filePath = path.join(process.cwd(), 'roadmap.md'); // Chemin du fichier Markdown
	const fileContent = fs.readFileSync(filePath, 'utf8');

	// Analyse le contenu du fichier Markdown
	const { content } = matter(fileContent);

	// Nettoyer le contenu en supprimant les lignes vides inutiles
	const cleanedContent = content
		.split('\n')
		.filter(line => line.trim() !== '') // Supprime les lignes vides
		.join('\n');

	// Extraire l'introduction
	const introMatch = cleanedContent.match(
		/^#\s+Introduction\n([\s\S].*?)(?:\n##|$)/
	);
	const intro = introMatch?.[1]?.trim() || '';

	// Extraire les items après "## Items"
	const itemsSectionMatch = cleanedContent.match(/## Items\n([\s\S]*)/);
	const itemsContent = itemsSectionMatch?.[1]?.trim() || '';

	// Séparer chaque élément basé sur les lignes commençant par `- **Catégorie**`
	const items = itemsContent.split(/(?=- \*\*Catégorie\*\*: )/);

	// Convertir les items en données pour le tableau
	const tableData: ReactNode[][] = items.map(item => {
		const categoryMatch = item.match(/\*\*Catégorie\*\*: (.+)/);
		const titleMatch = item.match(/\*\*Titre\*\*: (.+)/);
		const statusMatch = item.match(/\*\*Statut\*\*: (.+)/);
		const descriptionMatch = item.match(/\*\*Description\*\*: (.+)/);

		return [
			categoryMatch?.[1]?.trim() || '',
			titleMatch?.[1]?.trim() || '',
			statusMatch?.[1]?.trim() || '',
			descriptionMatch?.[1]?.trim() || ''
		];
	});

	return {
		props: {
			intro,
			tableData
		}
	};
};

const Roadmap: React.FC<HomeProps> = ({ intro, tableData }) => {
	const { cx, classes } = useStyles();

	return (
		<>
			<Head>
				<title>Roadmap | Je donne mon avis</title>
				<meta name="description" content={`Roadmap | Je donne mon avis`} />
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
						<h1 className={fr.cx('fr-mb-12v')}>Roadmap Je donne mon avis</h1>
						<Table
							caption={intro}
							data={tableData}
							headers={[
								'Tag / Epic',
								'Titre de la fonctionnalité',
								'Statut',
								'Description'
							]}
						></Table>
					</div>
				</div>
			</div>
		</>
	);
};

const useStyles = tss.withName(Roadmap.name).create(() => ({
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

export default Roadmap;
