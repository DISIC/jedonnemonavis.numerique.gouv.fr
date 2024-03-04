import { trpc } from "./trpc";

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

export function getNbPages(count: number, numberPerPage: number) {
	return count % numberPerPage === 0
		? count / numberPerPage
		: Math.trunc(count / numberPerPage) + 1;
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
