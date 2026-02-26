import { FormConfigHelper } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]/edit';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { normalizeHtml } from '@/src/utils/tools';
import { useState, useEffect, useCallback } from 'react';

const useModifiedSteps = (
	formTemplateSteps: FormWithElements['form_template']['form_template_steps'][0][],
	configHelper: FormConfigHelper,
	form: FormWithElements
) => {
	const [modifiedSteps, setModifiedSteps] = useState<number[]>([]);

	const recalculateModifiedSteps = useCallback(() => {
		if (!formTemplateSteps || !configHelper) return;

		const modifiedStepIds: number[] = [];

		formTemplateSteps.forEach(step => {
			const hasDisplayModifications = configHelper.displays.some(d => {
				if (d.kind === 'blockOption') {
					return (
						step.form_template_blocks
							.flatMap(block => block.options)
							.map(b => b.id)
							.includes(d.parent_id) && d.hidden
					);
				}

				return false;
			});

			const hasLabelModifications = configHelper.labels.some(d => {
				if (d.kind !== 'block') return false;

				const paragraphBlock = step.form_template_blocks.find(
					b => b.id === d.parent_id && b.type_bloc === 'paragraph'
				);

				if (!paragraphBlock?.content) return false;

				return (
					normalizeHtml(d.label) !==
					normalizeHtml(
						paragraphBlock.content.replace(
							'{{title}}',
							form?.product?.title || ''
						)
					)
				);
			});

			if (hasDisplayModifications || hasLabelModifications) {
				modifiedStepIds.push(step.id);
			}
		});

		setModifiedSteps(modifiedStepIds);
	}, [formTemplateSteps, configHelper, form]);

	useEffect(() => {
		recalculateModifiedSteps();
	}, [configHelper, recalculateModifiedSteps]);

	const isStepModified = useCallback(
		(stepId: number) => {
			return modifiedSteps.includes(stepId);
		},
		[modifiedSteps]
	);

	return {
		modifiedSteps,
		isStepModified,
		recalculateModifiedSteps
	};
};

export default useModifiedSteps;
