import { Entity, PrismaClient, Product, User } from '@prisma/client';
import { users } from './seeds/users';
import { products } from './seeds/products';
import { entities } from './seeds/entities';
import { getRandomObjectFromArray } from '../utils/tools';

const prisma = new PrismaClient();

async function main() {
	const promises: Promise<User | Product | Entity>[] = [];

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
		const randomEntity = getRandomObjectFromArray(entities);
		promises.push(
			prisma.product.upsert({
				where: {
					title: product.title
				},
				update: {},
				create: {
					...product,
					entity: {
						create: {
							...(randomEntity as Entity)
						}
					}
				}
			})
		);
	});

	// entities.forEach(entity => {
	// 	promises.push(
	// 		prisma.entity.upsert({
	// 			where: {
	// 				name: entity.name
	// 			},
	// 			update: {},
	// 			create: {
	// 				...entity
	// 			}
	// 		})
	// 	);
	// });

	Promise.all(promises).then(responses => {
		let log: { [key: string]: User | Product | Entity } = {};
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
