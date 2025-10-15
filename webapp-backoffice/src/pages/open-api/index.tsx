import AuthenticationTab from '@/src/components/open-api/AuthenticationTab';
import EndpointsTab from '@/src/components/open-api/EndpointsTab';
import ExamplesTab from '@/src/components/open-api/ExamplesTab';
import NavigationButtons from '@/src/components/open-api/NavigationButtons';
import { Loader } from '@/src/components/ui/Loader';
import { fr } from '@codegouvfr/react-dsfr';
import { SideMenu } from '@codegouvfr/react-dsfr/SideMenu';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const DocAPIv2 = () => {
	type DocApi = {} & {
		paths: {
			[key: string]: any;
		};
	};

	const router = useRouter();
	const [docApi, setDocApi] = useState<DocApi | null>(null);
	const [activeSection, setActiveSection] = useState<string>('authentication');

	const sections = [
		{ id: 'authentication', label: 'Authentification' },
		{ id: 'endpoints', label: "Points d'accès" },
		{ id: 'examples', label: 'Exemples' }
	];

	const currentSectionIndex = sections.findIndex(s => s.id === activeSection);
	const previousSection =
		currentSectionIndex > 0 ? sections[currentSectionIndex - 1] : null;
	const nextSection =
		currentSectionIndex < sections.length - 1
			? sections[currentSectionIndex + 1]
			: null;

	const getDocApi = async () => {
		const url = `${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api`;
		const fetching = await fetch(url.split(',').join(''), {
			method: 'GET'
		}).then(async r => {
			if (!r.ok) {
				throw Error(`got status ${r.status}`);
			}
			return r.json();
		});

		setDocApi(fetching as {} & { paths: Record<string, Object> });
	};

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
				<title>Documentation API JDMA | Je donne mon avis</title>
				<meta
					name="description"
					content="Documentation complète de l'API JDMA - Accédez aux données de satisfaction des usagers"
				/>
			</Head>

			<h1 className={fr.cx('fr-mb-10v')}>Documentation API</h1>

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
						{activeSection === 'authentication' && (
							<>
								<AuthenticationTab />
								<NavigationButtons
									previousSection={previousSection}
									nextSection={nextSection}
									onSectionChange={handleSectionChange}
								/>
							</>
						)}

						{activeSection === 'endpoints' && (
							<>
								<EndpointsTab filterDoc={filterDoc} />
								<NavigationButtons
									previousSection={previousSection}
									nextSection={nextSection}
									onSectionChange={handleSectionChange}
								/>
							</>
						)}

						{activeSection === 'examples' && (
							<>
								<ExamplesTab />
								<NavigationButtons
									previousSection={previousSection}
									nextSection={nextSection}
									onSectionChange={handleSectionChange}
								/>
							</>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default DocAPIv2;
