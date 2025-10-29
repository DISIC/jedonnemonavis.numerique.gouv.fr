import { fr } from '@codegouvfr/react-dsfr';
import { AnswerIntention } from '@prisma/client';

export const getIntentionFromAverage = (
	average: number,
	slug?: string
): AnswerIntention => {
	if (slug && slug === 'contact') {
		return average >= 8.5
			? AnswerIntention.good
			: average >= 7
				? AnswerIntention.medium
				: AnswerIntention.bad;
	}

	return average >= 8
		? AnswerIntention.good
		: average >= 5
			? AnswerIntention.medium
			: AnswerIntention.bad;
};

export const getStatsColor = ({
	intention,
	average,
	kind = 'text'
}: {
	intention?: AnswerIntention;
	average?: number;
	kind?: 'text' | 'background';
}) => {
	if (average !== undefined) {
		intention = getIntentionFromAverage(average);
	}
	switch (intention) {
		case AnswerIntention.good:
			return kind === 'text'
				? fr.colors.decisions.text.default.success.default
				: fr.colors.decisions.background.contrast.success.default;
		case AnswerIntention.medium:
			return kind === 'text'
				? fr.colors.decisions.background.flat.yellowTournesol.default
				: fr.colors.decisions.background.alt.yellowTournesol.default;
		case AnswerIntention.bad:
			return kind === 'text'
				? fr.colors.decisions.text.default.error.default
				: fr.colors.decisions.background.contrast.error.default;
		default:
			return 'transparent';
	}
};

export const getStatsIcon = ({
	intention
}: {
	intention?: AnswerIntention;
}) => {
	switch (intention) {
		case AnswerIntention.good:
			return 'good';
		case AnswerIntention.medium:
			return 'medium';
		case AnswerIntention.bad:
			return 'bad';
		default:
			return 'neutral';
	}
};

export const getStatsAnswerText = ({
	buckets,
	intention
}: {
	buckets: {
		answer_text: string;
		intention: AnswerIntention;
	}[];
	intention: AnswerIntention;
}) => {
	const currentAnswerText =
		buckets.find(bucket => bucket.intention === intention)?.answer_text || '';

	return currentAnswerText.charAt(0).toUpperCase() + currentAnswerText.slice(1);
};

export const displayIntention = (intention: string) => {
	switch (intention) {
		case 'bad':
			return 'Mauvais';
		case 'medium':
			return 'Moyen';
		case 'good':
			return 'Très bien';
		case 'neutral':
			return 'Neutre';
		default:
			return intention;
	}
};
