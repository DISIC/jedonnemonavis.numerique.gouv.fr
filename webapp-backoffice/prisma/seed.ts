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
import { take } from 'lodash';

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
	const bugTemplate = await prisma.formTemplate.upsert({
		where: { slug: 'bug' },
		update: createBugForm,
		create: createBugForm
	});

	await seed_bug_form_template_buttons(bugTemplate.id);
}

async function seed_root_form_template() {
	const rootTemplate = await prisma.formTemplate.upsert({
		where: { slug: 'root' },
		update: createRootForm,
		create: createRootForm
	});

	await seed_root_form_template_buttons(rootTemplate.id);
}

async function seed_root_form_template_buttons(formTemplateId: number) {
	await prisma.formTemplateButton.upsert({
		where: {
			form_template_id_slug: {
				form_template_id: formTemplateId,
				slug: 'default'
			}
		},
		update: {
			label: 'Je donne mon avis',
			order: 0,
			isDefault: true,
			variants: {
				deleteMany: {},
				create: [
					{
						style: 'solid',
						theme: 'light',
						image_url:
							'https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu-clair.svg',
						alt_text: 'Je donne mon avis'
					},
					{
						style: 'solid',
						theme: 'dark',
						image_url:
							'https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu-sombre.svg',
						alt_text: 'Je donne mon avis'
					},
					{
						style: 'outline',
						theme: 'light',
						image_url:
							'https://jedonnemonavis.numerique.gouv.fr/static/bouton-blanc-clair.svg',
						alt_text: 'Je donne mon avis'
					},
					{
						style: 'outline',
						theme: 'dark',
						image_url:
							'https://jedonnemonavis.numerique.gouv.fr/static/bouton-blanc-sombre.svg',
						alt_text: 'Je donne mon avis'
					}
				]
			}
		},
		create: {
			form_template: {
				connect: {
					id: formTemplateId
				}
			},
			label: 'Je donne mon avis',
			slug: 'default',
			order: 0,
			isDefault: true,
			variants: {
				create: [
					{
						style: 'solid',
						theme: 'light',
						image_url:
							'https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu-clair.svg',
						alt_text: 'Je donne mon avis'
					},
					{
						style: 'solid',
						theme: 'dark',
						image_url:
							'https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu-sombre.svg',
						alt_text: 'Je donne mon avis'
					},
					{
						style: 'outline',
						theme: 'light',
						image_url:
							'https://jedonnemonavis.numerique.gouv.fr/static/bouton-blanc-clair.svg',
						alt_text: 'Je donne mon avis'
					},
					{
						style: 'outline',
						theme: 'dark',
						image_url:
							'https://jedonnemonavis.numerique.gouv.fr/static/bouton-blanc-sombre.svg',
						alt_text: 'Je donne mon avis'
					}
				]
			}
		}
	});
}

async function seed_bug_form_template_buttons(formTemplateId: number) {
	const bugButtons = [
		{
			label: 'Une remarque ?',
			slug: 'remark',
			order: 0,
			isDefault: true
		},
		{
			label: 'Faire un retour',
			slug: 'feedback',
			order: 1,
			isDefault: false
		},
		{
			label: 'Signaler un problème',
			slug: 'problem',
			order: 2,
			isDefault: false
		}
	];

	for (const bugButton of bugButtons) {
		await prisma.formTemplateButton.upsert({
			where: {
				form_template_id_slug: {
					form_template_id: formTemplateId,
					slug: bugButton.slug
				}
			},
			update: {
				label: bugButton.label,
				order: bugButton.order,
				isDefault: bugButton.isDefault,
				variants: {
					deleteMany: {},
					create: [
						{
							style: 'solid',
							theme: null,
							image_url: '',
							alt_text: bugButton.label
						},
						{
							style: 'outline',
							theme: null,
							image_url: '',
							alt_text: bugButton.label
						}
					]
				}
			},
			create: {
				form_template: {
					connect: {
						id: formTemplateId
					}
				},
				label: bugButton.label,
				slug: bugButton.slug,
				order: bugButton.order,
				isDefault: bugButton.isDefault,
				variants: {
					create: [
						{
							style: 'solid',
							theme: 'light',
							image_url: `https://jedonnemonavis.numerique.gouv.fr/static/buttons/button-${bugButton.slug}-solid-light.svg`,
							alt_text: bugButton.label
						},
						{
							style: 'outline',
							theme: 'light',
							image_url: `https://jedonnemonavis.numerique.gouv.fr/static/buttons/button-${bugButton.slug}-outline-light.svg`,
							alt_text: bugButton.label
						},
						{
							style: 'solid',
							theme: 'dark',
							image_url: `https://jedonnemonavis.numerique.gouv.fr/static/buttons/button-${bugButton.slug}-solid-dark.svg`,
							alt_text: bugButton.label
						},
						{
							style: 'outline',
							theme: 'dark',
							image_url: `https://jedonnemonavis.numerique.gouv.fr/static/buttons/button-${bugButton.slug}-outline-dark.svg`,
							alt_text: bugButton.label
						}
					]
				}
			}
		});
	}
}

async function seed_users_products() {
	const promisesUsersAndEntities: Promise<User | Entity>[] = [];
	const promisesProducts: Promise<Product>[] = [];
	const promisesWLDs: Promise<WhiteListedDomain>[] = [];
	const formTemplates = await prisma.formTemplate.findMany({
		take: 100
	});
	const rootFormTemplate = formTemplates.find(ft => ft.slug === 'root');
	const bugFormTemplate = formTemplates.find(ft => ft.slug === 'bug');

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
			const formTemplate = formTemplates.find(
				ft => ft.slug === product.templateSlug
			);

			promisesProducts.push(
				prisma.product.create({
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
