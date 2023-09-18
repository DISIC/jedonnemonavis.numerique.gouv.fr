import { Owner, PrismaClient, Product, User } from '@prisma/client';
import { users } from './seeds/users';
import { products } from './seeds/products';
import { owners } from './seeds/owner';
import { getRandomObjectFromArray } from '../utils/tools';

const prisma = new PrismaClient();

async function main() {
	const promises: Promise<User | Product | Owner>[] = [];

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

	products.forEach(product => {
		const randomOwner = getRandomObjectFromArray(owners);
		promises.push(
			prisma.product.upsert({
				where: {
					title: product.title
				},
				update: {},
				create: {
					...product,
					owner: {
						create: {
							...(randomOwner as Owner)
						}
					}
				}
			})
		);
	});

	owners.forEach(owner => {
		promises.push(
			prisma.owner.upsert({
				where: {
					name: owner.name
				},
				update: {},
				create: {
					...owner
				}
			})
		);
	});

	Promise.all(promises).then(responses => {
		let log: { [key: string]: User | Product | Owner } = {};
		responses.forEach(r => {
			if ('email' in r) log[`user ${r.email}`] = r;
			if ('title' in r) log[`product ${r.title}`] = r;
			if ('name' in r) log[`owner ${r.name}`] = r;
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
