export function isValidEmail(email: string): boolean {
	const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
	return emailRegex.test(email);
}

export function generateOTP(length: number = 8): string {
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let otp = '';
	for (let i = 0; i < length; i++) {
		otp += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return otp;
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
