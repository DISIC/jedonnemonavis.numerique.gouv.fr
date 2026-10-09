import { loadEnvConfig } from '@next/env';
import { PrismaClient } from '@prisma/client';
import { encode } from 'next-auth/jwt';
import { spawnSync } from 'child_process';

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main() {
	const email = process.argv[2]?.toLowerCase();
	if (!email) throw new Error('Usage: yarn dev:login <email>');

	const appUrl = process.env.NEXTAUTH_URL ?? '';
	if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(appUrl)) {
		throw new Error(
			`dev:login only runs against localhost (NEXTAUTH_URL=${appUrl})`
		);
	}

	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error('JWT_SECRET is missing from .env');

	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) throw new Error(`No user ${email} in the local database`);

	const token = await encode({
		token: { email, acr: 'eidas2' },
		secret,
		maxAge: 24 * 60 * 60
	});

	const snippet = `(async () => { const { csrfToken } = await (await fetch('/api/auth/csrf')).json(); await fetch('/api/auth/signout', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ csrfToken, json: 'true' }) }); document.cookie = 'next-auth.session-token=${token}; path=/'; location.href = '/administration/dashboard/products'; })();`;

	const copied = spawnSync('pbcopy', { input: snippet }).status === 0;

	console.log(`${user.firstName} ${user.lastName} (${user.role})`);
	console.log(
		copied
			? `Copied to the clipboard: paste it in the browser console on ${appUrl}.`
			: `Paste this in the browser console on ${appUrl}:\n\n${snippet}`
	);
}

main()
	.catch(error => {
		console.error(error.message);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
