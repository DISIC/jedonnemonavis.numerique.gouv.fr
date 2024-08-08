import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

let emailDetails: Array<{
	email: string;
	link: string;
}> = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const secretPassword = req.query.secretPassword as string;
	const defaultHashPassword =
		'c40ed7bca258c7d3b0d3e86832b7f502bdf8a044b352598c3146acaa94d5ba1d';

	if (secretPassword) {
		const hashedPassword = crypto
			.createHash('sha256')
			.update(secretPassword)
			.digest('hex');

		if (hashedPassword === defaultHashPassword) {
			if (emailDetails.length > 0) {
				const validationEmail = emailDetails[emailDetails.length - 1];
				res.status(200).json(validationEmail);
			} else {
				res.status(404).json({ message: 'No emails sent yet' });
			}
		} else {
			res.status(404).json({ message: 'wrong password' });
		}
	}
}

export const addEmailDetail = (email: string, link: string) => {
	emailDetails.push({ email, link });
	if (emailDetails.length > 10) {
		emailDetails.shift();
	}
};
