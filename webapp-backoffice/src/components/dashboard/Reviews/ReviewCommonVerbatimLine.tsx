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

	return (
		<>
			{fieldCodesHelper.map(fch => (
				<div className={fr.cx('fr-col-12')}>
					<p className={cx(classes.subtitle)}>{fch?.question}</p>
					{getFieldCodeTexts(fch?.slug || '').map(text => (
						<div>
							<Badge
								className={cx(classes.badge)}
								small={true}
								noIcon={true}
								severity={'info'}
							>
								{text}
							</Badge>
						</div>
					))}
				</div>
			))}
			<div className={fr.cx('fr-col-12')}>
				<p className={cx(classes.subtitle)}>
					Votre rapport à l'aide de l'administration
				</p>
				<table className={cx(fr.cx('fr-table'), classes.table)}>
					<thead>
						<tr>
							<td>Aide</td>
							<td>{tableFieldCodeHelper[1]?.question}</td>
							<td>{tableFieldCodeHelper[2]?.question}</td>
						</tr>
					</thead>
					<tbody>
						{getFieldCodeTexts(tableFieldCodeHelper[0]?.slug || '')
							.filter(row => row.includes('administration'))
							.map(row => (
								<tr>
									<td>{row}</td>
									<td>
										<Badge
											className={cx(classes.badge)}
											small={true}
											noIcon={true}
											severity={'info'}
										>
											{getConditionnalValueText(
												tableFieldCodeHelper[0]?.slug || '',
												row,
												tableFieldCodeHelper[1]?.slug || ''
											)}
										</Badge>
									</td>
									<td>
										<Badge
											className={cx(classes.badge)}
											small={true}
											noIcon={true}
											severity={'info'}
										>
											{getConditionnalValueText(
												tableFieldCodeHelper[0]?.slug || '',
												row,
												tableFieldCodeHelper[2]?.slug || ''
											)}
										</Badge>
									</td>
								</tr>
							))}
					</tbody>
				</table>
			</div>
		</>
	);
};

const useStyles = tss.create({
	greyContainer: {
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default
	},
	subtitle: {
		fontSize: 12,
		fontWeight: 'bold',
		marginBottom: 0
	},
	content: {
		fontSize: 12,
		fontWeight: 400,
		marginBottom: 0
	},
	badge: {
		fontSize: 12,
		paddingVertical: 4,
		textTransform: 'initial'
	},
	table: {
		marginBottom: 0,
		tr: {
			td: {
				fontSize: '0.75rem'
			}
		}
	}
});

export default ReviewCommonVerbatimLine;
