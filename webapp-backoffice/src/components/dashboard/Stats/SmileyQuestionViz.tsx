import { FieldCodeSmiley } from '@/src/types/custom';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Skeleton, Tooltip } from '@mui/material';
import { tss } from 'tss-react/dsfr';
import QuestionWrapper from './QuestionWrapper';
import { getStatsColor, getStatsIcon } from '@/src/utils/stats';
import { AnswerIntention } from '@prisma/client';

type Props = {
	fieldCode: FieldCodeSmiley;
	productId: number;
	startDate: string;
	endDate: string;
	total: number;
	required?: boolean;
};

const SmileyQuestionViz = ({
	fieldCode,
	productId,
	startDate,
	endDate,
	total,
	required = false
}: Props) => {
	const { classes, cx } = useStyles();

	const { data: resultFieldCode, isLoading } =
		trpc.answer.getByFieldCode.useQuery(
			{
				product_id: productId.toString(),
				field_code: fieldCode,
				start_date: startDate,
				end_date: endDate
			},
			{
				initialData: {
					data: [],
					metadata: {
						total: 0,
						average: 0,
						fieldLabel: ''
					}
				}
			}
		);

	if (isLoading || !resultFieldCode) {
		return (
			<div className={classes.mainSection}>
				<Skeleton />
			</div>
		);
	}

	const sortOrder = {
		'Pas bien': 0,
		Moyen: 1,
		'Très bien': 2
	};

	return (
		<QuestionWrapper
			fieldLabel={resultFieldCode.metadata.fieldLabel || ''}
			totalField={resultFieldCode.metadata.total}
			total={total}
			required={required}
		>
			<h4 className={fr.cx('fr-mt-10v')}>Répartition des réponses</h4>
			<div className={classes.distributionContainer}>
				{resultFieldCode.data
					.sort((a, b) => sortOrder[a.answer_text] - sortOrder[b.answer_text])
					.map(rfc => {
						const percentage = Math.round(
							(rfc.doc_count / resultFieldCode.metadata.total) * 100
						);
						const limitToShow = 10;
						return (
							<div
								className={classes.distributionItem}
								style={{
									width: `${percentage}%`
								}}
							>
								<span
									className={cx(
										fr.cx(
											percentage >= limitToShow
												? getStatsIcon({
														intention: rfc.intention as AnswerIntention
													})
												: undefined
										),
										classes.distributionIcon
									)}
									style={{
										color: getStatsColor({
											intention: rfc.intention as AnswerIntention
										})
									}}
								/>
								<label className={classes.distributionLabel}>
									{percentage >= limitToShow && rfc.answer_text}
								</label>
								<Tooltip
									placement="top-start"
									title={`${rfc.answer_text} : ${rfc.doc_count} réponse${rfc.doc_count > 1 ? 's' : ''} soit ${percentage}%`}
								>
									<div
										className={classes.progressBar}
										style={{
											backgroundColor: getStatsColor({
												intention: rfc.intention as AnswerIntention
											})
										}}
									/>
								</Tooltip>
								<label className={classes.distributionPercentage}>
									{`${percentage}%`}
								</label>
							</div>
						);
					})}
			</div>
		</QuestionWrapper>
	);
};

const useStyles = tss.create({
	mainSection: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '3rem'
	},
	distributionContainer: {
		display: 'flex',
		width: '100%'
	},
	distributionItem: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center'
	},
	distributionIcon: {
		height: '3rem',
		'&::before': {
			width: '3rem',
			height: '3rem'
		}
	},
	distributionLabel: {
		marginTop: fr.spacing('4v'),
		marginBottom: fr.spacing('2v'),
		height: '1.5rem'
	},
	progressBar: {
		width: '100%',
		height: '1.5rem',
		borderRadius: '1.5rem'
	},
	distributionPercentage: {
		marginTop: fr.spacing('2v')
	}
});

export default SmileyQuestionViz;
