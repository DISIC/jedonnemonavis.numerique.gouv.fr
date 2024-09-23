import { FormField, Step } from "./types";

export const primarySection: FormField[] = [
  {
    name: "satisfaction",
    kind: "smiley",
    label: "fields.satisfaction.label",
    hint: "fields.satisfaction.hint",
    values: {
      bad: 1,
      medium: 2,
      good: 3,
    },
  },
];

export const firstSectionA: FormField[] = [
  {
    name: "comprehension",
    kind: "radio",
    label: "fields.comprehension.label",
    hint: "fields.comprehension.hint",
    hintLeft: "fields.comprehension.hintLeft",
    hintRight: "fields.comprehension.hintRight",
    options: [
      {
        label: "fields.comprehension.options.0.label",
        value: 4,
        intention: "very_bad",
      },
      {
        label: "fields.comprehension.options.1.label",
        value: 5,
        intention: "bad",
      },
      {
        label: "fields.comprehension.options.2.label",
        value: 6,
        intention: "medium",
      },
      {
        label: "fields.comprehension.options.3.label",
        value: 7,
        intention: "good",
      },
      {
        label: "fields.comprehension.options.4.label",
        value: 8,
        intention: "very_good",
      },
    ],
  },
];

export const secondSectionA: FormField[] = [
  {
    name: "contact_tried",
    kind: "checkbox",
    label: "fields.contact_tried.label",
    hint: "fields.contact_tried.hint",
    options: [
      {
        label: "fields.contact_tried.options.0.label",
        value: 9,
        intention: "neutral",
      },
      {
        label: "fields.contact_tried.options.1.label",
        value: 10,
        intention: "neutral",
      },
      {
        label: "fields.contact_tried.options.2.label",
        value: 11,
        intention: "neutral",
      },
      {
        label: "fields.contact_tried.options.3.label",
        value: 12,
        intention: "neutral",
      },
      {
        label: "fields.contact_tried.options.4.label",
        value: 13,
        intention: "neutral",
      },
      {
        label: "fields.contact_tried.options.5.label",
        value: 14,
        intention: "neutral",
      },
      {
        label: "fields.contact_tried.options.6.label",
        value: 15,
        intention: "neutral",
      },
      {
        label: "fields.contact_tried.options.7.label",
        value: 16,
        intention: "neutral",
      },
      {
        label: "fields.contact_tried.options.8.label",
        value: 17,
        intention: "good",
        isolated: true,
      },
    ],
  },
  {
    conditions: [
      {
        name: "contact_tried",
        values: [16],
      },
    ],
    name: "contact_tried_verbatim",
    kind: "input-textarea",
    hint: "fields.contact_tried_verbatim.hint",
    label: "fields.contact_tried_verbatim.label",
  },
  // {
  //   name: "contact_tried",
  //   kind: "checkbox",
  //   label: "",
  //   hint: "",
  //   options: [
  //     {
  //       label: "fields.contact_tried.options.8.label",
  //       value: 17,
  //       intention: "neutral",
  //       isolated: true,
  //     },
  //   ],
  // },
  {
    name: "contact_reached",
    conditions: [
      {
        name: "contact_tried",
        values: [9, 10, 11, 12],
      },
    ],
    kind: "yes-no",
    label: "fields.contact_reached.label",
    options: [
      {
        label: "fields.contact_reached.options.0.label",
        value: 17,
        intention: "good",
      },
      {
        label: "fields.contact_reached.options.1.label",
        value: 18,
        intention: "bad",
      },
    ],
    needed: [9, 10, 11, 12],
    excluded: [13, 14, 15, 16, 17],
  },
  {
    name: "contact_satisfaction",
    kind: "array-radio",
    label: "fields.contact_satisfaction.label",
    options: [
      {
        label: "fields.contact_satisfaction.options.0.label",
        value: 19,
        intention: "very_bad",
      },
      {
        label: "fields.contact_satisfaction.options.1.label",
        value: 20,
        intention: "bad",
      },
      {
        label: "fields.contact_satisfaction.options.2.label",
        value: 21,
        intention: "medium",
      },
      {
        label: "fields.contact_satisfaction.options.3.label",
        value: 22,
        intention: "good",
      },
      {
        label: "fields.contact_satisfaction.options.4.label",
        value: 23,
        intention: "very_good",
      },
      {
        label: "fields.contact_satisfaction.options.5.label",
        value: 24,
        intention: "neutral",
      },
    ],
    needed: [9, 10, 11, 12],
    excluded: [16],
  },
];

export const thirdSectionA: FormField[] = [
  {
    name: "verbatim",
    kind: "input-textarea",
    hint: "fields.verbatim.hint",
    label: "fields.verbatim.label",
  },
];

export const allFields: FormField[] = primarySection
  .concat(firstSectionA)
  .concat(secondSectionA)
  .concat(thirdSectionA);

export const steps_A: Step[] = [
  {
    name: "steps.A_1.name",
    section: firstSectionA,
    button: "steps.A_1.button",
    buttonBack: "steps.A_1.buttonBack",
  },
  {
    name: "steps.A_2.name",
    section: secondSectionA,
    button: "steps.A_2.button",
    buttonBack: "steps.A_2.buttonBack",
  },
  {
    name: "steps.A_3.name",
    section: thirdSectionA,
    button: "steps.A_3.button",
    buttonBack: "steps.A_3.buttonBack",
  },
];

export const steps_B: Step[] = [
  {
    name: "steps.B_2.name",
    section: firstSectionA.concat(secondSectionA, thirdSectionA),
    button: "steps.B_2.button",
    buttonBack: "steps.B_2.buttonBack",
  },
];
