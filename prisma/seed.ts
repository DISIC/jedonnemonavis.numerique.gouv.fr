import { PrismaClient, User, WhiteListedDomain } from '@prisma/client';
import { users } from './seeds/users';
import { whiteListedDomains } from './seeds/white-listed-domains';

const prisma = new PrismaClient();

async function main() {
	const promisesUsers: Promise<User>[] = [];
	const promisesWLDs: Promise<WhiteListedDomain>[] = [];

	users.forEach(user => {
		promisesUsers.push(
			prisma.user.upsert({
				where: {
					email: user.email
				},
				update: {},
				create: {
					...user
				}
			})
		);
	});

	whiteListedDomains.forEach(wld => {
		promisesWLDs.push(
			prisma.whiteListedDomain.upsert({
				where: {
					domain: wld.domain
				},
				update: {},
				create: {
					...wld
				}
			})
		);
	});

	Promise.all([...promisesUsers, ...promisesWLDs]).then(responses => {
		let log: { [key: string]: string } = {};
		responses.forEach((r, i) => {
			if ('email' in r) log[`${i}] user added`] = r.email;
			if ('domain' in r) log[`${i}] domain added : `] = r.domain;
		});
		console.log(log);
	});
}
main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async e => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
