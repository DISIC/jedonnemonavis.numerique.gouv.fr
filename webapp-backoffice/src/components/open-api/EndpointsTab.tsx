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
				L'API JDMA propose deux endpoints principaux pour accéder aux données de
				satisfaction.
			</p>

			<div className={fr.cx('fr-mt-6w')}>
				<div className={fr.cx('fr-mb-2w')}>
					<strong>/services</strong>
					<span className={fr.cx('fr-ml-2v', 'fr-text--sm')}>
						Informations sur vos services
					</span>
				</div>

				<p>
					Récupérez les métadonnées de tous les services accessibles avec votre
					clé API. Cet endpoint est essentiel pour obtenir les IDs nécessaires
					au filtrage des statistiques.
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
										IDs des services à filtrer
										<br />
										<span className={fr.cx('fr-hint-text')}>
											Défaut: [] (tous les services accessibles)
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
		</div>
	);
};

export default EndpointsTab;
