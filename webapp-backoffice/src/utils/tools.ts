import { AnswerIntention, Prisma, TypeAction } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { matchSorter } from 'match-sorter';
import { FormConfigHelper } from '../pages/administration/dashboard/product/[id]/forms/[form_id]/edit';
import { FormConfigWithChildren } from '../types/prismaTypesExtended';
import { trpc } from './trpc';
import { addDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export function isValidDate(dateString: string) {
	var regex = /^\d{4}-\d{2}-\d{2}$/;
	if (dateString.match(regex) === null) {
		return false;
	}
	var parts = dateString.split('-');
	var year = parseInt(parts[0], 10);
	var month = parseInt(parts[1], 10);
	var day = parseInt(parts[2], 10);
	if (year < 1000 || year > 3000 || month == 0 || month > 12) {
		return false;
	}
	var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
		monthLength[1] = 29;
	}
	return day > 0 && day <= monthLength[month - 1];
}

export function isValidEmail(email: string): boolean {
	const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
	return emailRegex.test(email);
}

export function generateRandomString(length: number = 8): string {
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let otp = '';
	for (let i = 0; i < length; i++) {
		otp += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return otp;
}

export function formatDateToFrenchString(tmpDate: string) {
	const date = new Date(tmpDate);

	if (!(date instanceof Date)) {
		throw new Error('Input is not a valid Date object');
	}

	const formatter = new Intl.DateTimeFormat('fr-FR', {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric'
	});

	return formatter.format(date);
}

export function formatDateToFrenchStringWithHour(tmpDate: string) {
	const date = new Date(tmpDate);

	if (!(date instanceof Date)) {
		throw new Error('Input is not a valid Date object');
	}

	const formatter = new Intl.DateTimeFormat('fr-FR', {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	});

	return formatter.format(date);
}

export function getNbPages(count: number, numberPerPage: number) {
	return count % numberPerPage === 0
		? count / numberPerPage
		: Math.trunc(count / numberPerPage) + 1;
}

export function getLastPage(count: number, numberPerPage: number): number {
	return Math.ceil(count / numberPerPage);
}

export function getRandomObjectFromArray<T>(array: T[]): T | undefined {
	if (array.length === 0) {
		return undefined; // Return undefined for an empty array
	}

	const randomIndex = Math.floor(Math.random() * array.length);
	return array[randomIndex];
}

export function extractDomainFromEmail(email: string): string | null {
	const regex = /@([A-Za-z0-9.-]+)$/;

	const match = email.match(regex);

	if (match && match.length > 1) {
		return match[1];
	} else {
		return null;
	}
}

export const getSeverity = (intention: string) => {
	switch (intention) {
		case 'bad':
			return 'error';
		case 'medium':
			return 'new';
		case 'good':
			return 'success';
		case 'neutral':
			return 'info';
		default:
			return 'info';
	}
};

export const retrieveButtonName = (buttonId: number) => {
	const { data: button } = trpc.button.getById.useQuery({
		id: buttonId
	});
	if (button?.data) return button.data?.title || '';
};

export const transformDateToFrenchReadable = (dateString: string): string => {
	const monthsInFrench = [
		'janvier',
		'février',
		'mars',
		'avril',
		'mai',
		'juin',
		'juillet',
		'août',
		'septembre',
		'octobre',
		'novembre',
		'décembre'
	];

	const [year, month, day] = dateString.split('-').map(Number);

	const monthInFrench = monthsInFrench[month - 1];

	return `${day === 1 ? '1er' : day} ${monthInFrench} ${year}`;
};

export const buildSearchQuery = (str: string) => {
	return str
		.split(' ')
		.filter(w => w.trim().length > 0)
		.map(word => `${word}:*`)
		.join('&');
};

export const normalizeString = (str: string): string => {
	return str
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // strip accents
		.replace(/[^\w\sÀ-ÿ\u0152\u0153'"]/gi, '') // allow œ/Œ; remove other special characters except letters, numbers, spaces, apostrophes, and quotes
		.trim();
};

export const alternativeString = (str: string): string => {
	return str.replace(/œ/g, 'oe').replace(/Œ/g, 'Oe');
};

export const createFilterOptionsWithArgument =
	(includeCreateOption: boolean) =>
	(
		options: { label: string; value?: number }[],
		state: { inputValue: string }
	) =>
		autocompleteFilterOptions(options, state, includeCreateOption);

export const autocompleteFilterOptions = (
	options: { label: string; value?: number }[],
	{ inputValue }: { inputValue: string },
	includeCreateOption: boolean = false
) => {
	const filteredOptions = matchSorter(options, inputValue.trim(), {
		keys: [item => item.label],
		threshold: matchSorter.rankings.CONTAINS
	}).slice(0, 4);

	if (includeCreateOption) {
		return [
			...filteredOptions,
			{ label: 'Créer une nouvelle organisation', value: -1 }
		];
	}

	return filteredOptions;
};

export const getDatesByShortCut = (shortcutDateSelected: string) => {
	const now = new Date();
	let newStartDate: Date;
	let newEndDate: Date = new Date();

	switch (shortcutDateSelected) {
		case 'one-year':
			newStartDate = new Date(
				now.getFullYear() - 1,
				now.getMonth(),
				now.getDate() + 2
			);
			break;
		case 'one-month':
			newStartDate = new Date(
				now.getFullYear(),
				now.getMonth() - 1,
				now.getDate() + 2
			);
			break;
		case 'one-week':
			newStartDate = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate() - 5
			);
			break;
		default:
			newStartDate = new Date();
	}

	return {
		startDate: newStartDate.toISOString().split('T')[0],
		endDate: newEndDate.toISOString().split('T')[0]
	};
};

export const calculateBucketsAverage = (
	buckets: any[],
	marks: Record<string, number>
) => {
	const count = buckets.reduce((sum, sb) => sum + sb.doc_count, 0);
	const average =
		buckets.reduce((sum, sb) => {
			const [, , intention] = sb.key.split('#');
			return sum + (marks[intention] || 0) * sb.doc_count;
		}, 0) / count;
	return { count, average: isNaN(average) ? 0 : average };
};

export const getReadableValue = (value: number) => {
	const readableValue = (Math.round(value * 10) / 10)
		.toString()
		.replace('.', ',');
	return readableValue.includes(',') ? readableValue : `${readableValue},0`;
};

export const getPercentageFromValue = (value: number) => {
	return getReadableValue(value * 10);
};

export const getDiffDaysBetweenTwoDates = (
	startDate: string,
	endDate: string
) => {
	var date1 = new Date(startDate);
	var date2 = new Date(endDate);
	var diff = Math.abs(date1.getTime() - date2.getTime());
	return Math.ceil(diff / (1000 * 3600 * 24));
};

export const getCalendarInterval = (nbDays: number) => {
	if (nbDays <= 31) return 'day';
	if (nbDays <= 62) return 'week';

	return 'month';
};

export const getCalendarFormat = (nbDays: number) => {
	if (nbDays <= 62) return 'd MMM y';

	return 'MMM y';
};

export const translateMonthToFrench = (dateStr: string) => {
	const monthLookup = {
		Jan: 'Jan',
		Feb: 'Fév',
		Mar: 'Mar',
		Apr: 'Avr',
		May: 'Mai',
		Jun: 'Juin',
		Jul: 'Juil',
		Aug: 'Août',
		Sep: 'Sep',
		Oct: 'Oct',
		Nov: 'Nov',
		Dec: 'Déc'
	};

	let day = '';
	let monthAbbreviation = '';
	let year = '';

	const parts = dateStr.split(' ');
	if (parts.length === 3) {
		day = parts[0] + ' ';
		monthAbbreviation = parts[1];
		year = parts[2];
	} else if (parts.length === 2) {
		monthAbbreviation = parts[0];
		year = parts[1];
	} else {
		return dateStr;
	}

	const translatedMonth =
		monthLookup[monthAbbreviation as keyof typeof monthLookup];

	if (!translatedMonth) return dateStr;

	return `${day}${translatedMonth} ${year}`;
};

export const getColorFromIntention = (intention: AnswerIntention) => {
	switch (intention) {
		case 'bad':
			return 'error';
		case 'medium':
			return 'new';
		case 'good':
			return 'success';
	}

	return 'info';
};

export const getHexaColorFromIntentionText = (intention: string) => {
	switch (intention) {
		case 'Pas bien':
		case 'Non':
			return '#ce0500';
		case 'Moyen':
			return '#716043';
		case 'Pas de réponse':
			return '#929292';
		case 'Très bien':
		case 'Oui':
			return '#18753c';
	}

	return '#0063cb';
};

export const formatNumberWithSpaces = (number: number): string => {
	let numStr = number.toString();

	return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const betaTestXwikiIds: number[] = [
	2404, 786, 812, 2542, 2672, 2674, 2675, 2737, 2802, 2904, 2939, 2980, 2982,
	2983, 2984, 2985, 2986, 3002, 3004, 3005, 3035, 3038, 3074, 3075, 3076, 3077,
	3078, 3079, 3080, 3081, 3082, 3083, 3084, 3085, 3086, 3087, 3088, 3089, 3090,
	3091, 3092, 3093, 3094, 3095, 3096, 3097, 3098, 3099, 3100, 3412, 3442, 3535,
	3671, 3733, 3865, 3426, 3427, 3428, 3429, 860, 863, 864, 867, 3378, 3720
];

export const oldFormFieldCodes = ['difficulties', 'easy'];

export const newFormFieldCodes = [
	'contact_tried',
	'contact_reached',
	'contact_satisfaction'
];

export const getKeysFromArrayOfObjects = (arrayOfObjects: any[]): string[] => {
	return arrayOfObjects.reduce((acc, obj) => {
		Object.keys(obj).forEach(key => {
			if (!acc.includes(key)) {
				acc.push(key);
			}
		});
		return acc;
	}, []);
};

export const actionMapping: Record<string, TypeAction> = {
	'product.getList': TypeAction.services_list_view,
	'product.create': TypeAction.service_create,
	'product.update': TypeAction.service_update,
	'accessRight.create': TypeAction.service_invite,
	'accessRight.update': TypeAction.service_uninvite,
	'product.archive': TypeAction.service_archive,
	'product.restore': TypeAction.service_restore,
	'review.getList': TypeAction.service_reviews_view,
	'button.getList': TypeAction.service_buttons_list_view,
	'entity.getList': TypeAction.organisations_list_view,
	'entity.create': TypeAction.organisation_create,
	'entity.update': TypeAction.organisation_update,
	'adminEntityRight.create': TypeAction.organisation_invite,
	'adminEntityRight.delete': TypeAction.organisation_uninvite,
	'button.create': TypeAction.service_button_create,
	'button.update': TypeAction.service_button_update,
	'button.delete': TypeAction.service_button_delete,
	'apiKey.create': TypeAction.service_apikeys_create,
	'apiKey.delete': TypeAction.service_apikeys_delete,
	'userEvent.getList': TypeAction.service_logs_view,
	'formConfig.create': TypeAction.form_config_create,
	'form.create': TypeAction.service_form_create,
	'form.update': TypeAction.service_form_edit,
	'form.delete': TypeAction.service_form_delete
};

export const handleActionTypeDisplay = (
	action: TypeAction,
	metadata: JsonValue,
	productTitle: string
) => {
	if (!metadata) return '';

	const metadataTyped = metadata as { json: { [key: string]: any } };
	switch (action) {
		case TypeAction.service_create:
			return `Création du service <strong>${productTitle}</strong>`;
		case TypeAction.service_update:
			return `Modification sur le service`;
		case TypeAction.service_archive:
			return `Archivage du service`;
		case TypeAction.service_restore:
			return `Restauration du service`;
		case TypeAction.service_invite:
			return `Invitation de l'utilisateur <strong>${metadataTyped.json.user_email !== null ? metadataTyped.json.user_email : metadataTyped.json.user_email_invite}</strong> au service en tant <strong>${metadataTyped.json.status === 'carrier_admin' ? "qu'utilisateur" : "qu'administrateur"}</strong>`;
		case TypeAction.service_uninvite:
			return `Suppression des droits <strong>${metadataTyped.json.status === 'carrier_admin' ? "d'utilisateur" : "d'administrateur"}</strong> pour <strong>${metadataTyped.json.user_email !== null ? metadataTyped.json.user_email : metadataTyped.json.user_email_invite}</strong> sur le service`;
		case TypeAction.organisation_create:
			return `Création de l'organisation <strong>${metadataTyped.json.entity_name}</strong>`;
		case TypeAction.organisation_update:
			return `Modification sur l'organisation du service`;
		case TypeAction.organisation_invite:
			return `Invitation de l'utilisateur <strong>${metadataTyped.json.user_email !== null ? metadataTyped.json.user_email : metadataTyped.json.user_email_invite}</strong> à l'organisation`;
		case TypeAction.organisation_uninvite:
			return `Retrait de l'utilisateur <strong>${metadataTyped.json.user_email !== null ? metadataTyped.json.user_email : metadataTyped.json.user_email_invite}</strong> de l'organisation <strong>${metadataTyped.json.entity_name}</strong>`;
		case TypeAction.service_button_create:
			return `Création de l'emplacement <strong>${metadataTyped.json.title}</strong>`;
		case TypeAction.service_button_update:
			return `Modification de l'emplacement <strong>${metadataTyped.json.title}</strong>`;
		case TypeAction.service_button_delete:
			return `Fermeture de l'emplacement <strong>${metadataTyped.json.title}</strong>`;
		case TypeAction.service_apikeys_create:
			return `Création d'une clé API`;
		case TypeAction.service_apikeys_delete:
			return `Suppression d'une clé API`;
		case TypeAction.form_config_create:
			return `Mise en place du formulaire version ${metadataTyped.json.version}`;
		case TypeAction.service_form_create:
			return `Création du formulaire <strong>${metadataTyped.json.title}</strong>`;
		case TypeAction.service_form_edit:
			return `Modification du formulaire <strong>${metadataTyped.json.form.title}</strong>`;
		case TypeAction.service_form_delete:
			return `Fermeture du formulaire <strong>${metadataTyped.json.form.title}</strong>`;
	}
};

export const filtersLabel = [
	{ value: 'service_update', label: 'Modification du service' },
	{ value: 'service_archive', label: 'Archivage du service' },
	{ value: 'service_restore', label: 'Restauration du service' },
	{ value: 'service_invite', label: "Invitation d'utilisateur au service" },
	{ value: 'service_uninvite', label: "Retrait d'utilisateur du service" },
	{ value: 'organisation_update', label: "Modification sur l'organisation" },
	{
		value: 'organisation_invite',
		label: "Invitation d'utilisateur dans une organisation"
	},
	{
		value: 'organisation_uninvite',
		label: "Retrait d'utilisateur d'une organisation"
	},
	{ value: 'service_button_create', label: "Création d'un emplacement" },
	{ value: 'service_button_update', label: "Modification d'un emplacement" },
	{ value: 'service_button_delete', label: "Suppression d'un emplacement" },
	{ value: 'service_apikeys_create', label: "Création d'une clé API" },
	{ value: 'service_apikeys_delete', label: "Suppression d'une clé API" },
	{ value: 'form_config_create', label: 'Modification du formulaire' },
	{ value: 'service_form_create', label: 'Création d’un formulaire' },
	{ value: 'service_form_edit', label: 'Modification d’un formulaire' },
	{ value: 'service_form_delete', label: 'Suppression d’un formulaire' }
];

export const getHelperFromFormConfig = (
	formConfig: FormConfigWithChildren | undefined
): FormConfigHelper => {
	return {
		displays:
			formConfig?.form_config_displays.map(fcd => ({
				hidden: fcd.hidden,
				parent_id: fcd.parent_id,
				kind: fcd.kind
			})) || [],
		labels:
			formConfig?.form_config_labels.map(fcl => ({
				label: fcl.label,
				parent_id: fcl.parent_id,
				kind: fcl.kind
			})) || []
	};
};

export const getHasConfigChanged = (
	firstConfig: FormConfigHelper,
	secondConfig: FormConfigHelper
) => {
	return (
		JSON.stringify({
			displays: firstConfig.displays.sort((a, b) => a.parent_id - b.parent_id),
			labels: firstConfig.labels.sort((a, b) => a.parent_id - b.parent_id)
		}) !==
		JSON.stringify({
			displays: secondConfig.displays.sort((a, b) => a.parent_id - b.parent_id),
			labels: secondConfig.labels.sort((a, b) => a.parent_id - b.parent_id)
		})
	);
};

export const normalizeHtml = (html: string): string => {
	return html
		.replace(/<\/?[^>]+(>|$)/g, '') // Retire toutes les balises HTML
		.replace(/\s+/g, ' ') // Normalise les espaces multiples en un seul
		.replace(/&nbsp;/g, ' ') // Remplace les espaces insécables
		.replace(/&lt;/g, '<') // Remplace les entités HTML courantes
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.trim(); // Supprime les espaces en début et fin
};

export const shouldSendEmailsAboutDeletion = (
	isCurrentDeleted?: boolean | null,
	isUpdatedDeleted?: boolean | null,
	isParentDeleted?: boolean | null
): boolean => {
	return !isCurrentDeleted && !!isUpdatedDeleted && !isParentDeleted;
};

export const getDateWhereFromUTCRange = (
	start_date?: string,
	end_date?: string
) => {
	const tz = 'Europe/Paris';
	const range: Prisma.DateTimeFilter = {};

	if (start_date) {
		range.gte = toZonedTime(`${start_date}T00:00:00`, tz);
	}

	if (end_date) {
		const endDateParisMidnight = addDays(new Date(`${end_date}T00:00:00`), 1);
		range.lt = endDateParisMidnight;
	}

	return range;
};
