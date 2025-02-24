import { NotificationFrequency } from '@prisma/client';
import { Session } from 'next-auth';
import { formatDateToFrenchString } from './tools';

function getEmailWithLayout(content: string) {
	return `
	<!DOCTYPE html>
	<html>
		<head>
			<style>
				body {
					font-family: Arial, sans-serif;
				}
				.container {
					max-width: 640px;
					margin: 0 auto;
					padding: 20px;
				}
				.code {
					font-size: 24px;
					font-weight: bold;
					margin: 20px 0;
				}
				.footer {
					font-size: 12px;
					padding: 16px 32px;
					background: #F5F5FE;
					margin-top: 30px;
				}
				.header {
					margin-bottom: 30px;
				}
				.header img {
					height: 88px;
				}
				blockquote {
					background-color: #f3f3f3;
					margin: 0;
					padding: 20px;
				}
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<img src="https://jedonnemonavis.numerique.gouv.fr/assets/JDMA_Banner.png"/>
				</div>
				${content}
				<p>
					Besoin d’aide ? Vous pouvez nous écrire à l'adresse <a href="mailto:contact.jdma@design.numerique.gouv.fr">contact.jdma@design.numerique.gouv.fr</a>.<br/>
					La Brigade d'Intervention du Numérique (BIN).
				</p>
				<div class="footer">
					<p>
						Ce message est envoyé automatiquement par le site <a href="https://jedonnemonavis.numerique.gouv.fr/" target="_blank">Je donne mon avis</a>, développé par <a href="https://design.numerique.gouv.fr/" target="_blank">la Brigade d'Intervention Numérique</a>,
						propulsé par la <a href="https://www.numerique.gouv.fr/" target="_blank">Direction interministérielle du numérique</a>.
					</p>
					<p>
						Pour toute question, merci de nous contacter à <a href="mailto:contact.jdma@design.numerique.gouv.fr">contact.jdma@design.numerique.gouv.fr</a>.
					</p>
				</div>
			</div>
		</body>
	</html>
	`;
}

export function getOTPEmailHtml(code: string) {
	return getEmailWithLayout(`
		<p>Bonjour,</p>

		<p>
			Vous vous connectez pour la première fois à la plateforme « <a href="${process.env.NODEMAILER_BASEURL}" target="_blank">Je donne mon avis</a> »
			avec votre ancien compte <a href="https://observatoire.numerique.gouv.fr/" target="_blank">Observatoire / Vos démarches essentielles</a>.
			Afin de confirmer votre identité, veuillez utiliser le mot de passe temporaire suivant :
		</p>

		<p class="code">${code}</p>

		<p>
			Ce code est valable pour les 15 prochaines minutes. Si vous n'avez pas demandé ce code, veuillez ignorer cet e-mail.
		</p>
	`);
}

export function getRegisterEmailHtml(token: string) {
	const link = `${
		process.env.NODEMAILER_BASEURL
	}/register/validate?${new URLSearchParams({ token })}`;

	return getEmailWithLayout(`
		<p>Bonjour,</p>

		<p>
			Vous venez de créer un compte sur la plateforme « <a href="${process.env.NODEMAILER_BASEURL}" target="_blank">Je donne mon avis</a> ». Afin de valider votre compte, veuillez cliquer sur le lien ci-dessous.
		</p>

		<a href="${link}" target="_blank">${link}</a>

		<p>
			Cette étape est obligatoire pour pouvoir vous connecter à votre compte. Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet e-mail.
		</p>
	`);
}

export function getUserInviteEntityEmailHtml(
	contextUser: Session['user'],
	email: string,
	inviteToken: string,
	entityName: string
) {
	const link = `${
		process.env.NODEMAILER_BASEURL
	}/register?${new URLSearchParams({ email, inviteToken })}`;

	return getEmailWithLayout(`
		<p>Bonjour,</p>

		<p>
			${contextUser?.name} vous invite à rejoindre la plateforme « <a href="${process.env.NODEMAILER_BASEURL}" target="_blank">Je donne mon avis</a> » et vous donne accès à l'organisation « ${entityName} ». Afin de créer votre compte, veuillez cliquer sur le lien ci-dessous.
		</p>

		<a href="${link}" target="_blank">${link}</a>
	`);
}

