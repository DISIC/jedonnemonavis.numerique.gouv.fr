import { hasAnyFilterChanged, useFilters } from '@/src/contexts/FiltersContext';
import { ReviewFiltersType } from '@/src/types/custom';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { Button } from '@prisma/client';
import { tss } from 'tss-react/dsfr';

interface Props {
	buttons: Button[];
	form: FormWithElements;
}

const ReviewFilterTags = (props: Props) => {
	const { buttons, form } = props;
	const { filters, updateFilters } = useFilters();
	const { cx, classes } = useStyles();

	const filterableBlocks = form.form_template.form_template_steps
		.flatMap(step => step.form_template_blocks)
		.filter(block =>
			['mark_input', 'smiley_input', 'select', 'radio', 'checkbox'].includes(
				block.type_bloc
			)
		);

	const renderLabel = (fieldCode: string, value: string): string => {
		const block = filterableBlocks.find(b => b.field_code === fieldCode);
		const formTemplateBlockOption = block?.options?.find(
			o => o.value === value
		);

		if (!block) {
			if (fieldCode === 'buttonId') {
				return `Source = ${buttons.find(b => b.id === parseInt(value as string))
					?.title}`;
			}
			return value;
		}

		return `${block.alias || block.label || fieldCode} = ${
			formTemplateBlockOption?.alias || value
		}`;
	};

	const renderTags = () => {
		const tags: JSX.Element[] = [];

		const booleanKeys: (keyof ReviewFiltersType)[] = [
			'needVerbatim',
			'needOtherDifficulties',
			'needOtherHelp'
		];

		booleanKeys.forEach((key, index) => {
			const filterValue = filters.productReviews.filters[key];
			if (filterValue === true) {
				const label =
					key === 'needVerbatim'
						? 'Réponse avec commentaire'
						: key === 'needOtherDifficulties'
						? 'Difficultés autres complété'
						: 'Aide autres complété';

				tags.push(
					<Tag
						key={`bool-${index}`}
						title={`Retirer le filtre : ${label}`}
						dismissible
						small
						className={cx(classes.tagFilter)}
						nativeButtonProps={{
							onClick: () => {
								const nextFilters: typeof filters = {
									...filters,
									productReviews: {
										...filters.productReviews,
										filters: {
											...filters.productReviews.filters,
											[key]: false
										}
									}
								};
								updateFilters({
									...nextFilters,
									sharedFilters: {
										...nextFilters.sharedFilters,
										hasChanged: hasAnyFilterChanged(nextFilters)
									}
								});
							}
						}}
					>
						{label}
					</Tag>
				);
			}
		});

		if (
			filters.productReviews.filters.buttonId &&
			filters.productReviews.filters.buttonId.length > 0
		) {
			filters.productReviews.filters.buttonId.forEach((buttonIdStr, index) => {
				const labelRendered = renderLabel('buttonId', buttonIdStr);

				tags.push(
					<Tag
						key={`button-${index}`}
						title={`Retirer le filtre ${labelRendered}`}
						dismissible
						small
						className={cx(classes.tagFilter)}
						nativeButtonProps={{
							onClick: () => {
								const nextFilters: typeof filters = {
									...filters,
									productReviews: {
										...filters.productReviews,
										filters: {
											...filters.productReviews.filters,
											buttonId: filters.productReviews.filters.buttonId?.filter(
												item => item !== buttonIdStr
											)
										}
									}
								};
								updateFilters({
									...nextFilters,
									sharedFilters: {
										...nextFilters.sharedFilters,
										hasChanged: hasAnyFilterChanged(nextFilters)
									}
								});
							}
						}}
					>
						{labelRendered}
					</Tag>
				);
			});
		}

		if (
			filters.productReviews.filters.fields &&
			filters.productReviews.filters.fields.length > 0
		) {
			filters.productReviews.filters.fields.forEach((field, fieldIndex) => {
				field.values.forEach((value, valueIndex) => {
					const labelRendered = renderLabel(field.field_code, value);

					tags.push(
						<Tag
							key={`field-${fieldIndex}-${valueIndex}`}
							title={`Retirer le filtre ${labelRendered}`}
							dismissible
							small
							className={cx(classes.tagFilter)}
							nativeButtonProps={{
								onClick: () => {
									const updatedFields =
										filters.productReviews.filters.fields?.map((f, idx) => {
											if (idx === fieldIndex) {
												return {
													...f,
													values: f.values.filter(v => v !== value)
												};
											}
											return f;
										});

									const filteredFields =
										updatedFields?.filter(f => f.values.length > 0) ?? [];

									const nextFilters: typeof filters = {
										...filters,
										productReviews: {
											...filters.productReviews,
											filters: {
												...filters.productReviews.filters,
												fields: filteredFields
											}
										}
									};
									updateFilters({
										...nextFilters,
										sharedFilters: {
											...nextFilters.sharedFilters,
											hasChanged: hasAnyFilterChanged(nextFilters)
										}
									});
								}
							}}
						>
							{labelRendered}
						</Tag>
					);
				});
			});
		}

		return tags.length > 0 ? tags : null;
	};

	return (
		<div className={cx(classes.container, fr.cx('fr-col-12'))}>
			{renderTags()}
		</div>
	);
};

export default ReviewFilterTags;

const useStyles = tss.withName(ReviewFilterTags.name).create({
	container: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '1rem'
	},
	tagFilter: {}
});
