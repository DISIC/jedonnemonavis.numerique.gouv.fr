import {
	Button,
	Entity,
	PrismaClient,
	WhiteListedDomain
} from '@prisma/client';
import { Domain } from 'domain';
import { getRandomObjectFromArray, normalizeString } from '../src/utils/tools';
import { buttons } from './seeds/buttons';
import { entities } from './seeds/entities';
import {
	createBugForm,
	seed_bug_form_template_buttons
} from './seeds/forms/bug';
import {
	createRootForm,
	seed_root_form_template_buttons
} from './seeds/forms/root';
import { products } from './seeds/products';
import { users } from './seeds/users';
import { whiteListedDomains } from './seeds/white-listed-domains';

const prisma = new PrismaClient();

async function main() {
	const command = process.argv[2];

	switch (command) {
		case 'seedRootFormTemplateButtons':
			const rootTemplate = await prisma.formTemplate.findFirst({
				where: { slug: 'root' }
			});

			if (!rootTemplate) {
				console.log('Error : missing root template form');
				break;
			}

			await seed_root_form_template_buttons(prisma, rootTemplate.id);
			break;
		case 'seedBugFormTemplateButtons':
			const bugTemplate = await prisma.formTemplate.findFirst({
				where: { slug: 'bug' }
			});

			if (!bugTemplate) {
				console.log('Error : missing bug template form');
				break;
			}

			await seed_bug_form_template_buttons(prisma, bugTemplate.id);
			break;
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
	const bugTemplate = await prisma.formTemplate.upsert({
		where: { slug: 'bug' },
		update: createBugForm,
		create: createBugForm
	});

	await seed_bug_form_template_buttons(prisma, bugTemplate.id);
}

async function seed_root_form_template() {
	const rootTemplate = await prisma.formTemplate.upsert({
		where: { slug: 'root' },
		update: createRootForm,
		create: createRootForm
	});

	await seed_root_form_template_buttons(prisma, rootTemplate.id);
}

async function seed_users_products() {
	const formTemplates = await prisma.formTemplate.findMany({
		take: 100
	});
	const rootFormTemplate = formTemplates.find(ft => ft.slug === 'root');
	const bugFormTemplate = formTemplates.find(ft => ft.slug === 'bug');

	for (const user of users) {
		await prisma.user.upsert({
			where: { email: user.email },
			update: {},
			create: {
				...user,
				details: { create: { level: 'expert', referralSource: 'seeding' } }
			}
		});
	}

	for (const entity of entities) {
		await prisma.entity.upsert({
			where: { name: entity.name },
			update: { acronym: entity.acronym },
			create: entity
		});
	}

	for (let index = 0; index < products.length; index++) {
		const product = products[index];
		const randomEntity = getRandomObjectFromArray(entities) as Entity;
		const formTemplate = formTemplates.find(
			ft => ft.slug === product.templateSlug
		);

		await prisma.product.create({
			data: {
				title: product.title,
				isPublic: product.isPublic,
				urls: product.urls,
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
							title: formTemplate?.title,
							form_template: {
								connect: {
									slug: formTemplate?.slug || 'root'
								}
							},
							buttons: {
								create: buttons as Button[]
							}
						},
						...(index === 0
							? [
									{
										title: bugFormTemplate?.title,
										form_template: {
											connect: {
												slug: 'bug'
											}
										},
										buttons: {
											create: buttons as Button[]
										}
									}
							  ]
							: [])
					]
				}
			}
		});
	}

	await Promise.all(getWLDPromises());
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
