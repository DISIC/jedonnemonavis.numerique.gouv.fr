import { BlockPartialWithRelations, BlockWithPartialRelations, ReviewCustomPartialWithRelations, TypeblocType } from "@/prisma/generated/zod";

export const areArrayEquals = (array1?: any[], array2?: any[]) => {
  if (!array1) return false;
  if (!array2) return false;

  return (
    array1.length === array2.length &&
    array1.every((value, index) => value === array2[index])
  );
};

export const BlockQuestionsType: TypeblocType[] = ['input_text', 'input_text_area', 'mark_input', 'smiley_input', 'select', 'radio', 'checkbox']

export const applyLogicForm = (
  action: 'disable' | 'show',
  block_id: number | null,
  logicBlocks: BlockPartialWithRelations[],
  context: ReviewCustomPartialWithRelations
): boolean => {
  const blockActionned = logicBlocks.find(b =>
    b.options?.some(o => o.label === 'then' && parseInt(o.content || '') === block_id)
  );

  if (blockActionned) {
    const blockTriggeredId = parseInt(blockActionned.options?.find(o => o.label === 'when')?.content || '');
    const condition = blockActionned.options?.find(o => o.label === 'condition')?.content;
    const desiredAction = blockActionned.options?.find(o => o.label === 'action')?.content;
    const conditionValue = blockActionned.options?.find(o => o.label === 'value')?.content;

    if (!blockTriggeredId || !condition || !desiredAction) return false;

    const blockTriggeredValue = context.answers?.find(a => a.block_id === blockTriggeredId)?.content || '';

    const conditionSatisfied =
      (condition === 'isEmpty' && (!blockTriggeredValue || blockTriggeredValue.trim() === '')) ||
      (condition === 'notEmpty' && blockTriggeredValue.trim() !== '') ||
      (condition === 'contains' && blockTriggeredValue.includes(conditionValue || '')) ||
      (condition === 'notContain' && !blockTriggeredValue.includes(conditionValue || ''));

    if (action === 'show') {
      if (conditionSatisfied && desiredAction === 'hide') return true;
      if (!conditionSatisfied && desiredAction === 'show') return true;
    } else if (action === 'disable') {
      if (conditionSatisfied && desiredAction === 'disable') return true;
      if (!conditionSatisfied && desiredAction === 'enable') return true;
    }
  }

  return false;
};
