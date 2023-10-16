import { Product, User } from '@prisma/client';
import { Session } from 'next-auth';

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

export function getOTPEmailHtml(code: string) {
	return `
		<!DOCTYPE html>
		<html>
			<head>
				<style>
					body {
						font-family: Arial, sans-serif;
					}
					.container {
						max-width: 600px;
						margin: 0 auto;
						padding: 20px;
					}
					.code {
						font-size: 24px;
						font-weight: bold;
						margin: 20px 0;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<p>Bonjour,</p>

					<p>
						Vous vous connectez pour la première fois à "Je donne mon avis" avec votre ancien compte observatoire.
						Afin de confirmer votre identité et de définir un nouveau mot de passe, veuillez utiliser le mot de passe temporaire suivant :
					</p>

					<p class="code">${code}</p>

					<p>
						Ce code est valable pour les 15 prochaines minutes. Si vous n'avez pas demandé ce
						code, veuillez ignorer cet e-mail.
					</p>

					<p>
						Merci,<br/>
						L'équipe je donne mon avis
					</p>
				</div>
			</body>
		</html>
	`;
}

export function getRegisterEmailHtml(token: string) {
	const link = `${
		process.env.NODEMAILER_BASEURL
	}/register/validate?${new URLSearchParams({ token })}`;

	return `
		<!DOCTYPE html>
		<html>
			<head>
				<style>
					body {
						font-family: Arial, sans-serif;
					}
					.container {
						max-width: 600px;
						margin: 0 auto;
						padding: 20px;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<p>Bonjour,</p>

					<p>
						Vous venez de créer un compte "Je donne mon avis". Afin de valider votre compte, veuillez cliquer sur le lien ci-dessous.
					</p>

					<a href="${link}" target="_blank">${link}</a>

					<p>
						Cette étape est obligatoire pour pouvoir vous connecter à votre compte. Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet e-mail.
					</p>

					<p>
						Merci,<br/>
						L'équipe je donne mon avis
					</p>
				</div>
			</body>
		</html>
	`;
}

export function getUserInviteEmailHtml(
	email: string,
	inviteToken: string,
	productTitle: string
) {
	const link = `${
		process.env.NODEMAILER_BASEURL
	}/register?${new URLSearchParams({ email, inviteToken })}`;

	return `
		<!DOCTYPE html>
		<html>
			<head>
				<style>
					body {
						font-family: Arial, sans-serif;
					}
					.container {
						max-width: 600px;
						margin: 0 auto;
						padding: 20px;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<p>Bonjour,</p>

					<p>
						Quelqu'un vous a invité à rejoindre "Je donne mon avis" en tant que porteur pour le produit "${productTitle}". Afin de créer votre compte, veuillez cliquer sur le lien ci-dessous.
					</p>

					<a href="${link}" target="_blank">${link}</a>

					<p>
						Merci,<br/>
						L'équipe je donne mon avis
					</p>
				</div>
			</body>
		</html>
	`;
}

export function getInviteEmailHtml(
	contextUser: Session['user'],
	productTitle: string
) {
	const link = process.env.NODEMAILER_BASEURL;

	return `
		<!DOCTYPE html>
		<html>
			<head>
				<style>
					body {
						font-family: Arial, sans-serif;
					}
					.container {
						max-width: 600px;
						margin: 0 auto;
						padding: 20px;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<p>Bonjour,</p>

					<p>
						${contextUser?.name} vous a invité à rejoindre le produit numérique "${productTitle}" sur "Je donne mon avis".
					</p>

					<p>
						Vous pouvez vous connecter à votre compte en cliquant sur le lien ci-dessous.
					</p>

					<a href="${link}" target="_blank">${link}</a>

					<p>
						Merci,<br/>
						L'équipe je donne mon avis
					</p>
				</div>
			</body>
		</html>
	`;
}
