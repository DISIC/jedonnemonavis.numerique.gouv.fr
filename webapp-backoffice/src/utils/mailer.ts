var nodemailer = require('nodemailer');

export async function sendMail(
	subject: string,
	toEmail: string,
	html: string,
	text: string
) {
	var transporter = nodemailer.createTransport({
		host: process.env.NODEMAILER_HOST,
		port: process.env.NODEMAILER_PORT,
		auth: {
			user: process.env.NODEMAILER_USER || process.env.MAILPACE_API_KEY,
			pass: process.env.NODEMAILER_PASSWORD || process.env.MAILPACE_API_KEY
		}
	});

	var mailOptions = {
		from: process.env.NODEMAILER_FROM,
		to: toEmail,
		subject: subject,
		html,
		text
	};

	transporter.sendMail(mailOptions, function (error: any) {
		if (error) {
			throw new Error(error);
		} else {
			console.log(`Email sent to ${toEmail}`);
			return true;
		}
	});
}
