import { FieldCodeSmiley } from '@/src/types/custom';
import { getStatsColor, getStatsIcon } from '@/src/utils/stats';
import {
	newFormFieldCodes,
	oldFormFieldCodes,
	translateMonthToFrench
} from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Skeleton, Tooltip } from '@mui/material';
import { AnswerIntention } from '@prisma/client';
import Image from 'next/image';
import { tss } from 'tss-react/dsfr';
import SmileyBarChart from '../../chart/SmileyBarChart';
import ChartWrapper, { FormattedData } from './ChartWrapper';
import QuestionWrapper from './QuestionWrapper';

type Props = {
	fieldCode: FieldCodeSmiley;
	productId: number;
	startDate: string;
	endDate: string;
	total: number;
	required?: boolean;
};

export const intentionSortOrder = {
	bad: 0,
	medium: 1,
	good: 2
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

	const { data: resultFieldCode, isLoading: isLoadingFieldCode } =
		trpc.answer.getByFieldCode.useQuery(
			{
				product_id: productId,
				field_code: fieldCode,
				start_date: startDate,
				end_date: endDate,
				...(oldFormFieldCodes.includes(fieldCode) && {
					form_id: 1
				}),
				...(newFormFieldCodes.includes(fieldCode) && {
					form_id: 2
				})
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

	const {
		data: resultFieldCodeInterval,
		isLoading: isLoadingFieldCodeInterval
	} = trpc.answer.getByFieldCodeInterval.useQuery(
		{
			product_id: productId,
			field_code: fieldCode,
			start_date: startDate,
			end_date: endDate
		},
		{
			initialData: {
				data: {},
				metadata: {
					total: 0,
					average: 0
				}
			}
		}
	);

	if (isLoadingFieldCode || isLoadingFieldCodeInterval || !resultFieldCode) {
		return (
			<div className={classes.mainSection}>
				<Skeleton />
			</div>
		);
	}

	let data: FormattedData[] = [];
	for (const [key, value] of Object.entries(resultFieldCodeInterval.data)) {
		let item: {
			name: string;
			[key: string]: number | string;
		} = {
			name: translateMonthToFrench(key)
		};
		const itemTotal = value.reduce((acc, curr) => acc + curr.doc_count, 0);
		value.forEach(v => {
			item[v.answer_text] = (v.doc_count / itemTotal) * 100;
			item['value_' + v.answer_text] = v.doc_count;
		});
		data.push(item);
	}

	return (
		<QuestionWrapper
			totalField={
				// DUE TO ELK BUG WITH CARDINALITY NOT PRECISE ENOUGH : https://discuss.elastic.co/t/why-the-unique-count-of-some-item-is-larger-than-count-in-table-chart-of-kibana/34374
				fieldCode === 'satisfaction' ? total : resultFieldCode.metadata.total
			}
			fieldLabel={resultFieldCode.metadata.fieldLabel as string}
			total={total}
			required={required}
		>
			<ChartWrapper title="Répartition des réponses">
				<div className={classes.distributionContainer}>
					{resultFieldCode.data
						.sort(
							(a, b) =>
								intentionSortOrder[
									a.intention as keyof typeof intentionSortOrder
								] -
								intentionSortOrder[
									b.intention as keyof typeof intentionSortOrder
								]
						)
						.map((rfc, index) => {
							const percentage = Math.round(
								(rfc.doc_count / resultFieldCode.metadata.total) * 100
							);
							const limitToShowTopInfos = 10;
							const limitToShowBottomInfos = 4;
							return (
								<div
									key={index}
									className={classes.distributionItem}
									style={{
										width: `${percentage}%`
									}}
								>
									{percentage >= limitToShowTopInfos ? (
										<Image
											alt="smiley"
											src={`/assets/smileys/${getStatsIcon({
												intention: rfc.intention as AnswerIntention
											})}.svg`}
											width={40}
											height={40}
										/>
									) : (
										<span className={cx(classes.distributionIcon)}></span>
									)}
									<label className={classes.distributionLabel}>
										{percentage >= limitToShowTopInfos && rfc.answer_text}
									</label>
									<Tooltip
										placement="top-start"
										tabIndex={0}
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
										{percentage >= limitToShowBottomInfos && `${percentage}%`}
									</label>
								</div>
							);
						})}
				</div>
			</ChartWrapper>

			<ChartWrapper
				title="Évolution des réponses"
				total={resultFieldCode.metadata.total}
				data={data}
			>
				<SmileyBarChart data={data} total={total} />
			</ChartWrapper>
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
		width: '100%',
		marginTop: fr.spacing('10v'),
		gap: 2
	},
	distributionItem: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center'
	},
	distributionIcon: {
		height: '2.5rem',
		'&::before': {
			width: '3rem',
			height: '3rem'
		}
	},
	distributionLabel: {
		marginTop: fr.spacing('2v'),
		marginBottom: fr.spacing('2v'),
		height: '1.5rem'
	},
	progressBar: {
		width: '100%',
		height: '1.5rem',
		borderRadius: '5px'
	},
	distributionPercentage: {
		marginTop: fr.spacing('2v'),
		height: '1.5rem'
	}
});

export default SmileyQuestionViz;
