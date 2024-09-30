import { BlockWithPartialRelations } from "@/prisma/generated/zod";

export const areArrayEquals = (array1?: any[], array2?: any[]) => {
  if (!array1) return false;
  if (!array2) return false;

  return (
    array1.length === array2.length &&
    array1.every((value, index) => value === array2[index])
  );
};

export const applyLogicForm = (when: BlockWithPartialRelations | null, then: BlockWithPartialRelations | null, type_action: string): boolean => {
  console.log('checking ', when, 'and ', then, 'for action : ', type_action)
  return false
}