export function getUserInviteEmailHtml(
	contextUser: Session['user'],
	email: string,
	inviteToken: string,
	productTitle: string
) {
	const link = `${
		process.env.NODEMAILER_BASEURL
	}/register?${new URLSearchParams({ email, inviteToken })}`;

	return getEmailWithLayout(`
		<p>Bonjour,</p>

		<p>
			${contextUser?.name} vous invite à rejoindre la plateforme « <a href="${process.env.NODEMAILER_BASEURL}" target="_blank">Je donne mon avis</a> » et vous donne accès à la démarche « ${productTitle} ». Afin de créer votre compte, veuillez cliquer sur le lien ci-dessous.
		</p>

		<a href="${link}" target="_blank">${link}</a>
	`);
}

export function getInviteEmailHtml(
	contextUser: Session['user'],
	productTitle: string
) {
	const link = process.env.NODEMAILER_BASEURL;

	return getEmailWithLayout(`
		<p>Bonjour,</p>

		<p>
			${contextUser?.name} vient de vous donner accès à la démarche « ${productTitle} » sur la plateforme « <a href="${process.env.NODEMAILER_BASEURL}" target="_blank">Je donne mon avis</a> ».
		</p>

		<p>
			Vous pouvez vous connecter à votre compte en cliquant sur le lien ci-dessous.
		</p>

		<a href="${link}" target="_blank">${link}</a>
	`);
}

export function getResetPasswordEmailHtml(token: string) {
	const link = `${
		process.env.NODEMAILER_BASEURL
	}/reset-password?${new URLSearchParams({ token })}`;

	return getEmailWithLayout(`
		<p>Bonjour,</p>

		<p>
			Vous avez demandé à réinitialiser votre mot de passe sur la plateforme « <a href="${process.env.NODEMAILER_BASEURL}" target="_blank">Je donne mon avis</a> ». Afin de choisir un nouveau mot de passe, veuillez cliquer sur le lien ci-dessous.
		</p>

		<a href="${link}" target="_blank">${link}</a>

		<p>
			Ce lien est valable pour les 15 prochaines minutes. Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.
		</p>
	`);
}

export function getInviteEntityEmailHtml(
	contextUser: Session['user'],
	entityName: string
) {
	const link = process.env.NODEMAILER_BASEURL;

	return getEmailWithLayout(`
		<p>Bonjour,</p>

		<p>
			${contextUser?.name} vient de vous donner accès à l'organisation « ${entityName} » sur la plateforme « <a href="${process.env.NODEMAILER_BASEURL}" target="_blank">Je donne mon avis</a> ».
		</p>

		<p>
			Vous pouvez vous connecter à votre compte en cliquant sur le lien ci-dessous.
		</p>

		<a href="${link}" target="_blank">${link}</a>
	`);
}

export function getUserRequestAcceptedEmailHtml() {
	const link = `${process.env.NODEMAILER_BASEURL}/login`;

	return getEmailWithLayout(`
		<p>Bonjour,</p>

		<p>
			Votre demande d'accès à la plateforme « <a href="${process.env.NODEMAILER_BASEURL}" target="_blank">Je donne mon avis</a> » a été acceptée.
		</p>

		<p>
			Vous pouvez vous connecter à votre compte en cliquant sur le lien ci-dessous.
		</p>

		<a href="${link}" target="_blank">${link}</a>
	`);
}

