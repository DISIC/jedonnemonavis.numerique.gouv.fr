import {
	Button,
	Entity,
	PrismaClient,
	Product,
	User,
	WhiteListedDomain
} from '@prisma/client';
import { users } from './seeds/users';
import { products } from './seeds/products';
import { whiteListedDomains } from './seeds/white-listed-domains';
import { entities } from './seeds/entities';
import { getRandomObjectFromArray } from '../utils/tools';
import { createButtons } from './seeds/buttons';

const prisma = new PrismaClient();

async function main() {
	const promises: Promise<User | Product | Entity>[] = [];
	const promisesWLDs: Promise<WhiteListedDomain>[] = [];

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

	entities.forEach(entity => {
		promises.push(
			prisma.entity.create({
				data: entity
			})
		);
	});

	products.forEach((product, index) => {
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
						connectOrCreate: {
							where: {
								name: (randomEntity as Entity).name
							},
							create: {
								...(randomEntity as Entity)
							}
						}
					},
					buttons: {
						create: createButtons(product.title) as Button[]
					},
					users: {
						create: {
							user_email: users.filter(u => u.active)[index % 2].email
						}
					}
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

	Promise.all([...promises, ...promisesWLDs]).then(responses => {
		let log: { [key: string]: User | Product | Entity | string } = {};
		responses.forEach((r, i) => {
			if ('email' in r) log[`${i}] user added`] = r.email;
			if ('domain' in r) log[`${i}] domain added : `] = r.domain;
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
