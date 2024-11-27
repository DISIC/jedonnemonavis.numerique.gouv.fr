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
					<img src="https://jdma-develop.cleverapps.io/assets/JDMA_Banner.png"/>
				</div>
				${content}
				<p>
					Besoin d’aide ? Vous pouvez nous écrire à l'adresse <a href="mailto:experts@design.numerique.gouv.fr">experts@design.numerique.gouv.fr</a>.<br/>
					La Brigade d'Intervention du Numérique (BIN).
				</p>
				<div class="footer">
					<p>
						Ce message a ete envoyé par <a href="https://design.numerique.gouv.fr/" target="_blank">la Brigade d'Intervention Numérique</a>,
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
	contextUser: Session['user'],
	frequency: string,
	totalNbReviews: number,
	products: {
		title: string;
		id: number;
		nbReviews: number;
	}[]
) {
	const today = new Date();
	const last7Days = new Date(today.setDate(today.getDate() - 7));
	const lastMonth = new Date(today.setMonth(today.getMonth() - 1));
	const firstDayLastMonth = new Date(
		lastMonth.getFullYear(),
		lastMonth.getMonth(),
		1
	);
	const lastDayLastMonth = new Date(
		lastMonth.getFullYear(),
		lastMonth.getMonth() + 1,
		0
	);

	const frequencyLabel =
		frequency === 'daily'
			? 'en date du ' +
				today.toLocaleDateString('fr-FR', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric'
				})
			: frequency === 'weekly'
				? 'dans les 7 derniers jours' +
					last7Days.toLocaleDateString('fr-FR', {
						day: '2-digit',
						month: '2-digit',
						year: 'numeric'
					}) +
					' au ' +
					today.toLocaleDateString('fr-FR', {
						day: '2-digit',
						month: '2-digit',
						year: 'numeric'
					})
				: 'dans le dernier mois calendaire' +
					firstDayLastMonth.toLocaleDateString('fr-FR', {
						month: '2-digit',
						year: 'numeric'
					}) +
					' au ' +
					lastDayLastMonth.toLocaleDateString('fr-FR', {
						month: '2-digit',
						year: 'numeric'
					});

	const displayTableFrequenceLabel =
		frequency === 'daily'
			? "hier"
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
    <p>Vous avez eu un total de ${totalNbReviews} avis ${frequencyLabel} sur vos services dans Je donne mon avis.</p>
    <br />
    <div style='margin-top: 64px; margin-bottom: 48px;'>

    <div style='display: flex; flex-direction: row; gap: 10px; justify-content: space-between; align-items: center;'>
      <p style='font-size: 14px;'>Service</p>
      <p style='font-size: 14px;'>Nouveaux avis ${displayTableFrequenceLabel}</p>
    </div>
    <ul style='list-style: none; margin: 0px; padding: 0px;'>
    ${products.map(p => {
			return `<li style='border: 1px solid #e0e0e0; padding: 16px;'>
        <div style='display: flex; flex-direction: row; justify-content: space-between; align-items: center;'>
          <div style='width: 70%;'>
            <p style='color:#000091; font-weight: bold; font-size: 16px; line-height: 24px;'>${p.title}</p>
          </div>
          <div style='display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start; width: 30%;'>
            <p style='font-weight: bold; color: #0063CB; font-size: 14px; line-height: 24px; margin-bottom: 4px; text-align: left;'> +${formatNbReviews(p.nbReviews)}</p>
            <a style='font-size: 12px; line-height: 20px;' href="${jdmaUrl}/administration/dashboard/product/${p.id.toString()}/stats" target="_blank">Voir les nouveaux avis</a>
          </div>
        </div>
      </li>`;
		})}
      </ul>
    </div>

    <a href="${jdmaUrl}/administration/dashboard/products" target="_blank">Voir plus de détails sur votre tableau de bord JDMA</a>

		<p>
			Pour changer la fréquence de cette synthèse ou ne plus la recevoir du tout,
			<a href="${jdmaUrl}/administration/dashboard/user/${contextUser.id}/notifications" target="_blank">modifiez vos paramètres de notification</a>.
		</p>
	`);
}
