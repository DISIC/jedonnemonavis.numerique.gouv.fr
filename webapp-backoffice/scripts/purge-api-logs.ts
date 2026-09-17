/**
 * Purge du journal d'audit des open API (`ApiKeyLog`).
 *
 * La durée de conservation est définie route par route dans
 * `src/server/open-api-log/policy.ts`, au plus près de la décision de ce qu'on
 * stocke. Ce script se contente de l'appliquer.
 *
 * Sans purge, le journal grossit indéfiniment : c'est un problème de volumétrie,
 * mais surtout un manquement au principe de limitation de la conservation — on
 * garde des IP et des corps de requête contenant des données personnelles.
 *
 * Lancement : `npm run logs:purge` (voir `clevercloud/cron.json` en production).
 * `DRY_RUN=1` compte sans supprimer.
 */
import { PrismaClient } from '@prisma/client';

import {
	DEFAULT_POLICY,
	retentionBuckets
} from '../src/server/open-api-log/policy';

const prisma = new PrismaClient();

const cutoff = (days: number): Date =>
	new Date(Date.now() - days * 24 * 60 * 60 * 1000);

async function main() {
	const dryRun = process.env.DRY_RUN === '1';
	const buckets = retentionBuckets();

	console.log(
		`Purge du journal open API${dryRun ? ' (DRY_RUN, aucune suppression)' : ''}`
	);

	let total = 0;

	// 1. Les routes explicitement configurées, avec leur rétention propre.
	for (const bucket of buckets) {
		const where = {
			method: bucket.method,
			route: bucket.route,
			created_at: { lt: cutoff(bucket.days) }
		};

		const count = dryRun
			? await prisma.apiKeyLog.count({ where })
			: (await prisma.apiKeyLog.deleteMany({ where })).count;

		if (count > 0) {
			console.log(
				`  ${bucket.method} ${bucket.route} (> ${bucket.days} j) : ${count}`
			);
		}

		total += count;
	}

	// 2. Tout le reste — routes non configurées, routes inconnues (404) et
	//    lignes historiques antérieures au journal d'audit, qui n'ont pas de
	//    `route` renseignée.
	//    L'exclusion porte sur le couple (méthode, route) et non sur la seule
	//    route : deux verbes sur un même chemin peuvent avoir des rétentions
	//    différentes. Les lignes à `route` nulle sont traitées à part, sinon la
	//    comparaison SQL les écarterait silencieusement.
	const restWhere = {
		created_at: { lt: cutoff(DEFAULT_POLICY.retentionDays) },
		OR: [
			{ route: null },
			{
				AND: buckets.map(bucket => ({
					NOT: { method: bucket.method, route: bucket.route }
				}))
			}
		]
	};

	const rest = dryRun
		? await prisma.apiKeyLog.count({ where: restWhere })
		: (await prisma.apiKeyLog.deleteMany({ where: restWhere })).count;

	if (rest > 0) {
		console.log(
			`  autres routes (> ${DEFAULT_POLICY.retentionDays} j) : ${rest}`
		);
	}

	total += rest;

	console.log(
		dryRun
			? `${total} lignes seraient supprimées.`
			: `${total} lignes supprimées.`
	);
}

main()
	.catch(e => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
