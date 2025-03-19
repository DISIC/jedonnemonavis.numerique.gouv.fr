export const areArrayEquals = (array1?: any[], array2?: any[]) => {
  if (!array1) return false;
  if (!array2) return false;

  return (
    array1.length === array2.length &&
    array1.every((value, index) => value === array2[index])
  );
};
