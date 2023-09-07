import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import { Accordion } from '@codegouvfr/react-dsfr/Accordion';

interface HomeQuestionProps {
	questions: Question[];
}

export interface Question {
	question: string;
	answer: string;
}

const HomeQuestions = (props: HomeQuestionProps) => {
	const { classes, cx } = useStyles();

	return (
		<section className={cx(fr.cx('fr-container'), classes.root)}>
			<h2>Foire aux questions</h2>
			<div className={fr.cx('fr-accordions-group')}>
				{props.questions.map((question, index) => {
					return (
						<Accordion
							key={question.question + index}
							label={question.question}
							className={cx(classes.accordion)}
						>
							{question.answer}
						</Accordion>
					);
				})}
			</div>
		</section>
	);
};

const useStyles = tss
	.withName(HomeQuestions.name)
	.withParams()
	.create(() => ({
		root: {
			h2: {
				color: fr.colors.decisions.text.title.blueFrance.default,
				...fr.spacing('margin', { bottom: '6w' }),
				[fr.breakpoints.down('md')]: {
					...fr.spacing('margin', { bottom: '3w' })
				}
			},
			...fr.spacing('margin', { bottom: '6w' })
		},
		accordion: {
			color: fr.colors.decisions.text.actionHigh.grey.default
		}
	}));

export default HomeQuestions;
