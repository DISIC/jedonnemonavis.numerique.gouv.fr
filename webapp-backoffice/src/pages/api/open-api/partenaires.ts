import { NextApiRequest, NextApiResponse } from 'next';

import { partnerOpenApiDocument } from '@/src/server/openapi';

/**
 * Schéma OpenAPI des seuls points d'accès partenaires, consommé par
 * `/open-api/partenaires`. Ce n'est pas un point d'accès de l'API : le fichier vit dans
 * `pages/api/open-api/` pour rester à côté du schéma public, et Next le sert avant le
 * routeur attrape-tout `[...trpc].ts` — aucun endpoint ne porte ce chemin.
 */
const handler = (_: NextApiRequest, res: NextApiResponse) => {
	res.status(200).send(partnerOpenApiDocument);
};

export default handler;
