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
import { getRandomObjectFromArray, removeAccents } from '../src/utils/tools';
import { buttons } from './seeds/buttons';
import { Domain } from 'domain';

const prisma = new PrismaClient();

async function main() {
	const promisesUsersAndEntities: Promise<User | Entity>[] = [];
	const promisesProducts: Promise<Product>[] = [];
	const promisesWLDs: Promise<WhiteListedDomain>[] = [];

	users.forEach(user => {
		promisesUsersAndEntities.push(
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
		promisesUsersAndEntities.push(
			prisma.entity.upsert({
				where: {
					name: entity.name
				},
				update: {
					acronym: entity.acronym
				},
				create: entity
			})
		);
	});

	Promise.all(promisesUsersAndEntities).then(usersAndEntitiesResponses => {
		products.forEach((product, index) => {
			const randomEntity = getRandomObjectFromArray(entities) as Entity;
			promisesProducts.push(
				prisma.product.create({
					data: {
						...product,
						entity: {
							connect: {
								name: randomEntity.name
							}
						},
						buttons: {
							create: buttons.map(b => ({
								...b,
								product_id: b.product_id
							})) as Button[]
						},
						accessRights: {
							create: {
								user_email: users.filter(u => u.active && u?.role !== 'admin')[
									index % 2
								].email
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

		Promise.all([...promisesProducts, ...promisesWLDs]).then(responses => {
			let log: { [key: string]: User | Product | Entity | Domain | string } =
				{};
			usersAndEntitiesResponses.concat(responses as any).forEach((r, i) => {
				if ('email' in r) log[`${i}] user added`] = r.email;
				if ('domain' in r) log[`${i}] domain added : `] = r.domain as Domain;
				if ('title' in r) log[`product ${r.title}`] = r;
				if ('name' in r) log[`owner ${r.name}`] = r;
			});
			console.log(log);
		});
	});
}

async function formatted_title() {
	 

	const products = await prisma.product.findMany();

	products.forEach(async (p) => {
		const formattedTitle = removeAccents(p.title)
		console.log('processing product : ', p.title)
		await prisma.product.update({
			where: {
				id: p.id
			},
			data: {
				title_formatted: formattedTitle
			}
		});
	});

	const entities = await prisma.entity.findMany();

	entities.forEach(async (e) => {
		const formattedName = removeAccents(e.name)
		console.log('processing entity : ', e.name)
		await prisma.entity.update({
			where: {
				id: e.id
			},
			data: {
				name_formatted: formattedName
			}
		});
	});

}

formatted_title()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async e => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
