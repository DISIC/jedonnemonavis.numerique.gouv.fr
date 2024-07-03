import dynamic from 'next/dynamic';
import React from 'react';
import { useState, useEffect } from 'react';
import { SwaggerUIProps } from 'swagger-ui-react';
import { tss } from 'tss-react/dsfr';
import { fr } from '@codegouvfr/react-dsfr';
const SwaggerUI = dynamic<SwaggerUIProps>(import('swagger-ui-react') as any, {
	ssr: false
});
import 'swagger-ui-react/swagger-ui.css';
import { Loader } from '@/src/components/ui/Loader';
import Head from 'next/head';
import {
	FIELD_CODE_BOOLEAN_VALUES,
	FIELD_CODE_DETAILS_VALUES,
	FIELD_CODE_SMILEY_VALUES
} from '@/src/utils/helpers';
import Link from 'next/link';
import Image from 'next/image';

const DocAPI = () => {
	type DocApi = {} & {
		paths: {
			[key: string]: any;
		};
	};

	const [docApi, setDocApi] = useState<DocApi | null>(null);
	const { cx, classes } = useStyles();

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

	return (
		<div className={fr.cx('fr-container', 'fr-py-6w')}>
			<Head>
				<title>API données satisfaction | Je donne mon avis</title>
				<meta
					name="description"
					content={`API données satisfaction | Je donne mon avis`}
				/>
			</Head>
			{docApi === null ? (
				<Loader></Loader>
			) : (
				<>
					<div className={fr.cx('fr-container')}>
						<h3>Documentation API JDMA</h3>
						<p>
							Afin de pouvoir utiliser les points d'accès décrits dans cette
							documentation, vous allez en premier lieu devoir générer une clé
							API.
						</p>
						<p>
							Vous pourrez créer deux types de clé API :
							<ul>
								<li>
									<b>Clé API liée à un service</b> : cette clé permet l'accès
									uniquement au service pour lequel elle a été générée.
								</li>
								<li>
									<b>Clé API liée à une organisation</b> : si vous êtes
									administrateur d'une organisation, cette clé permet l'accès à
									tous les servives associés à cette organisation.
								</li>
							</ul>
						</p>
					</div>
					<div className={fr.cx('fr-container', 'fr-pt-6w')}>
						<h4>1. Générer une clé API liée à un service</h4>
						<p>
							Afin de générer une clé API liée à un service, rendez-vous sur{' '}
							<Link href={'/administration/dashboard/products'} target="_blank">
								Vos services
							</Link>
						</p>
						<p className={classes.wrapperTextImg}>
							Cliquez ensuite sur le service pour lequel vous souhaitez ouvrir
							l'accès.
						</p>
						<p className={classes.wrapperTextImg}>
							Dans la page qui s'ouvre, cliquez ensuite sur l'onglet 'Gérer les
							clés API'.
						</p>
						<p className={classes.wrapperTextImg}>
							Dans la page qui s'ouvre, vous pouvez ensuite cliquer sur 'Ajouter
							une clé API' :
							<Image
								alt="bouton-ajouter-clé-api"
								src={`/assets/generer-cle-api.png`}
								width={288}
								height={52}
							/>
						</p>
						<p>
							Vous pouvez désormais copier/coller la clé nouvellement créée,
							vous en aurez besoin pour chacun des points d'accès décrits dans
							cette documentation.
						</p>
					</div>
					<div className={fr.cx('fr-container', 'fr-pt-6w')}>
						<h4>2. Générer une clé API liée à une organisation</h4>
						<p>
							Afin de générer une clé API liée à une organisation, vous devez
							être administrateur de cette organisation. Si c'est le cas,
							rendez-vous sur{' '}
							<Link href={'/administration/dashboard/entities'} target="_blank">
								Vos organisations
							</Link>
						</p>
						<p className={classes.wrapperTextImg}>
							Cliquez ensuite sur le bouton 'Clés API', pour l'organisation sur
							laquelle vous souhaitez ouvrir un accès :
							<Image
								alt="bouton-clé-api"
								src={`/assets/cle-api.png`}
								width={120}
								height={48}
							/>
						</p>
						<p className={classes.wrapperTextImg}>
							Dans la popup qui s'ouvre, vous pouvez ensuite cliquer sur
							'Ajouter une clé API' :
							<Image
								alt="bouton-ajouter-clé-api"
								src={`/assets/add-api-key.png`}
								width={222}
								height={57}
							/>
						</p>
						<p>
							Vous pouvez désormais copier/coller la clé nouvellement créée,
							vous en aurez besoin pour chacun des points d'accès décrits dans
							cette documentation.
						</p>
					</div>
					<div className={fr.cx('fr-container', 'fr-pt-6w')}>
						<h4>3. Point d'accès Infos Démarches</h4>
						<p>
							Ce point d'accès retourne les informations sur les services
							auxquels votre clé donne accès.
						</p>
						<p>
							Il sera notamment utile pour récupérer les ids des démarches, et
							ainsi pouvoir filtrer les résultats du point d'accès
							/statsUsagers.
						</p>
						<SwaggerUI
							spec={filterDoc('/demarches')}
							layout="BaseLayout"
							presets={[]}
						/>
					</div>
					<br />
					<div className={fr.cx('fr-container', 'fr-py-6w')}>
						<h4>4. Point d'accès statistiques de statisfaction des usagers</h4>
						<p>
							Ce point d'accès retourne les données de satisfaction des
							utilisateurs pour toutes les démarches liées à la clé fournie.
						</p>
						<p>
							Il offre les options de filtrage suivantes : <br />
							<ul>
								<li>
									<b>field_codes : </b> Les codes des questions posées aux
									utilisateurs. Si vide, retourne les données pour l'esemble des
									codes. <br />
									<br />
									Voici la correspondance entre les field_codes et les questions
									: <br />
									<table
										className={fr.cx('fr-table')}
										dangerouslySetInnerHTML={{
											__html: [
												...FIELD_CODE_SMILEY_VALUES,
												...FIELD_CODE_DETAILS_VALUES,
												...FIELD_CODE_BOOLEAN_VALUES
											]
												.filter(fc => !('hideInDocs' in fc) || !fc.hideInDocs)
												.map(code => {
													return `<tr><td>${code.slug}</td><td>${code.question}${'hint' in code && code.hint ? `<br><span class="fr-hint-text">${code.hint}</span>` : ''}</td></tr>`;
												})
												.join()
												.replace(/,/g, '')
										}}
									></table>
								</li>
								<li>
									<b>product_ids : </b> Les ids des produits sur lesquels vous
									souhaitez filtrer les résultats. Si vide, retourne l'ensemble
									des produits du scope.
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
			)}
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
