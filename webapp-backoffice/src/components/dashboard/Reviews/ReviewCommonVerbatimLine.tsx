import {
	FIELD_CODE_BOOLEAN_VALUES,
	FIELD_CODE_DETAILS_VALUES,
	FIELD_CODE_SMILEY_VALUES
} from '@/src/utils/helpers';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import { ExtendedReview } from './interface';
import React from 'react';
import { generateRandomString } from '@/src/utils/tools';

const ReviewCommonVerbatimLine = ({
	review,
	type
}: {
	review: ExtendedReview;
	type: 'Line' | 'Verbatim';
}) => {
	const { cx, classes } = useStyles();

	if (!review) return null;

	const getConditionnalValueText = (
		parentSlug: string,
		parentText: string,
		childSlug: string
	): string => {
		const parentAnswer = review.answers?.find(
			answer =>
				answer.field_code === parentSlug && answer.answer_text === parentText
		);

		if (!parentAnswer) return '';

		const childAnswer = review.answers?.find(
			answer =>
				answer.parent_answer_id === parentAnswer.id &&
				answer.field_code === childSlug
		);

		return childAnswer?.answer_text || '-';
	};

	const getFieldCodeTexts = (fieldCode: string) => {
		const answers =
			review.answers?.filter(answer => answer.field_code === fieldCode) || [];

		if (!answers.length) return ['-'];

		return answers.map(a => {
			if (a.field_code === 'comprehension') return `${a.answer_text} / 5`;

			if (a.answer_text?.includes('Autre')) {
				const otherAnswer = review.answers?.find(
					answer => answer.field_code === `${fieldCode}_verbatim`
				);
				return otherAnswer
					? `${a.answer_text} : "${otherAnswer.answer_text}"`
					: a.answer_text;
			}

			return a.answer_text || '-';
		});
	};

	const fieldCodesHelper = review.xwiki_id
		? [
				FIELD_CODE_SMILEY_VALUES.find(fcsv => fcsv.slug === 'comprehension'),
				FIELD_CODE_SMILEY_VALUES.find(fcsv => fcsv.slug === 'easy'),
				FIELD_CODE_DETAILS_VALUES.find(fcsv => fcsv.slug === 'difficulties'),
				FIELD_CODE_DETAILS_VALUES.find(fcsv => fcsv.slug === 'help')
			]
		: [
				FIELD_CODE_SMILEY_VALUES.find(fcsv => fcsv.slug === 'comprehension'),
				FIELD_CODE_DETAILS_VALUES.find(fcdv => fcdv.slug === 'contact_tried')
			];

	const tableFieldCodeHelper = review.xwiki_id
		? []
		: [
				FIELD_CODE_DETAILS_VALUES.find(fcdv => fcdv.slug === 'contact_tried'),
				FIELD_CODE_BOOLEAN_VALUES.find(fcdv => fcdv.slug === 'contact_reached'),
				FIELD_CODE_DETAILS_VALUES.find(
					fcdv => fcdv.slug === 'contact_satisfaction'
				)
			];

	const tableAdministrationItems = getFieldCodeTexts(
		tableFieldCodeHelper[0]?.slug || ''
	).filter(row => row.includes('administration'));

	return (
		<>
			{fieldCodesHelper.map((fch, index) => (
				<div key={index} className={fr.cx('fr-col-12')}>
					<h2 className={cx(classes.subtitle)}>{fch?.question}</h2>
					<p className={cx(classes.content)}>
						{getFieldCodeTexts(fch?.slug || '').map(text => (
							<span
								key={text}
								className={
									text !== '-'
										? cx(fr.cx('fr-tag', 'fr-tag--sm'), classes.tag)
										: ''
								}
							>
								{text}
							</span>
						))}
					</p>
				</div>
			))}
			{!review.xwiki_id && (
				<div className={fr.cx('fr-col-12')}>
					<h2 className={cx(classes.subtitle)}>
						Votre rapport à l'aide de l'administration
					</h2>

					{!!tableAdministrationItems.length ? (
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--left',
								'fr-mt-0-5v'
							)}
						>
							{tableFieldCodeHelper.slice(1).map(tfch => (
								<div key={tfch?.slug} className={fr.cx('fr-col-12')}>
									<h3 className={cx(classes.subtitle2)}>{tfch?.question}</h3>
									{tableAdministrationItems.map(row => {
										const answer = getConditionnalValueText(
											tableFieldCodeHelper[0]?.slug || '',
											row,
											tfch?.slug || ''
										);

										// Hardcoded logic for now
										if (tfch?.slug === 'contact_satisfaction') {
											const parent_answer = getConditionnalValueText(
												'contact_tried',
												row,
												'contact_reached'
											);
											if (parent_answer === 'Non') return;
										}

										return (
											<p key={`${generateRandomString()}_${answer}`} className={cx(classes.content)}>
												{row} :{' '}
												<span
													key={row}
													className={cx(
														fr.cx('fr-tag', 'fr-tag--sm'),
														classes.tag,
														classes.rowTag
													)}
												>
													{answer}
												</span>
											</p>
										);
									})}
								</div>
							))}
						</div>
					) : (
						'-'
					)}
				</div>
			)}
		</>
	);
};

const useStyles = tss.create({
	greyContainer: {
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default
	},
	subtitle: {
		...fr.typography[18].style,
		fontWeight: 'bold',
		marginBottom: 0
	},
	subtitle2: {
		...fr.typography[17].style,
		fontWeight: 'bold',
		marginBottom: 0
	},
	content: {
		...fr.typography[17].style,
		fontWeight: 400,
		marginBottom: 0
	},
	tag: {
		...fr.typography[17].style,
		backgroundColor:
			fr.colors.decisions.background.actionLow.blueFrance.default,
		color: fr.colors.decisions.background.actionHigh.blueFrance.default,
		textTransform: 'initial',
		'&:not(:first-of-type)': {
			marginLeft: 10
		}
	},
	rowTag: {
		marginTop: 4
	},
	table: {
		marginBottom: 0,
		tr: {
			td: {
				fontSize: '0.75rem'
			}
		},
		thead: {
			tr: {
				td: {
					fontSiez: '0.5rem'
				}
			}
		}
	}
});

export default ReviewCommonVerbatimLine;
