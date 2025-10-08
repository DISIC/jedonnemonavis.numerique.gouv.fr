import dynamic from 'next/dynamic';
import React from 'react';
import { useState, useEffect } from 'react';
import { SwaggerUIProps } from 'swagger-ui-react';
import { tss } from 'tss-react/dsfr';
import { fr } from '@codegouvfr/react-dsfr';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import { Accordion } from '@codegouvfr/react-dsfr/Accordion';
import { SideMenu } from '@codegouvfr/react-dsfr/SideMenu';

const SwaggerUI = dynamic<SwaggerUIProps>(import('swagger-ui-react') as any, {
	ssr: false
});
import 'swagger-ui-react/swagger-ui.css';
import { Loader } from '@/src/components/ui/Loader';
import {
	FIELD_CODE_BOOLEAN_VALUES,
	FIELD_CODE_DETAILS_VALUES,
	FIELD_CODE_SMILEY_VALUES
} from '@/src/utils/helpers';

const DocAPIv2 = () => {
	type DocApi = {} & {
		paths: {
			[key: string]: any;
		};
	};

	const [docApi, setDocApi] = useState<DocApi | null>(null);
	const [activeSection, setActiveSection] = useState<string>('authentication');
	const { cx, classes } = useStyles();

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

	const fieldCodes = [
		...FIELD_CODE_SMILEY_VALUES,
		...FIELD_CODE_DETAILS_VALUES,
		...FIELD_CODE_BOOLEAN_VALUES
	].filter(fc => !('hideInDocs' in fc) || !fc.hideInDocs);

	const sideMenuItems = sections.map(section => ({
		text: section.label,
		linkProps: {
			href: `#${section.id}`,
			onClick: (e: React.MouseEvent) => {
				e.preventDefault();
				setActiveSection(section.id);
			}
		},
		isActive: activeSection === section.id
	}));

	const NavigationButtons = () => (
		<div
			className={cx(
				classes.navigationGrid,
				fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mt-6w')
			)}
		>
			<div className={fr.cx('fr-col-6')}>
				{previousSection && (
					<Button
						priority="secondary"
						iconId="fr-icon-arrow-left-line"
						iconPosition="left"
						onClick={() => setActiveSection(previousSection.id)}
					>
						{previousSection.label}
					</Button>
				)}
			</div>
			<div className={fr.cx('fr-col-6')} style={{ justifyContent: 'end' }}>
				{nextSection && (
					<Button
						priority="secondary"
						iconId="fr-icon-arrow-right-line"
						iconPosition="right"
						onClick={() => setActiveSection(nextSection.id)}
					>
						{nextSection.label}
					</Button>
				)}
			</div>
		</div>
	);

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
							<div>
								<h2>Authentification</h2>
								<p>
									Pour utiliser l'API JDMA, vous devez d'abord générer une clé
									API. Suivez les étapes ci-dessous selon le type d'accès
									souhaité.
								</p>

								<Accordion
									titleAs="h3"
									label="Générer une clé API liée à un service"
								>
									<ol>
										<li>
											Rendez-vous sur{' '}
											<Link
												href="/administration/dashboard/products"
												target="_blank"
											>
												la page de vos services
											</Link>
										</li>
										<li>
											Cliquez sur le service pour lequel vous souhaitez générer
											une clé API
										</li>
										<li>
											Dans la page du service, cliquez sur l'onglet "Gérer les
											clés API"
										</li>
										<li>
											Cliquez sur "Ajouter une clé API" et copiez la clé générée
											<br />
											<Image
												alt="Bouton ajouter clé API"
												src="/assets/generer-cle-api.png"
												width={288}
												height={52}
												className={fr.cx('fr-mt-2v')}
											/>
										</li>
									</ol>
								</Accordion>

								<Accordion
									titleAs="h3"
									label="Générer une clé API liée à une organisation"
								>
									<div
										className={fr.cx(
											'fr-alert',
											'fr-alert--warning',
											'fr-mb-4v'
										)}
									>
										<p>
											<strong>Prérequis :</strong> Vous devez être
											administrateur de l'organisation
										</p>
									</div>
									<ol>
										<li>
											Rendez-vous sur{' '}
											<Link
												href="/administration/dashboard/entities"
												target="_blank"
											>
												la page de vos organisations
											</Link>
										</li>
										<li>
											Cliquez sur le bouton "Clés API" pour l'organisation
											souhaitée
											<br />
											<Image
												alt="Bouton clé API"
												src="/assets/cle-api.png"
												width={120}
												height={48}
												className={fr.cx('fr-mt-2v')}
											/>
										</li>
										<li>
											Dans la popup, cliquez sur "Ajouter une clé API"
											<br />
											<Image
												alt="Bouton ajouter clé API"
												src="/assets/add-api-key.png"
												width={222}
												height={57}
												className={fr.cx('fr-mt-2v')}
											/>
										</li>
									</ol>
								</Accordion>

								<div className={fr.cx('fr-mt-4w')}>
									<h4>Utilisation de votre clé API</h4>
									<p>
										Une fois votre clé générée, incluez-la dans l'en-tête de vos
										requêtes :
									</p>
									<pre className={classes.codeBlock}>
										{`Authorization: Bearer VOTRE_CLE_API
Content-Type: application/json`}
									</pre>
								</div>

								<NavigationButtons />
							</div>
						)}

						{activeSection === 'endpoints' && (
							<div>
								<h2>Points d'accès API</h2>
								<p>
									L'API JDMA propose deux endpoints principaux pour accéder aux
									données de satisfaction.
								</p>

								<div className={fr.cx('fr-mt-6w')}>
									<p>
										Récupérez les métadonnées de tous les services accessibles
										avec votre clé API. Cet endpoint est essentiel pour obtenir
										les IDs nécessaires au filtrage des statistiques.
									</p>

									<SwaggerUI
										spec={filterDoc('/services')}
										layout="BaseLayout"
										presets={[]}
									/>
								</div>

								<div className={fr.cx('fr-mt-8w')}>
									<p>
										Accédez aux données de satisfaction des usagers avec de
										nombreuses options de filtrage.
									</p>

									<h4>Paramètres de filtrage :</h4>
									<ul>
										<li>
											<code>field_codes</code> : Codes des questions à inclure
											(optionnel)
										</li>
										<li>
											<code>product_ids</code> : IDs des services à filtrer
											(optionnel)
										</li>
										<li>
											<code>start_date</code> : Date de début (yyyy-mm-dd)
										</li>
										<li>
											<code>end_date</code> : Date de fin (yyyy-mm-dd)
										</li>
										<li>
											<code>interval</code> : Intervalle temporel (day, week,
											month, year, none)
										</li>
									</ul>

									<Accordion
										titleAs="h4"
										className={fr.cx('fr-my-4w')}
										label={`Codes des questions disponibles (${fieldCodes.length} au total)`}
									>
										<div className={fr.cx('fr-table')}>
											<div className={fr.cx('fr-table__content')}>
												<table>
													<thead>
														<tr>
															<th>Code</th>
															<th>Question</th>
															<th>Type</th>
														</tr>
													</thead>
													<tbody>
														{fieldCodes.map((code, index) => (
															<tr key={index}>
																<td>
																	<code>{code.slug}</code>
																</td>
																<td>
																	{code.question}
																	{'hint' in code && code.hint && (
																		<>
																			<br />
																			<span className={fr.cx('fr-hint-text')}>
																				{code.hint}
																			</span>
																		</>
																	)}
																</td>
																<td>
																	<Badge
																		severity={
																			FIELD_CODE_SMILEY_VALUES.some(
																				smiley => smiley.slug === code.slug
																			)
																				? 'success'
																				: FIELD_CODE_BOOLEAN_VALUES.some(
																							boolean =>
																								boolean.slug === code.slug
																					  )
																					? 'info'
																					: 'new'
																		}
																	>
																		{FIELD_CODE_SMILEY_VALUES.some(
																			smiley => smiley.slug === code.slug
																		)
																			? 'Smiley'
																			: FIELD_CODE_BOOLEAN_VALUES.some(
																						boolean =>
																							boolean.slug === code.slug
																				  )
																				? 'Oui/Non'
																				: 'Texte'}
																	</Badge>
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</div>
									</Accordion>

									<SwaggerUI spec={filterDoc('/stats')} />
								</div>

								<NavigationButtons />
							</div>
						)}

						{activeSection === 'examples' && (
							<div>
								<h2>Exemples d'utilisation</h2>
								<p>
									Découvrez comment utiliser l'API JDMA avec des exemples
									concrets.
								</p>

								<h3>Récupérer les informations de vos services</h3>
								<pre className={classes.codeBlock}>
									{`curl -X GET "${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api/services" \\
  -H "Authorization: Bearer VOTRE_CLE_API" \\
  -H "Content-Type: application/json"`}
								</pre>

								<h3>Obtenir les statistiques du mois dernier</h3>
								<pre className={classes.codeBlock}>
									{`curl -X GET "${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api/stats?start_date=2024-01-01&end_date=2024-01-31&interval=day" \\
  -H "Authorization: Bearer VOTRE_CLE_API" \\
  -H "Content-Type: application/json"`}
								</pre>

								<h3>Filtrer par type de question (satisfaction uniquement)</h3>
								<pre className={classes.codeBlock}>
									{`curl -X GET "${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api/stats?field_codes=satisfaction" \\
  -H "Authorization: Bearer VOTRE_CLE_API" \\
  -H "Content-Type: application/json"`}
								</pre>

								<h3>Exemple avec JavaScript/Fetch</h3>
								<pre className={classes.codeBlock}>
									{`const apiKey = 'VOTRE_CLE_API';
const baseUrl = '${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api';

// Récupérer les services
const services = await fetch(\`\${baseUrl}/services\`, {
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json'
  }
}).then(res => res.json());

// Récupérer les stats avec filtres
const stats = await fetch(\`\${baseUrl}/stats?start_date=2024-01-01&interval=month\`, {
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json'
  }
}).then(res => res.json());`}
								</pre>

								<div
									className={fr.cx('fr-alert', 'fr-alert--info', 'fr-mt-4w')}
								>
									<h4>💡 Conseils d'utilisation</h4>
									<ul>
										<li>
											Utilisez les IDs récupérés pour filtrer les statistiques
											par service
										</li>
										<li>
											Adaptez l'intervalle selon vos besoins : <code>day</code>{' '}
											pour du détail, <code>month</code> pour des tendances
										</li>
										<li>
											Limitez les plages de dates pour optimiser les
											performances
										</li>
										<li>
											Stockez votre clé API de manière sécurisée (variables
											d'environnement)
										</li>
									</ul>
								</div>

								<NavigationButtons />
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

const useStyles = tss.withName(DocAPIv2.name).create(() => ({
	navigationGrid: {
		justifyContent: 'space-between'
	},
	keyTypeCard: {
		padding: fr.spacing('4v'),
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		borderRadius: fr.spacing('2v'),
		height: '100%'
	},
	codeBlock: {
		backgroundColor: fr.colors.decisions.background.actionHigh.grey.default,
		color: fr.colors.decisions.text.inverted.grey.default,
		padding: fr.spacing('3v'),
		borderRadius: fr.spacing('1v'),
		fontSize: '0.9rem',
		overflow: 'auto'
	}
}));

export default DocAPIv2;
