import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import { ReviewPartialWithRelations } from '@/prisma/generated/zod';
import { FormTemplateWithElements } from '@/src/types/prismaTypesExtended';

const ReviewDetailPanelDynamic = ({
	review,
	formTemplate
}: {
	review: ReviewPartialWithRelations;
	formTemplate: FormTemplateWithElements;
}) => {
	const { cx, classes } = useStyles();

	return (
		<>
			{formTemplate.form_template_steps
				.flatMap(step => step.form_template_blocks)
				.map((block, index) => {
					const answer = review.answers?.find(
						a => a.field_code === block.field_code
					);

					if (!answer && !block.isRequired) return null;

					const isTextInput =
						block.type_bloc === 'input_text' ||
						block.type_bloc === 'input_text_area';

					return (
						<div key={index} className={fr.cx('fr-col-12')}>
							<h2 className={cx(classes.subtitle)}>
								{block.label || block.field_code}
							</h2>
							<p
								className={cx(
									classes.content,
									!isTextInput && cx(fr.cx('fr-tag', 'fr-tag--sm'), classes.tag)
								)}
							>
								{answer?.answer_text || '-'}
							</p>
						</div>
					);
				})}
		</>
	);
};

const useStyles = tss.create({
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
	}
});

export default ReviewDetailPanelDynamic;
