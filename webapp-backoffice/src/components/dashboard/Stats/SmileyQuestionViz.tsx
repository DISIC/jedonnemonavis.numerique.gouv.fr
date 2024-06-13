import { FieldCodeSmiley } from '@/src/types/custom';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Skeleton } from '@mui/material';
import { tss } from 'tss-react/dsfr';
import QuestionWrapper from './QuestionWrapper';

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
	const { classes } = useStyles();

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

	return (
		<QuestionWrapper
			fieldLabel={resultFieldCode.metadata.fieldLabel || ''}
			totalField={resultFieldCode.metadata.total}
			total={total}
			required={required}
		>
			<h4 className={fr.cx('fr-mt-10v')}>Répartition des réponses</h4>
			{/* <div>
				{resultFieldCode.data.map(rfc => (
					<div>{rfc.answer_text}</div>
				))}
			</div> */}
		</QuestionWrapper>
	);
};

const useStyles = tss.create({
	mainSection: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '3rem'
	}
});

export default SmileyQuestionViz;
