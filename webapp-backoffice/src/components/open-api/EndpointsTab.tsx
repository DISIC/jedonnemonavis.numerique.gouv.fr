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
					<strong>/stats</strong>
					<span className={fr.cx('fr-ml-2v', 'fr-text--sm')}>
						Statistiques de satisfaction
					</span>
				</div>

				<p>
					Accédez aux données de satisfaction des usagers avec de nombreuses
					options de filtrage.
				</p>

				<h4>Paramètres de filtrage :</h4>
				<ul>
					<li>
						<code>field_codes</code> : Codes des questions à inclure (optionnel)
					</li>
					<li>
						<code>product_ids</code> : IDs des services à filtrer (optionnel)
					</li>
					<li>
						<code>start_date</code> : Date de début (yyyy-mm-dd)
					</li>
					<li>
						<code>end_date</code> : Date de fin (yyyy-mm-dd)
					</li>
					<li>
						<code>interval</code> : Intervalle temporel (day, week, month, year,
						none)
					</li>
				</ul>

				<Accordion
					titleAs="h4"
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

				<SwaggerUI spec={filterDoc('/stats')} />
			</div>
		</div>
	);
};

export default EndpointsTab;
