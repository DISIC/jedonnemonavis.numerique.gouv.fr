import { fr } from '@codegouvfr/react-dsfr';
import { AnswerIntention } from '@prisma/client';

export const getIntentionFromAverage = (average: number): AnswerIntention => {
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
				? fr.colors.decisions.text.label.yellowTournesol.default
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
	intention,
	average
}: {
	intention?: AnswerIntention;
	average?: number;
}) => {
	if (average !== undefined) {
		intention = getIntentionFromAverage(average);
	}
	switch (intention) {
		case AnswerIntention.good:
			return 'ri-emotion-happy-line';
		case AnswerIntention.medium:
			return 'ri-emotion-normal-line';
		case AnswerIntention.bad:
			return 'ri-emotion-unhappy-line';
		default:
			return 'ri-question-line';
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
