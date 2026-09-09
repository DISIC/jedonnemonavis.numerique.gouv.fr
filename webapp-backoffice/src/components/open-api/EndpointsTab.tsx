import React from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import { Accordion } from '@codegouvfr/react-dsfr/Accordion';
import dynamic from 'next/dynamic';
import { SwaggerUIProps } from 'swagger-ui-react';
import {
	FIELD_CODE_BOOLEAN_VALUES,
	FIELD_CODE_DETAILS_VALUES,
	FIELD_CODE_SMILEY_VALUES
} from '@/src/utils/helpers';

const SwaggerUI = dynamic<SwaggerUIProps>(import('swagger-ui-react') as any, {
	ssr: false
});
import 'swagger-ui-react/swagger-ui.css';

interface EndpointsTabProps {
	filterDoc: (fieldToKeep: string) => any;
}

const EndpointsTab = ({ filterDoc }: EndpointsTabProps) => {
	const fieldCodes = [
		...FIELD_CODE_SMILEY_VALUES,
		...FIELD_CODE_DETAILS_VALUES,
		...FIELD_CODE_BOOLEAN_VALUES
	].filter(fc => !('hideInDocs' in fc) || !fc.hideInDocs);

	return (
		<div>
			<h2>Points d'accès API</h2>
			<p>
				L'API JDMA propose des endpoints pour décrire vos services numériques
				(<strong>/services</strong>), leurs statistiques de satisfaction agrégées
				(<strong>/statistiques</strong>) et leurs avis bruts (
				<strong>/avis</strong>). Pour les partenaires, deux endpoints permettent de
				provisionner automatiquement un service depuis Démarches Numériques.
			</p>

			<div className={fr.cx('fr-mt-6w')}>
				<div className={fr.cx('fr-mb-2w')}>
					<strong>/services</strong>
					<span className={fr.cx('fr-ml-2v', 'fr-text--sm')}>
						Informations sur vos services numériques
					</span>
				</div>

				<p>
					Récupérez les métadonnées de tous les services numériques accessibles
					avec votre clé API. Cet endpoint est essentiel pour obtenir les IDs
					nécessaires au filtrage des statistiques.
				</p>

				<SwaggerUI
					spec={filterDoc('/services')}
					layout="BaseLayout"
					presets={[]}
				/>
			</div>

			<div className={fr.cx('fr-mt-8w')}>
				<div className={fr.cx('fr-mb-2w')}>
					<strong>/statistiques</strong>
					<span className={fr.cx('fr-ml-2v', 'fr-text--sm')}>
						Statistiques de satisfaction
					</span>
				</div>

				<p>
					Accédez aux données de satisfaction des usagers avec de nombreuses
					options de filtrage.
				</p>

				<h4 className={fr.cx('fr-h6', 'fr-mb-2v', 'fr-mt-6v')}>
					Paramètres de filtrage
				</h4>
				<div className={fr.cx('fr-table')}>
					<div className={fr.cx('fr-table__content')}>
						<table>
							<thead>
								<tr>
									<th>Paramètre</th>
									<th>Description</th>
									<th>Type</th>
									<th>Requis</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<code>start_date</code>
									</td>
									<td>Date de début au format YYYY-MM-DD</td>
									<td>string</td>
									<td>Oui</td>
								</tr>
								<tr>
									<td>
										<code>end_date</code>
									</td>
									<td>Date de fin au format YYYY-MM-DD</td>
									<td>string</td>
									<td>Oui</td>
								</tr>
								<tr>
									<td>
										<code>product_ids</code>
									</td>
									<td>
										IDs des services numériques à filtrer
										<br />
										<span className={fr.cx('fr-hint-text')}>
											Défaut: [] (tous les services numériques accessibles)
										</span>
									</td>
									<td>Array[number]</td>
									<td>Non</td>
								</tr>
								<tr>
									<td>
										<code>form_ids</code>
									</td>
									<td>
										IDs des formulaires à filtrer
										<br />
										<span className={fr.cx('fr-hint-text')}>
											Défaut: [] (tous les formulaires accessibles)
										</span>
									</td>
									<td>Array[number]</td>
									<td>Non</td>
								</tr>
								<tr>
									<td>
										<code>field_codes</code>
									</td>
									<td>
										Codes des questions à inclure dans les résultats
										<br />
										<span className={fr.cx('fr-hint-text')}>
											Valeurs : voir ci-dessous | Défaut: [] (toutes les
											questions)
										</span>
									</td>
									<td>Array[string]</td>
									<td>Non</td>
								</tr>
								<tr>
									<td>
										<code>interval</code>
									</td>
									<td>
										Intervalle de regroupement des données
										<br />
										<span className={fr.cx('fr-hint-text')}>
											Valeurs: day, week, month, year, none | Défaut: none
										</span>
									</td>
									<td>string</td>
									<td>Non</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<Accordion
					titleAs="h4"
					label={`Codes des questions disponibles (${fieldCodes.length} au total)`}
					className={fr.cx('fr-mb-4w')}
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
																	boolean => boolean.slug === code.slug
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
																boolean => boolean.slug === code.slug
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

				<SwaggerUI spec={filterDoc('/statistiques')} />
			</div>

			<div className={fr.cx('fr-mt-8w')}>
				<div className={fr.cx('fr-mb-2w')}>
					<strong>/avis</strong>
					<span className={fr.cx('fr-ml-2v', 'fr-text--sm')}>
						Avis bruts d'un formulaire
					</span>
				</div>

				<p>
					Récupérez un à un les avis déposés sur un formulaire, réponse par
					réponse, plutôt que sous forme agrégée. Les avis sont retournés du
					plus récent au plus ancien, par pages.
				</p>

				<p>
					Récupérez d'abord les identifiants de formulaires avec{' '}
					<code>/services</code>, puis paginez avec le <code>cursor</code>{' '}
					renvoyé dans <code>metadata.next_cursor</code> jusqu'à ce que{' '}
					<code>metadata.has_more</code> passe à <code>false</code>. Pour une
					synchronisation régulière, préférez le curseur aux dates : les bornes
					de <code>start_date</code> et <code>end_date</code> sont interprétées
					sur la journée entière, ce qui peut faire réapparaître un avis d'une
					fenêtre à la suivante.
				</p>

				<h4 className={fr.cx('fr-h6', 'fr-mb-2v', 'fr-mt-6v')}>
					Paramètres de filtrage
				</h4>
				<div className={fr.cx('fr-table')}>
					<div className={fr.cx('fr-table__content')}>
						<table>
							<thead>
								<tr>
									<th>Paramètre</th>
									<th>Description</th>
									<th>Type</th>
									<th>Requis</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<code>form_id</code>
									</td>
									<td>
										ID du formulaire dont on veut les avis
										<br />
										<span className={fr.cx('fr-hint-text')}>
											Obtenu via <code>/services</code>
										</span>
									</td>
									<td>number</td>
									<td>Oui</td>
								</tr>
								<tr>
									<td>
										<code>product_id</code>
									</td>
									<td>
										ID du service numérique porteur du formulaire
										<br />
										<span className={fr.cx('fr-hint-text')}>
											Facultatif, sert uniquement de garde-fou : une valeur
											incohérente avec <code>form_id</code> renvoie une erreur
										</span>
									</td>
									<td>number</td>
									<td>Non</td>
								</tr>
								<tr>
									<td>
										<code>start_date</code>
									</td>
									<td>Date de début au format YYYY-MM-DD</td>
									<td>string</td>
									<td>Non</td>
								</tr>
								<tr>
									<td>
										<code>end_date</code>
									</td>
									<td>Date de fin au format YYYY-MM-DD</td>
									<td>string</td>
									<td>Non</td>
								</tr>
								<tr>
									<td>
										<code>cursor</code>
									</td>
									<td>
										Curseur de pagination
										<br />
										<span className={fr.cx('fr-hint-text')}>
											À reprendre tel quel depuis{' '}
											<code>metadata.next_cursor</code> de la réponse précédente
										</span>
									</td>
									<td>string</td>
									<td>Non</td>
								</tr>
								<tr>
									<td>
										<code>limit</code>
									</td>
									<td>
										Nombre d'avis par page
										<br />
										<span className={fr.cx('fr-hint-text')}>
											Entre 1 et 100 | Défaut: 50
										</span>
									</td>
									<td>number</td>
									<td>Non</td>
								</tr>
								<tr>
									<td>
										<code>include_answers</code>
									</td>
									<td>
										Inclure les réponses de chaque avis
										<br />
										<span className={fr.cx('fr-hint-text')}>
											Défaut: true | Passez <code>false</code> pour ne récupérer
											que les métadonnées des avis
										</span>
									</td>
									<td>boolean</td>
									<td>Non</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<SwaggerUI spec={filterDoc('/avis')} />
			</div>

			<div className={fr.cx('fr-mt-8w')}>
				<div className={fr.cx('fr-mb-2w')}>
					<strong>/demarches-numeriques/services</strong>
					<span className={fr.cx('fr-ml-2v', 'fr-text--sm')}>
						Provisionner un service depuis Démarches Numériques
					</span>
				</div>

				<p>
					Réservé aux partenaires (clé API partenaire). Crée en un appel le service,
					le formulaire (observatoire), le lien d'intégration et les droits admin,
					puis renvoie le code d'intégration et les liens d'inscription. Idempotent
					sur <code>external_id</code>.
				</p>

				<SwaggerUI spec={filterDoc('/demarches-numeriques/services')} />
			</div>

			<div className={fr.cx('fr-mt-8w')}>
				<div className={fr.cx('fr-mb-2w')}>
					<strong>
						/demarches-numeriques/services/{'{external_id}'}/admins
					</strong>
					<span className={fr.cx('fr-ml-2v', 'fr-text--sm')}>
						Ajouter des admins à un service DN existant
					</span>
				</div>

				<p>
					Réservé aux partenaires. Ajoute des administrateurs (carrier_admin) à un
					service déjà provisionné, identifié par son <code>external_id</code>.
				</p>

				<SwaggerUI
					spec={filterDoc(
						'/demarches-numeriques/services/{external_id}/admins'
					)}
				/>
			</div>
		</div>
	);
};

export default EndpointsTab;
