import type { NextApiRequest, NextApiResponse } from 'next';

let emailDetails: Array<{
	email: string;
	link: string;
}> = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (process.env.NODE_ENV !== 'production') {
		if (emailDetails.length > 0) {
			const lastEmail = emailDetails[emailDetails.length - 1];
			res.status(200).json(lastEmail);
		} else {
			res.status(404).json({ message: 'No emails sent yet' });
		}
	} else {
		res.status(403).json({ message: 'Access forbidden in production' });
	}
}

export const addEmailDetail = (email: string, link: string) => {
	emailDetails.push({ email, link });
	if (emailDetails.length > 10) {
		emailDetails.shift();
	}
};
