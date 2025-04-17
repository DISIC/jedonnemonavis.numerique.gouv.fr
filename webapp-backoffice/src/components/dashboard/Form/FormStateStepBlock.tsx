// src/hooks/useModifiedSteps.ts
import { FormConfigHelper } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { normalizeHtml } from '@/src/utils/tools';
import { useState, useEffect, useCallback } from 'react';

export function useModifiedSteps(
	formTemplateSteps: FormWithElements['form_template']['form_template_steps'][0][],
	configHelper: FormConfigHelper,
	form: FormWithElements
) {
	const [modifiedSteps, setModifiedSteps] = useState<number[]>([]);

	const recalculateModifiedSteps = useCallback(() => {
		if (!formTemplateSteps || !configHelper) return;

		const modifiedStepIds: number[] = [];

		formTemplateSteps.forEach(step => {
			const hasDisplayModifications = configHelper.displays.some(d => {
				if (d.kind === 'blockOption') {
					return (
						step.form_template_blocks.map(b => b.id).includes(d.parent_id) &&
						d.hidden
					);
				}

				return false;
			});

			const hasLabelModifications = configHelper.labels.some(d => {
				if (d.kind === 'block') {
					const isInCorrectBlock = step.form_template_blocks
						.map(b => b.id)
						.includes(d.parent_id);

					const paragraphBlock = step.form_template_blocks.find(
						b => b.type_bloc === 'paragraph' && b.id === d.parent_id
					);

					if (!paragraphBlock || !paragraphBlock.content || !isInCorrectBlock)
						return false;

					return (
						normalizeHtml(d.label) !==
						normalizeHtml(
							paragraphBlock.content.replace(
								'{{title}}',
								form?.product?.title || ''
							)
						)
					);
				}

				return false;
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
}
