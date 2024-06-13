import { FieldCodeSmiley } from '@/src/types/custom';
import { fr } from '@codegouvfr/react-dsfr';
import QuestionWrapper from './QuestionWrapper';
import AnswersChart from './AnswersChart';

type Props = {
	fieldCode: FieldCodeSmiley;
	productId: number;
	startDate: string;
	endDate: string;
	total: number;
	required?: boolean;
};

const BarQuestionViz = ({
	fieldCode,
	productId,
	startDate,
	endDate,
	total,
	required = false
}: Props) => {
	return (
		<QuestionWrapper
			fieldCode={fieldCode}
			productId={productId}
			startDate={startDate}
			endDate={endDate}
			total={total}
			required={required}
		>
			<h4 className={fr.cx('fr-mt-10v')}>Répartition des réponses</h4>
			{/* <div>
				{resultFieldCode.data.map(rfc => (
					<div>{rfc.answer_text}</div>
				))}
			</div> */}
			<AnswersChart
				fieldCode={fieldCode}
				productId={productId}
				startDate={startDate}
				endDate={endDate}
			/>
		</QuestionWrapper>
	);
};

export default BarQuestionViz;
