import 'dotenv/config';
import { Client as ElkClient } from '@elastic/elasticsearch';
import fs from 'fs';
import path from 'path';

const INDICES = ['jdma-answers', 'jdma-answers-tokens'];

async function main() {
	if (!process.env.ES_ADDON_URI) {
		console.warn('[reset-elk] ES_ADDON_URI absent, skip.');
		return;
	}

	const caCrtPath = path.resolve(process.cwd(), './certs/ca/ca.crt');
	const tls = fs.existsSync(caCrtPath)
		? { ca: fs.readFileSync(caCrtPath), rejectUnauthorized: false }
		: { rejectUnauthorized: false };

	const elkClient = new ElkClient({
		node: process.env.ES_ADDON_URI,
		auth: {
			username: process.env.ES_ADDON_USER as string,
			password: process.env.ES_ADDON_PASSWORD as string
		},
		tls
	});

	for (const index of INDICES) {
		try {
			const { deleted } = await elkClient.deleteByQuery({
				index,
				refresh: true,
				conflicts: 'proceed',
				body: { query: { match_all: {} } }
			});
			console.log(`[reset-elk] ${index}: ${deleted ?? 0} docs supprimés.`);
		} catch (err: any) {
			const type = err?.meta?.body?.error?.type;
			if (type === 'index_not_found_exception') {
				console.log(`[reset-elk] ${index}: index absent, skip.`);
			} else {
				console.warn(
					`[reset-elk] ${index}: échec (${err?.message ?? err}), skip.`
				);
			}
		}
	}
}

main()
	.catch(err => {
		console.warn(`[reset-elk] ELK injoignable (${err?.message ?? err}), skip.`);
	})
	.finally(() => process.exit(0));
