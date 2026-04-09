import { sendMail } from '@/src/utils/mailer';

export async function sendExportReadyEmail(
	toEmail: string,
	productName: string,
	downloadLink: string
): Promise<void> {
	const subject = `Votre export est prêt : [${productName}]`;

	const text = `Bonjour,\n\nVotre export pour le service ${productName} est prêt. Vous pouvez le télécharger en utilisant le lien suivant :\n\n${downloadLink}\n\nCe lien expirera dans 30 jours.\n\nCordialement,\nL'équipe JDMA`;

	const html = `<!DOCTYPE html>
<html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 640px; margin: 0 auto; padding: 20px; }
            .footer {
                font-size: 12px;
                padding: 16px 32px;
                background: #F5F5FE;
                margin-top: 30px;
            }
            .header { margin-bottom: 30px; }
            .header img { height: 88px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://jedonnemonavis.numerique.gouv.fr/assets/JDMA_Banner.png"/>
            </div>
            <div>
                <p>Bonjour,<br><br>
                Votre export pour le service "${productName}" est prêt. Vous pouvez le télécharger en utilisant le lien suivant :<br><br>
                <a href="${downloadLink}">Télécharger le fichier</a><br><br>
                Ce lien expirera dans 30 jours.<br><br>
                </p>
            </div>
            <div class="footer">
                <p>
                    Ce message a été envoyé par <a href="https://design.numerique.gouv.fr/" target="_blank">la Brigade d'Intervention Numérique</a>,
                    propulsé par la <a href="https://www.numerique.gouv.fr/" target="_blank">Direction interministérielle du numérique</a>.
                </p>
                <p>
                    Pour toute question, merci de nous contacter à experts@design.numerique.gouv.fr.
                </p>
            </div>
        </div>
    </body>
</html>`;

	await sendMail(subject, toEmail, html, text);
}

export async function sendExportFailedEmail(
	toEmail: string,
	productName: string
): Promise<void> {
	const subject = `Votre export a échoué : [${productName}]`;
	const text = `Bonjour,\n\nNous n'avons pas pu générer votre export pour le service ${productName}. Veuillez réessayer depuis le backoffice.\n\nCordialement,\nL'équipe JDMA`;
	const html = `<!DOCTYPE html>
<html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 640px; margin: 0 auto; padding: 20px; }
            .footer {
                font-size: 12px;
                padding: 16px 32px;
                background: #F5F5FE;
                margin-top: 30px;
            }
            .header { margin-bottom: 30px; }
            .header img { height: 88px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://jedonnemonavis.numerique.gouv.fr/assets/JDMA_Banner.png"/>
            </div>
            <div>
                <p>Bonjour,<br><br>
                Nous n'avons pas pu générer votre export pour le service "${productName}".<br><br>
                Veuillez réessayer depuis le backoffice. Si le problème persiste, contactez-nous à experts@design.numerique.gouv.fr.<br><br>
                </p>
            </div>
            <div class="footer">
                <p>
                    Ce message a été envoyé par <a href="https://design.numerique.gouv.fr/" target="_blank">la Brigade d'Intervention Numérique</a>,
                    propulsé par la <a href="https://www.numerique.gouv.fr/" target="_blank">Direction interministérielle du numérique</a>.
                </p>
            </div>
        </div>
    </body>
</html>`;

	await sendMail(subject, toEmail, html, text);
}
