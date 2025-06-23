import NewsLayout from '@/src/layouts/News/NewsLayout';
import { fr } from '@codegouvfr/react-dsfr';
import Table from '@codegouvfr/react-dsfr/Table';
import { GetStaticProps } from 'next';
import path from 'path';
import fs from 'fs';
import React, { ReactNode } from 'react';
import matter from 'gray-matter';

interface NewsUpcomingProps {
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
		/^#\s+Introduction\n([\s\S]*?)(?:\n##|$)/
	);
	const intro = introMatch?.[1]?.trim() || '';

	// Extraire les items après "## Items"
	const itemsSectionMatch = cleanedContent.match(/## Items\n([\s\S]*)/);
	const itemsContent = itemsSectionMatch?.[1]?.trim() || '';

	// Séparer chaque élément basé sur les lignes commençant par `- **Catégorie**`
	const items = itemsContent.split(/(?=- \*\*Catégorie\*\*: )/);

	// Convertir les items en données pour le tableau
	const tableData: ReactNode[][] = items.map(item => {
		const titleMatch = item.match(/\*\*Titre\*\*: (.+)/);
		const descriptionMatch = item.match(/\*\*Description\*\*: (.+)/);
		const statusMatch = item.match(/\*\*Statut\*\*: (.+)/);

		if (statusMatch?.[1]?.trim() !== 'A venir') return [];

		return [titleMatch?.[1]?.trim() || '', descriptionMatch?.[1]?.trim() || ''];
	});

	return {
		props: {
			intro,
			tableData
		}
	};
};

const NewsUpcomingPage = ({ intro, tableData = [] }: NewsUpcomingProps) => {
	return (
		<NewsLayout>
			<div className={fr.cx('fr-grid-row')}>
				<div className={fr.cx('fr-col-12')}>
					<h2 className={fr.cx('fr-mb-6v')}>À venir</h2>
				</div>
				<div className={fr.cx('fr-col-12')}>
					<Table
						caption={intro}
						data={tableData}
						headers={['Titre de la fonctionnalité', 'Descripition']}
					/>
				</div>
			</div>
		</NewsLayout>
	);
};

export default NewsUpcomingPage;
