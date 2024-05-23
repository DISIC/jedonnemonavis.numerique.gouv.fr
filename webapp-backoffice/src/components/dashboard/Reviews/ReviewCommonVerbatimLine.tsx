import { fr } from '@codegouvfr/react-dsfr';
import { ExtendedReview } from './interface';
import { tss } from 'tss-react/dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { getSeverity } from '@/src/utils/tools';
import {
	displayIntention,
	getStatsColor,
	getStatsIcon
} from '@/src/utils/stats';
import Tag from '@codegouvfr/react-dsfr/Tag';
import {
	FIELD_CODE_BOOLEAN_VALUES,
	FIELD_CODE_DETAILS_VALUES,
	FIELD_CODE_SMILEY_VALUES
} from '@/src/utils/helpers';

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

			return a.answer_text || '-';
		});
	};

	const fieldCodesHelper = [
		FIELD_CODE_SMILEY_VALUES.find(fcsv => fcsv.slug === 'comprehension'),
		FIELD_CODE_DETAILS_VALUES.find(fcdv => fcdv.slug === 'contact_tried')
	];

	const tableFieldCodeHelper = [
		FIELD_CODE_DETAILS_VALUES.find(fcdv => fcdv.slug === 'contact_tried'),
		FIELD_CODE_BOOLEAN_VALUES.find(fcdv => fcdv.slug === 'contact_reached'),
		FIELD_CODE_DETAILS_VALUES.find(fcdv => fcdv.slug === 'contact_satisfaction')
	];

	const tableAdministrationItems = getFieldCodeTexts(
		tableFieldCodeHelper[0]?.slug || ''
	).filter(row => row.includes('administration'));

	return (
		<>
			{fieldCodesHelper.map(fch => (
				<div className={fr.cx('fr-col-12')}>
					<p className={cx(classes.subtitle)}>{fch?.question}</p>
					{getFieldCodeTexts(fch?.slug || '').map(text => (
						<span
							className={
								text !== '-'
									? cx(fr.cx('fr-tag', 'fr-tag--sm'), classes.tag)
									: ''
							}
						>
							{text}
						</span>
					))}
				</div>
			))}
			<div className={fr.cx('fr-col-12')}>
				<p className={cx(classes.subtitle)}>
					Votre rapport à l'aide de l'administration
				</p>
				{!!tableAdministrationItems.length ? (
					<table className={cx(fr.cx('fr-table'), classes.table)}>
						<thead>
							<tr>
								<td>Aide</td>
								<td>{tableFieldCodeHelper[1]?.question}</td>
								<td>{tableFieldCodeHelper[2]?.question}</td>
							</tr>
						</thead>
						<tbody>
							{tableAdministrationItems.map(row => {
								const contact_reached_answer = getConditionnalValueText(
									tableFieldCodeHelper[0]?.slug || '',
									row,
									tableFieldCodeHelper[1]?.slug || ''
								);
								const contact_satisfaction_answer = getConditionnalValueText(
									tableFieldCodeHelper[0]?.slug || '',
									row,
									tableFieldCodeHelper[2]?.slug || ''
								);
								return (
									<tr>
										<td>{row}</td>
										<td>
											<p
												className={
													contact_reached_answer !== '-'
														? cx(fr.cx('fr-tag', 'fr-tag--sm'), classes.tag)
														: ''
												}
											>
												{contact_reached_answer}
											</p>
										</td>
										<td>
											<p
												className={
													contact_satisfaction_answer !== '-'
														? cx(fr.cx('fr-tag', 'fr-tag--sm'), classes.tag)
														: ''
												}
											>
												{contact_satisfaction_answer}
											</p>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				) : (
					'-'
				)}
			</div>
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
