import { Product, Step } from "./types";

export const areArrayEquals = (array1?: any[], array2?: any[]) => {
  if (!array1) return false;
  if (!array2) return false;

  return (
    array1.length === array2.length &&
    array1.every((value, index) => value === array2[index])
  );
};

type Serialized<T> = T extends Date
  ? string
  : T extends Array<infer U>
    ? Array<Serialized<U>>
    : T extends object
      ? { [K in keyof T]: Serialized<T[K]> }
      : T;

export const serializeData = <T>(obj: T): Serialized<T> => {
  if (obj === null || obj === undefined) {
    return obj as Serialized<T>;
  }

  if (obj instanceof Date) {
    return obj.toString() as Serialized<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => serializeData(item)) as Serialized<T>;
  }

  if (typeof obj === "object") {
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = serializeData(obj[key]);
      }
    }
    return result as Serialized<T>;
  }

  return obj as Serialized<T>;
};

export const filterByFormConfig = (
  index: number,
  formTemplate: Product["form"]["form_template"],
  formConfig?: Product["form"]["form_configs"][0],
) => {
  if (!formConfig) return true;

  const formTemplateStep = formTemplate.form_template_steps.find(
    (fts) => fts.position === index + 1,
  );

  const isHidden = formConfig.form_config_displays.some(
    (fcd) =>
      fcd.kind === "step" &&
      fcd.parent_id === formTemplateStep?.id &&
      fcd.hidden,
  );

  return !isHidden;
};
