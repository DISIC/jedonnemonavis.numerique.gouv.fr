import { Session } from 'next-auth';

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
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<img src="https://numericite.eu/wp-content/uploads/2023/10/Frame-12104.png"/>
				</div>
				${content}
				<p>
					Merci,<br/>
					La brigade
				</p>
				<div class="footer">
					<p>
						Ce message a ete envoyé par la Brigade, l’équipe du <a href="https://design.numerique.gouv.fr/a-propos/" target="_blank">Pôle design des services numériques</a>,
						propulsé par la <a href="https://www.numerique.gouv.fr/" target="_blank">Direction interministérielle du numérique</a>. 
					</p>
					<p>
						Pour toute question, merci de nous contacter à experts@design.numerique.gouv.fr.
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

export function getUserRequestEmailHtml() {
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
