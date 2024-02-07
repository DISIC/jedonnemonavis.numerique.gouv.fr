import dynamic from 'next/dynamic';
import React from "react"
import { useState, useEffect } from 'react'
import { SwaggerUIProps } from 'swagger-ui-react';
import { tss } from 'tss-react/dsfr';
import { fr } from '@codegouvfr/react-dsfr';
const SwaggerUI = dynamic<SwaggerUIProps>(import('swagger-ui-react') as any, {
	ssr: false
});
import 'swagger-ui-react/swagger-ui.css';
import { Loader } from '@/src/components/ui/Loader';
import { FIELD_CODE_BOOLEAN_VALUES, FIELD_CODE_SMILEY_VALUES } from '@/src/utils/helpers';
import Link from 'next/link';
import Image from 'next/image';

const DocAPI = () => {

	type DocApi = {} & {
		paths: {
			[key: string]: any;
		}
	}

	const [docApi, setDocApi] = useState<DocApi | null>(null)
	const { cx, classes } = useStyles();

	const getDocApi = async () => {
		const url = `${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api`
		const fetching = await fetch(url.split(",").join(""), {
			method: "GET",
		}).then(async (r) => {
			if (!r.ok) {
				throw Error(`got status ${r.status}`);
			}
			return r.json();
		});

		console.log('fetching : ', fetching)

		setDocApi(fetching as {} & {paths: Record<string, Object>})

	}

	const filterDoc = (fieldToKeep: string) => {

		let clonedObject = JSON.parse(JSON.stringify(docApi));
		let newPathObject = {paths: {}} as DocApi;
		if (clonedObject.paths && clonedObject.paths[fieldToKeep]) {

			newPathObject.paths[fieldToKeep] = clonedObject.paths[fieldToKeep];
		} else {
			console.error('Path does not exist in the OpenAPI object');
			return null;
		}
		clonedObject.paths = newPathObject.paths;
		return clonedObject;
	}

	useEffect(() => {
		getDocApi()
	}, [])

	return (
		<div className={fr.cx('fr-container', 'fr-py-6w')}>
			{docApi === null ?
				<Loader></Loader>
				:
				<>
					<div className={fr.cx('fr-container', 'fr-py-6w')}>
						<h3>Documentation API JDMA</h3>
					</div>
					<div className={fr.cx('fr-container', 'fr-py-6w')}>
						<h5>1. Générer une clé API</h5>
						<p>
							Afin de pouvoir utiliser les points d'accès décrits dans cette documentation, vous allez en premier lieu devoir générer une clé API.
						</p>
						<p>
							Pour ce faire, rendez-vous sur la page <Link href={'/administration/dashboard/products'} target='_blank'>Mes démarches</Link>
						</p>
						<p className={classes.wrapperTextImg}>
							Cliquez ensuite sur le bouton 'Mes Clés API' :
							<Image
									
								alt="bouton-mes-clés-api"
								src={`/assets/button-api-key.png`}
								width={165}
								height={56}
							/>
						</p>
						<p className={classes.wrapperTextImg}>
							Dans la popup qui s'ouvre, vous pouvez ensuite cliquer sur 'Ajouter une clé API' :
							<Image
									
								alt="bouton-ajouter-clé-api"
								src={`/assets/add-api-key.png`}
								width={222}
								height={57}
							/>
						</p>
						<p>
							Vous pouvez désormais copier/coller la clé nouvellement créée, vous en aurez besoin pour chacun des points d'accès décrits dans cette documentation.
						</p>
					</div>
					<div className={fr.cx('fr-container', 'fr-py-6w')}>
						<h5>2. Point d'accès Infos Démarches</h5>
						<p>
							Ce point d'accès retourne les informations sur les démarches sur lesquelles vous êtes porteur.
						</p><p>
							Il sera notamment utile pour récupérer les ids des démarches, et ainsi pouvoir filtrer les résultats du point d'accès /statsUsagers.
						</p>
						<SwaggerUI spec={filterDoc('/demarches')} layout='BaseLayout' presets={[]}/>
					</div>
					<br />
					<div className={fr.cx('fr-container', 'fr-py-6w')}>
						<h5>3. Point d'accès statistiques de statisfaction des usagers</h5>
						<p>
							Ce point d'accès retourne les données de satisfaction des utilisateurs pour toutes les démarches liées au porteur du token fourni.
						</p>
						<p>
							Il offre les options de filtrage suivantes :  <br />
							<ul>
								<li>
									<b>filed_codes : </b> Les codes des questions posées aux utilisateurs. Si vide, retourne les données pour l'esemble des codes. <br />
									Voici la correspondance entre les field_codes et les questions : <br />
									<p dangerouslySetInnerHTML={{__html: [
																	...FIELD_CODE_BOOLEAN_VALUES,
																	...FIELD_CODE_SMILEY_VALUES
																]
																	.map(code => {
																		return `- ${code.slug} : ${code.question} <br />`;
																	})
																	.join()
																	.replace(/,/g, '')}}
																	>
									</p>
								</li>
								<li>
									<b>product_ids : </b> Les ids des produits sur lesquels vous souhaitez filtrer les résultats. Si vide, retourne l'ensemble des produits du scope.
								</li>
								<li>
									<b>start_date : </b> Date de début (format: yyyy-mm-dd).
								</li>
								<li>
									<b>end_date : </b> Date de fin (format: yyyy-mm-dd).
								</li>
							</ul>
						</p>
						<SwaggerUI spec={filterDoc('/stats')} />
					</div>
				</>
				
			}
			
		</div>
	);
};

const useStyles = tss.withName(DocAPI.name).create(() => ({
	wrapperTextImg: {
		display: 'flex',
		alignItems: 'center'
	}
}));

export default DocAPI;
