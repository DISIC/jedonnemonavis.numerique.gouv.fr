import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

let emailDetails: Array<{ email: string; link: string }> = [];

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const secretPassword = req.query.secretPassword as string;
	const defaultHashPassword =
		'c40ed7bca258c7d3b0d3e86832b7f502bdf8a044b352598c3146acaa94d5ba1d';

	if (secretPassword) {
		const hashedPassword = crypto
			.createHash('sha256')
			.update(secretPassword)
			.digest('hex');

		if (hashedPassword === defaultHashPassword) {
			try {
				const validationEmail = await waitForEmail();

				if (validationEmail) {
					res.status(200).json(validationEmail);
				} else {
					res.status(404).json({ message: 'No emails sent yet' });
				}
			} catch (error) {
				res.status(500).json({ message: 'Server error' });
			}
		} else {
			res.status(404).json({ message: 'wrong password' });
		}
	} else {
		res.status(400).json({ message: 'Password is required' });
	}
}

const waitForEmail = (): Promise<{ email: string; link: string } | null> => {
	return new Promise(resolve => {
		let attempts = 0;
		const interval = setInterval(() => {
			attempts += 1;
			if (emailDetails.length > 0) {
				clearInterval(interval);
				resolve(emailDetails[emailDetails.length - 1]);
			} else if (attempts > 20) {
				// Attendre jusqu'à 10 secondes (20 tentatives à 500ms d'intervalle)
				clearInterval(interval);
				resolve(null);
			}
		}, 500); // Vérifie toutes les 500ms
	});
};

export const addEmailDetail = (email: string, link: string) => {
	emailDetails.push({ email, link });
	if (emailDetails.length > 10) {
		emailDetails.shift();
	}
};
