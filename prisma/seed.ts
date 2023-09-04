import { PrismaClient, User } from '@prisma/client';
import { users } from './seeds/users';

const prisma = new PrismaClient();

async function main() {
	const promises: Promise<User>[] = [];

	users.forEach(user => {
		promises.push(
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

	Promise.all(promises).then(responses => {
		let log: { [key: string]: User } = {};
		responses.forEach(r => {
			if ('email' in r) log[`user ${r.email}`] = r;
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
