import { FormField, Step } from "./types";

export const secondSection: FormField[] = [
  {
    name: "easy",
    kind: "radio",
    label: "fields.easy.label",
    options: [
      {
        label: "fields.easy.options.0.label",
        value: 4,
        intention: "good",
      },
      {
        label: "fields.easy.options.1.label",
        value: 5,
        intention: "medium",
      },
      {
        label: "fields.easy.options.2.label",
        value: 6,
        intention: "bad",
      },
    ],
  },
  {
    name: "comprehension",
    kind: "radio",
    label: "fields.comprehension.label",
    options: [
      {
        label: "fields.comprehension.options.0.label",
        value: 7,
        intention: "bad",
      },
      {
        label: "fields.comprehension.options.1.label",
        value: 8,
        intention: "medium",
      },
      {
        label: "fields.comprehension.options.2.label",
        value: 9,
        intention: "good",
      },
    ],
  },
  {
    name: "difficulties",
    kind: "radio",
    label: "fields.difficulties.label",
    options: [
      {
        label: "fields.difficulties.options.0.label",
        value: 10,
        intention: "bad",
      },
      {
        label: "fields.difficulties.options.1.label",
        value: 11,
        intention: "good",
      },
    ],
  },
  {
    name: "difficulties_details",
    kind: "checkbox",
    label: "fields.difficulties_details.label",
    hint: "",
    conditions: [
      {
        name: "difficulties",
        values: [10],
      },
    ],
    options: [
      {
        label: "fields.difficulties_details.options.0.label",
        value: 12,
        intention: "bad",
      },
      {
        label: "fields.difficulties_details.options.1.label",
        value: 13,
        intention: "bad",
      },
      {
        label: "fields.difficulties_details.options.2.label",
        value: 14,
        intention: "bad",
      },
      {
        label: "fields.difficulties_details.options.3.label",
        value: 15,
        intention: "bad",
      },
      {
        label: "fields.difficulties_details.options.4.label",
        value: 16,
        intention: "bad",
      },
      {
        label: "fields.difficulties_details.options.5.label",
        value: 17,
        intention: "bad",
      },
    ],
  },
  {
    conditions: [
      {
        name: "difficulties_details",
        values: [17],
      },
    ],
    name: "difficulties_details_verbatim",
    kind: "input-text",
    hint: "fields.difficulties_details_verbatim.hint",
    label: "fields.difficulties_details_verbatim.label",
  },
  {
    name: "contact",
    kind: "radio",
    label: "fields.contact.label",
    options: [
      {
        label: "fields.contact.options.0.label",
        value: 18,
        intention: "neutral",
      },
      {
        label: "fields.contact.options.1.label",
        value: 19,
        intention: "neutral",
      },
      {
        label: "fields.contact.options.2.label",
        value: 20,
        intention: "neutral",
      },
    ],
  },
  {
    conditions: [{ name: "contact", values: [19] }],
    name: "contact_reached",
    kind: "radio",
    label: "fields.contact_reached.label",
    options: [
      {
        label: "fields.contact_reached.options.0.label",
        value: 21,
        intention: "good",
      },
      {
        label: "fields.contact_reached.options.1.label",
        value: 22,
        intention: "bad",
      },
    ],
  },
  {
    conditions: [
      {
        name: "contact_reached",
        values: [21],
      },
    ],
    name: "contact_channels",
    kind: "checkbox",
    label: "fields.contact_channels.label",
    hint: "",
    options: [
      {
        label: "fields.contact_channels.options.0.label",
        value: 23,
        intention: "neutral",
      },
      {
        label: "fields.contact_channels.options.1.label",
        value: 24,
        intention: "neutral",
      },
      {
        label: "fields.contact_channels.options.2.label",
        value: 25,
        intention: "neutral",
      },
      {
        label: "fields.contact_channels.options.3.label",
        value: 26,
        intention: "neutral",
      },
    ],
  },
  {
    conditions: [
      {
        name: "contact_channels",
        values: [26],
      },
    ],
    name: "contact_channels_verbatim",
    kind: "input-text",
    hint: "fields.contact_channels_verbatim.hint",
    label: "fields.contact_channels_verbatim.label",
  },
  {
    conditions: [
      {
        name: "contact_reached",
        values: [21],
      },
    ],
    name: "contact_satisfaction",
    kind: "smiley",
    label: "fields.contact_satisfaction.label",
    values: {
      bad: 27,
      medium: 28,
      good: 29,
    },
  },
  {
    name: "help",
    kind: "radio",
    label: "fields.help.label",
    options: [
      {
        label: "fields.help.options.0.label",
        value: 30,
        intention: "bad",
      },
      {
        label: "fields.help.options.1.label",
        value: 31,
        intention: "good",
      },
    ],
  },
  {
    name: "help_details",
    kind: "checkbox",
    label: "fields.help_details.label",
    hint: "",
    conditions: [
      {
        name: "help",
        values: [30],
      },
    ],
    options: [
      {
        label: "fields.help_details.options.0.label",
        value: 32,
        intention: "neutral",
      },
      {
        label: "fields.help_details.options.1.label",
        value: 33,
        intention: "neutral",
      },
      {
        label: "fields.help_details.options.2.label",
        value: 34,
        intention: "neutral",
      },
      {
        label: "fields.help_details.options.3.label",
        value: 35,
        intention: "neutral",
      },
    ],
  },
  {
    conditions: [
      {
        name: "help_details",
        values: [35],
      },
    ],
    name: "help_details_verbatim",
    kind: "input-text",
    hint: "fields.help_details_verbatim.hint",
    label: "fields.help_details_verbatim.label",
  },
  {
    name: "verbatim",
    kind: "input-textarea",
    hint: "fields.verbatim.hint",
    label: "fields.verbatim.label",
  },
];
