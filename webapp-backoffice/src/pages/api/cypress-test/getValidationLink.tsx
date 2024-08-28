import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

let validationLink: string;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

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
				const link = await waitForLink(300);
				if (link) {
					res.status(200).json(link);
				} else {
					res.status(404).json({ message: 'No link sent yet' });
				}
			} catch (error) {
				res.status(500).json({ message: 'Server error' });
			}
		} else {
			res.status(404).json({ message: 'Wrong password' });
		}
	} else {
		res.status(400).json({ message: 'Password is required' });
	}
}

const waitForLink = (timeout: number): Promise<string | null> => {
	return new Promise(resolve => {
		const interval = 200;
		const attempts = timeout / interval;
		let attempt = 0;

		const checkLink = setInterval(() => {
			attempt++;
			if (validationLink) {
				clearInterval(checkLink);
				resolve(validationLink);
			} else if (attempt >= attempts) {
				clearInterval(checkLink);
				resolve(null);
			}
		}, interval);
	});
};

export const addEmailDetail = (link: string) => {
	console.log('Validation link stored: ', link);
	validationLink = link;
};
