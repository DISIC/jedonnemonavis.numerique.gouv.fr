import React from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import { Accordion } from '@codegouvfr/react-dsfr/Accordion';
import CodeBlock from './CodeBlock';

const AuthenticationTab = () => {
	return (
		<div>
			<h2>Authentification</h2>
			<p>
				Pour utiliser l'API JDMA, vous devez d'abord générer une clé API. Suivez
				les étapes ci-dessous selon le type d'accès souhaité.
			</p>

			<Accordion titleAs="h3" label="Générer une clé API liée à un service">
				<ol>
					<li>
						Rendez-vous sur{' '}
						<Link href="/administration/dashboard/products" target="_blank">
							la page de vos services
						</Link>
					</li>
					<li>
						Cliquez sur le service pour lequel vous souhaitez générer une clé
						API
					</li>
					<li>
						Dans la page du service, cliquez sur l'onglet "Gérer les clés API"
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
				<div className={fr.cx('fr-alert', 'fr-alert--warning', 'fr-mb-4v')}>
					<p>
						<strong>Prérequis :</strong> Vous devez être administrateur de
						l'organisation
					</p>
				</div>
				<ol>
					<li>
						Rendez-vous sur{' '}
						<Link href="/administration/dashboard/entities" target="_blank">
							la page de vos organisations
						</Link>
					</li>
					<li>
						Cliquez sur le bouton "Clés API" pour l'organisation souhaitée
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

			<h4 className={fr.cx('fr-mt-4w')}>Utilisation de votre clé API</h4>
			<p>
				Une fois votre clé générée, incluez-la dans l'en-tête de vos requêtes :
			</p>
			<CodeBlock>
				{`Authorization: Bearer VOTRE_CLE_API
Content-Type: application/json`}
			</CodeBlock>
		</div>
	);
};

export default AuthenticationTab;
