import React from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import CodeBlock from './CodeBlock';

const PartnerAuthenticationTab = () => {
	return (
		<div>
			<h2>Authentification partenaire</h2>
			<p>
				Les points d'accès partenaires ne s'ouvrent qu'avec une{' '}
				<strong>clé API partenaire</strong>, distincte des clés liées à un
				service numérique ou à une organisation. Elle est émise par l'équipe
				JDMA et portée par un compte de service dédié : elle ne peut pas être
				générée depuis le back-office, et le rôle administrateur d'un compte ne
				suffit pas à y accéder.
			</p>

			<div
				className={fr.cx('fr-alert', 'fr-alert--info', 'fr-mb-4v', 'fr-mt-4w')}
			>
				<p>
					<strong>Obtenir une clé :</strong> contactez l'équipe JDMA en
					précisant la plateforme partenaire à raccorder. La clé est rattachée à
					une source (par exemple Démarches Numériques) et n'autorise que les
					points d'accès de cette source.
				</p>
			</div>

			<h3 className={fr.cx('fr-h6', 'fr-mt-6w')}>Utilisation de votre clé</h3>
			<p>Incluez la clé dans l'en-tête de vos requêtes :</p>
			<CodeBlock hideCopy>
				{`Authorization: Bearer VOTRE_CLE_PARTENAIRE
Content-Type: application/json`}
			</CodeBlock>

			<p className={fr.cx('fr-mt-2w')}>
				Une clé partenaire crée des services et des droits d'accès sur JDMA.
				Appelez ces points d'accès depuis votre serveur uniquement : ne la
				placez jamais dans une page web, une application mobile ou tout autre
				code distribué.
			</p>

			<h3 className={fr.cx('fr-h6', 'fr-mt-6w')}>Réponses d'erreur</h3>
			<div className={fr.cx('fr-table')}>
				<div className={fr.cx('fr-table__content')}>
					<table>
						<thead>
							<tr>
								<th>Code</th>
								<th>Signification</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>
									<code>401</code>
								</td>
								<td>
									Clé absente, invalide, ou clé API classique employée sur un
									point d'accès partenaire
								</td>
							</tr>
							<tr>
								<td>
									<code>403</code>
								</td>
								<td>
									Clé partenaire valide mais non autorisée pour la source visée
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default PartnerAuthenticationTab;
