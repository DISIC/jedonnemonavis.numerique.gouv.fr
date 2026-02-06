import {
	Button,
	Entity,
	PrismaClient,
	Product,
	User,
	WhiteListedDomain
} from '@prisma/client';
import { Domain } from 'domain';
import { getRandomObjectFromArray, normalizeString } from '../src/utils/tools';
import { buttons } from './seeds/buttons';
import { entities } from './seeds/entities';
import { createRootForm } from './seeds/forms/root';
import { createBugForm } from './seeds/forms/bug';
import { products } from './seeds/products';
import { users } from './seeds/users';
import { whiteListedDomains } from './seeds/white-listed-domains';

const prisma = new PrismaClient();

async function main() {
	const command = process.argv[2];

	switch (command) {
		case 'seedBugFormTemplate':
			await seed_bug_form_template();
			break;
		case 'seedRootFormTemplate':
			await seed_root_form_template();
			break;
		case 'seedUsersProducts':
			await seed_root_form_template();
			await seed_bug_form_template();
			await seed_users_products();
			break;
		case 'seedFormattedTitles':
			await formatted_title();
			break;
		case 'whiteList':
			await Promise.all(getWLDPromises());
			break;
		default:
			await seed_root_form_template();
			await seed_bug_form_template();
			await seed_users_products();
			await formatted_title();
	}
}

function getWLDPromises() {
	const promisesWLDs: Promise<WhiteListedDomain>[] = [];

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

	return promisesWLDs;
}

async function seed_bug_form_template() {
	await prisma.formTemplate.upsert({
		where: { slug: 'bug' },
		update: createBugForm,
		create: createBugForm
	});
}

async function seed_root_form_template() {
	await prisma.formTemplate.upsert({
		where: { slug: 'root' },
		update: createRootForm,
		create: createRootForm
	});
}

async function seed_users_products() {
	const promisesUsersAndEntities: Promise<User | Entity>[] = [];
	const promisesProducts: Promise<Product>[] = [];
	const promisesWLDs: Promise<WhiteListedDomain>[] = [];
	const rootFormTemplate = await prisma.formTemplate.findUnique({
		where: { slug: 'root' }
	});

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
						accessRights: {
							create: {
								user_email: users.filter(u => u.active && u?.role !== 'admin')[
									index % 2
								].email,
								status: 'carrier_admin'
							}
						},
						forms: {
							create: [
								{
									title: rootFormTemplate?.title,
									form_template: {
										connect: {
											slug: 'root'
										}
									},
									buttons: {
										create: buttons as Button[]
									}
								}
							]
						}
					}
				})
			);
		});

		const promisesWLDs = getWLDPromises();

		Promise.all([...promisesProducts, ...promisesWLDs]).then(responses => {
			let log: { [key: string]: User | Product | Entity | Domain | string } =
				{};
			usersAndEntitiesResponses.concat(responses as any).forEach((r, i) => {
				if ('email' in r) log[`${i}] user added`] = r.email;
				if ('domain' in r) log[`${i}] domain added : `] = r.domain as Domain;
				if ('title' in r) log[`product ${r.title}`] = r;
				if ('name' in r) log[`owner ${r.name}`] = r;
			});
		});
	});
}

async function formatted_title() {
	const products = await prisma.product.findMany();

	products.forEach(async p => {
		const formattedTitle = normalizeString(p.title);
		console.log('processing product : ', p.title);
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

	entities.forEach(async e => {
		const formattedName = normalizeString(e.name);
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

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async e => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