export function getUserRequestRefusedEmailHtml(message?: string) {
	return getEmailWithLayout(`
		<p>Bonjour,</p>

		<p>
			Votre demande d'accès à la plateforme « <a href="${
				process.env.NODEMAILER_BASEURL
			}" target="_blank">Je donne mon avis</a> » a été refusée.
		</p>

		${
			message
				? `<p>Message de l'adminstrateur :</p><blockquote>${message}</blockquote><br>`
				: ``
		}

	`);
}

export function getProductArchivedEmail(
	contextUser: Session['user'],
	productTitle: string
) {
	return getEmailWithLayout(`
		<p>Bonjour,</p>

		<p>
			${contextUser.name} vient de supprimer le service « ${productTitle} » sur la plateforme <a href="${process.env.NODEMAILER_BASEURL}" target="_blank">Je donne mon avis</a>.
			Vous n'avez plus accès aux avis et verbatims de ce service, et les utilisateurs de ce service n'ont plus accès au formulaire.
		</p>

		<p>
			Vous pouvez restaurer ce service depuis <a href="${process.env.NODEMAILER_BASEURL}/administration/dashboard/products" target="_blank">la page services</a> pendant 6 mois.
			Après ce délai, le service sera définitivement supprimé.
		</p>
	`);
}

export function getProductRestoredEmail(
	contextUser: Session['user'],
	productTitle: string,
	productId: number
) {
	return getEmailWithLayout(`
		<p>Bonjour,</p>

		<p>
			${contextUser.name} vient de restaurer le service « ${productTitle} » sur la plateforme <a href="${process.env.NODEMAILER_BASEURL}" target="_blank">Je donne mon avis</a>.
		</p>

		<p>
			Vous pouvez à nouveau <a href="${process.env.NODEMAILER_BASEURL}/administration/dashboard/product/${productId.toString()}/stats" target="_blank">accéder aux avis et aux verbatims de ce service</a>.
		</p>
	`);
}

export function getEmailNotificationsHtml(
	userId: number,
	frequency: NotificationFrequency,
	totalNbReviews: number,
	startDate: Date,
	endDate: Date,
	products: {
		title: string;
		id: number;
		nbReviews: number;
	}[]
) {
	const frequencyLabel = () => {
		switch (frequency) {
			case 'daily':
				return `en date du ${formatDateToFrenchString(startDate.toString())}`;
			case 'weekly':
				return `dans les 7 derniers jours (du ${formatDateToFrenchString(startDate.toString())} au ${formatDateToFrenchString(endDate.toString())})`;
			case 'monthly':
				return `dans le dernier mois calendaire (du ${formatDateToFrenchString(startDate.toString())} au ${formatDateToFrenchString(endDate.toString())})`;
			default:
				return `en date du ${formatDateToFrenchString(startDate.toString())}`;
		}
	};

	const displayTableFrequenceLabel =
		frequency === 'daily'
			? 'hier'
			: frequency === 'weekly'
				? 'la semaine dernière'
				: 'le mois dernier';

	const jdmaUrl = process.env.NODEMAILER_BASEURL;

	const formatNbReviews = (nbReviews: number) => {
		//add a space every 3 digits
		return nbReviews.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	};

	return getEmailWithLayout(`
		<p>Bonjour,</p>
		<br />
		<p>Vous avez eu un total de ${formatNbReviews(totalNbReviews)} avis ${frequencyLabel()} sur vos services dans Je donne mon avis.</p>
		<br />
		<div style="margin-top: 64px; margin-bottom: 48px;">
			<table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
			<thead>
				<tr>
				<th style="text-align: left; font-size: 14px; padding: 8px 0;">Service</th>
				<th style="text-align: right; font-size: 14px; padding: 8px 0;">Avis reçu ${displayTableFrequenceLabel}</th>
				</tr>
			</thead>
			<tbody>
				${products
					.map(
						p => `
				<tr style="border: 1px solid #e0e0e0; margin-top: 10px">
					<td style="padding: 16px; font-size: 16px; color: #161616; font-weight: bold; line-height: 24px;">
					${p.title}
					</td>
					<td style="padding: 16px; text-align: right;">
					<p style="margin: 0; font-weight: bold; color: #0063CB; font-size: 14px; line-height: 24px;">+${formatNbReviews(p.nbReviews)}</p>
					<a href="${jdmaUrl}/administration/dashboard/product/${p.id.toString()}/reviews?fromMail=true"
						target="_blank"
						style="font-size: 12px; line-height: 20px; color: #0063CB; text-decoration: underline;">Voir les avis</a>
					</td>
				</tr>
				<tr>
				  <td style="height: 16px;"></td> <!-- Espacement -->
				</tr>
				`
					)
					.join('')}
			</tbody>
			</table>
		</div>
		<a href="${jdmaUrl}/administration/dashboard/products" target="_blank"
			style="font-size: 14px; color: #0063CB; text-decoration: underline;">
			Retrouvez tous vos services sur votre tableau de bord JDMA
		</a>
		<p>
			Pour changer la fréquence de cette synthèse ou ne plus la recevoir du tout,
			<a href="${jdmaUrl}/administration/dashboard/user/${userId}/notifications"
			target="_blank"
			style="color: #0063CB; text-decoration: underline;">
			modifiez vos paramètres de notification
			</a>.
		</p>
	`);
}
