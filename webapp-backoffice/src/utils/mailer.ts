var nodemailer = require('nodemailer');

export async function sendMail(
	subject: string,
	toEmail: string,
	html: string,
	text: string
) {
	const host = process.env.NODEMAILER_HOST;
	const port = Number(process.env.NODEMAILER_PORT);
	const user = process.env.NODEMAILER_USER || process.env.MAILPACE_API_KEY;
	const pass = process.env.NODEMAILER_PASSWORD || process.env.MAILPACE_API_KEY;
	const hasAuth = !!user && !!pass && user !== 'null' && pass !== 'null';

	var transporter = nodemailer.createTransport({
		host,
		port,
		secure: port === 465,
		...(hasAuth
			? {
					auth: {
						user,
						pass
					}
				}
			: {})
	});

	var mailOptions = {
		from: process.env.NODEMAILER_FROM,
		to: toEmail,
		subject: subject,
		html,
		text
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log(`Email sent to ${toEmail}`);
		return true;
	} catch (error: any) {
		const details = {
			message: error?.message,
			code: error?.code,
			responseCode: error?.responseCode,
			response: error?.response,
			command: error?.command
		};
		throw new Error(`MailerError: ${JSON.stringify(details)}`);
	}
}
