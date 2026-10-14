import NavigationButtons from '@/src/components/open-api/NavigationButtons';
import { Loader } from '@/src/components/ui/Loader';
import { fr } from '@codegouvfr/react-dsfr';
import { SideMenu } from '@codegouvfr/react-dsfr/SideMenu';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

export type DocApi = {} & {
	paths: {
		[key: string]: any;
	};
};

export type DocSection = { id: string; label: string };

interface ApiDocPageProps {
	title: string;
	metaTitle: string;
	metaDescription: string;
	/** Schéma OpenAPI à documenter : `/api/open-api` ou `/api/open-api/partenaires`. */
	specUrl: string;
	sections: DocSection[];
	/** Page publique mais non référencée (documentation partenaire). */
	noIndex?: boolean;
	renderSection: (args: {
		activeSection: string;
		filterDoc: (fieldToKeep: string) => any;
		hasPath: (path: string) => boolean;
	}) => React.ReactNode;
}

/**
 * Coquille commune aux pages de documentation d'API : récupération du schéma, sommaire
 * latéral, navigation entre sections synchronisée avec `?activeTab=`. Chaque page apporte
 * sa liste de sections et leur contenu.
 */
const ApiDocPage = ({
	title,
	metaTitle,
	metaDescription,
	specUrl,
	sections,
	noIndex = false,
	renderSection
}: ApiDocPageProps) => {
	const router = useRouter();
	const [docApi, setDocApi] = useState<DocApi | null>(null);
	const [activeSection, setActiveSection] = useState<string>(sections[0].id);

	const currentSectionIndex = sections.findIndex(s => s.id === activeSection);
	const previousSection =
		currentSectionIndex > 0 ? sections[currentSectionIndex - 1] : null;
	const nextSection =
		currentSectionIndex < sections.length - 1
			? sections[currentSectionIndex + 1]
			: null;

	const getDocApi = async () => {
		const fetching = await fetch(specUrl.split(',').join(''), {
			method: 'GET'
		}).then(async r => {
			if (!r.ok) {
				throw Error(`got status ${r.status}`);
			}
			return r.json();
		});

		setDocApi(fetching as {} & { paths: Record<string, Object> });
	};

	// Un endpoint peut être désactivé côté serveur : il disparaît alors du document
	// OpenAPI. La documentation se cale dessus plutôt que sur une liste en dur,
	// pour ne jamais présenter un point d'accès qui n'existe pas.
	const hasPath = (path: string) => Boolean(docApi?.paths?.[path]);

	const filterDoc = (fieldToKeep: string) => {
		let clonedObject = JSON.parse(JSON.stringify(docApi));
		let newPathObject = { paths: {} } as DocApi;
		if (clonedObject.paths && clonedObject.paths[fieldToKeep]) {
			newPathObject.paths[fieldToKeep] = clonedObject.paths[fieldToKeep];
		} else {
			console.error('Path does not exist in the OpenAPI object');
			return null;
		}
		clonedObject.paths = newPathObject.paths;
		return clonedObject;
	};

	useEffect(() => {
		getDocApi();
	}, []);

	useEffect(() => {
		const { activeTab } = router.query;
		if (activeTab && typeof activeTab === 'string') {
			const validSections = sections.map(s => s.id);
			if (validSections.includes(activeTab)) {
				setActiveSection(activeTab);
			}
		}
	}, [router.query]);

	const handleSectionChange = (sectionId: string) => {
		setActiveSection(sectionId);
		router.push(
			{
				pathname: router.pathname,
				query: { ...router.query, activeTab: sectionId }
			},
			undefined,
			{ shallow: true }
		);
	};

	const sideMenuItems = sections.map(section => ({
		text: section.label,
		linkProps: {
			href: `#${section.id}`,
			onClick: (e: React.MouseEvent) => {
				e.preventDefault();
				handleSectionChange(section.id);
			}
		},
		isActive: activeSection === section.id
	}));

	return (
		<div className={fr.cx('fr-container', 'fr-py-6w')}>
			<Head>
				<title>{metaTitle}</title>
				<meta name="description" content={metaDescription} />
				{noIndex && <meta name="robots" content="noindex" />}
			</Head>

			<h1 className={fr.cx('fr-mb-10v')}>{title}</h1>

			{docApi === null ? (
				<Loader />
			) : (
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					<div className={fr.cx('fr-col-12', 'fr-col-md-3')}>
						<SideMenu
							items={sideMenuItems}
							sticky
							burgerMenuButtonText="Menu"
						/>
					</div>

					<div className={fr.cx('fr-col-12', 'fr-col-md-9')}>
						{renderSection({ activeSection, filterDoc, hasPath })}
						<NavigationButtons
							previousSection={previousSection}
							nextSection={nextSection}
							onSectionChange={handleSectionChange}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default ApiDocPage;
