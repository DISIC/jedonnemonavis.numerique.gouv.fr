import { FormField, Step } from './types';

export const firstSection: FormField[] = [
  {
    name: 'satisfaction',
    kind: 'smiley',
    label: 'fields.satisfaction.label',
    hint: 'fields.satisfaction.hint',
    values: {
      bad: 1,
      medium: 2,
      good: 3
    }
  }
];

export const secondSection: FormField[] = [
  {
    name: 'easy',
    kind: 'radio',
    label: 'fields.easy.label',
    options: [
      {
        label: 'fields.easy.options.0.label',
        value: 4,
        intention: 'good'
      },
      {
        label: 'fields.easy.options.1.label',
        value: 5,
        intention: 'medium'
      },
      {
        label: 'fields.easy.options.2.label',
        value: 6,
        intention: 'bad'
      }
    ]
  },
  {
    name: 'comprehension',
    kind: 'radio',
    label: 'fields.comprehension.label',
    options: [
      {
        label: 'fields.comprehension.options.0.label',
        value: 7,
        intention: 'bad'
      },
      {
        label: 'fields.comprehension.options.1.label',
        value: 8,
        intention: 'medium'
      },
      {
        label: 'fields.comprehension.options.2.label',
        value: 9,
        intention: 'good'
      }
    ]
  },
  {
    name: 'difficulties',
    kind: 'radio',
    label: 'fields.difficulties.label',
    options: [
      {
        label: 'fields.difficulties.options.0.label',
        value: 10,
        intention: 'bad'
      },
      {
        label: 'fields.difficulties.options.1.label',
        value: 11,
        intention: 'good'
      }
    ]
  },
  {
    name: 'difficulties_details',
    kind: 'checkbox',
    label: 'fields.difficulties_details.label',
    hint: '',
    conditions: [
      {
        name: 'difficulties',
        values: [10]
      }
    ],
    options: [
      {
        label: 'fields.difficulties_details.options.0.label',
        value: 12,
        intention: 'bad'
      },
      {
        label: 'fields.difficulties_details.options.1.label',
        value: 13,
        intention: 'bad'
      },
      {
        label: 'fields.difficulties_details.options.2.label',
        value: 14,
        intention: 'bad'
      },
      {
        label: 'fields.difficulties_details.options.3.label',
        value: 15,
        intention: 'bad'
      },
      {
        label: 'fields.difficulties_details.options.4.label',
        value: 16,
        intention: 'bad'
      },
      {
        label: 'fields.difficulties_details.options.5.label',
        value: 17,
        intention: 'bad'
      }
    ]
  },
  {
    conditions: [
      {
        name: 'difficulties_details',
        values: [17]
      }
    ],
    name: 'difficulties_details_verbatim',
    kind: 'input-text',
    hint: 'fields.difficulties_details_verbatim.hint',
    label: 'fields.difficulties_details_verbatim.label'
  },
  {
    name: 'contact',
    kind: 'radio',
    label: 'fields.contact.label',
    options: [
      {
        label: 'fields.contact.options.0.label',
        value: 18,
        intention: 'neutral'
      },
      {
        label: 'fields.contact.options.1.label',
        value: 19,
        intention: 'neutral'
      },
      {
        label: 'fields.contact.options.2.label',
        value: 20,
        intention: 'neutral'
      }
    ]
  },
  {
    conditions: [{ name: 'contact', values: [19] }],
    name: 'contact_reached',
    kind: 'radio',
    label: 'fields.contact_reached.label',
    options: [
      {
        label: 'fields.contact_reached.options.0.label',
        value: 21,
        intention: 'good'
      },
      {
        label: 'fields.contact_reached.options.1.label',
        value: 22,
        intention: 'bad'
      }
    ]
  },
  {
    conditions: [
      {
        name: 'contact_reached',
        values: [21]
      }
    ],
    name: 'contact_channels',
    kind: 'checkbox',
    label: 'fields.contact_channels.label',
    hint: '',
    options: [
      {
        label: 'fields.contact_channels.options.0.label',
        value: 23,
        intention: 'neutral'
      },
      {
        label: 'fields.contact_channels.options.1.label',
        value: 24,
        intention: 'neutral'
      },
      {
        label: 'fields.contact_channels.options.2.label',
        value: 25,
        intention: 'neutral'
      },
      {
        label: 'fields.contact_channels.options.3.label',
        value: 26,
        intention: 'neutral'
      }
    ]
  },
  {
    conditions: [
      {
        name: 'contact_channels',
        values: [26]
      }
    ],
    name: 'contact_channels_verbatim',
    kind: 'input-text',
    hint: 'fields.contact_channels_verbatim.hint',
    label: 'fields.contact_channels_verbatim.label'
  },
  {
    conditions: [
      {
        name: 'contact_reached',
        values: [21]
      }
    ],
    name: 'contact_satisfaction',
    kind: 'smiley',
    label: 'fields.contact_satisfaction.label',
    values: {
      bad: 27,
      medium: 28,
      good: 29
    }
  },
  {
    name: 'help',
    kind: 'radio',
    label: 'fields.help.label',
    options: [
      {
        label: 'fields.help.options.0.label',
        value: 30,
        intention: 'bad'
      },
      {
        label: 'fields.help.options.1.label',
        value: 31,
        intention: 'good'
      }
    ]
  },
  {
    name: 'help_details',
    kind: 'checkbox',
    label: 'fields.help_details.label',
    hint: '',
    conditions: [
      {
        name: 'help',
        values: [30]
      }
    ],
    options: [
      {
        label: 'fields.help_details.options.0.label',
        value: 32,
        intention: 'neutral'
      },
      {
        label: 'fields.help_details.options.1.label',
        value: 33,
        intention: 'neutral'
      },
      {
        label: 'fields.help_details.options.2.label',
        value: 34,
        intention: 'neutral'
      },
      {
        label: 'fields.help_details.options.3.label',
        value: 35,
        intention: 'neutral'
      }
    ]
  },
  {
    conditions: [
      {
        name: 'help_details',
        values: [35]
      }
    ],
    name: 'help_details_verbatim',
    kind: 'input-text',
    hint: 'fields.help_details_verbatim.hint',
    label: 'fields.help_details_verbatim.label'
  },
  {
    name: 'verbatim',
    kind: 'input-textarea',
    hint: 'fields.verbatim.hint',
    label: 'fields.verbatim.label'
  }
];

export const firstSectionA: FormField[] = [
    {
      name: 'easy',
      kind: 'radio',
      label: 'fields.easy.label',
      hint: 'fields.easy.hint',
      hintLeft: 'fields.easy.hintLeft',
      hintRight: 'fields.easy.hintRight',
      options: [
        {
          label: 'fields.easy.options.0.label',
          value: 4,
          intention: 'very_bad'
        },
        {
          label: 'fields.easy.options.1.label', 
          value: 5,
          intention: 'bad'
        },
        {
          label: 'fields.easy.options.2.label',
          value: 6,
          intention: 'medium'
        },
        {
          label: 'fields.easy.options.3.label',
          value: 7,
          intention: 'good'
        },
        {
          label: 'fields.easy.options.4.label',
          value: 8,
          intention: 'very_good'
        }
      ]
    }
]

export const secondSectionA: FormField[] = [
  {
    name: 'contact_tried',
    kind: 'checkbox',
    label: 'fields.contact_tried.label',
    hint: 'fields.contact_tried.hint',
    options: [
      {
        label: 'fields.contact_tried.options.0.label',
        value: 9,
        intention: 'neutral'
      },
      {
        label: 'fields.contact_tried.options.1.label', 
        value: 10,
        intention: 'neutral'
      },
      {
        label: 'fields.contact_tried.options.2.label',
        value: 11,
        intention: 'neutral'
      },
      {
        label: 'fields.contact_tried.options.3.label',
        value: 12,
        intention: 'neutral'
      },
      {
        label: 'fields.contact_tried.options.4.label',
        value: 13,
        intention: 'neutral'
      },
      {
        label: 'fields.contact_tried.options.5.label',
        value: 14,
        intention: 'neutral'
      },
      {
        label: 'fields.contact_tried.options.6.label',
        value: 15,
        intention: 'neutral'
      },
      {
        label: 'fields.contact_tried.options.7.label',
        value: 16,
        intention: 'neutral'
      }
    ]
  },
  {
    conditions: [
      {
        name: 'contact_tried',
        values: [16]
      }
    ],
    name: 'contact_channels_verbatim',
    kind: 'input-textarea',
    hint: 'fields.contact_channels_verbatim.hint',
    label: 'fields.contact_channels_verbatim.label'
  },
  {
    name: 'contact_reached',
    kind: 'yes-no',
    label: 'fields.contact_reached.label',
    options: [
      {
        label: 'fields.contact_reached.options.0.label',
        value: 17,
        intention: 'neutral'
      },
      {
        label: 'fields.contact_reached.options.1.label',
        value: 18,
        intention: 'neutral'
      }
    ],
    needed: [9, 10, 11, 12],
    excluded: [16]
  },
  {
    name: 'contact_satisfaction',
    kind: 'array-radio',
    label: 'fields.contact_satisfaction.label',
    options: [
      {
        label: 'fields.contact_satisfaction.options.0.label',
        value: 19,
        intention: 'very_bad'
      },
      {
        label: 'fields.contact_satisfaction.options.1.label',
        value: 20,
        intention: 'bad'
      },
      {
        label: 'fields.contact_satisfaction.options.2.label',
        value: 21,
        intention: 'medium'
      },
      {
        label: 'fields.contact_satisfaction.options.3.label',
        value: 22,
        intention: 'good'
      },
      {
        label: 'fields.contact_satisfaction.options.4.label',
        value: 23,
        intention: 'very_good'
      },
      {
        label: 'fields.contact_satisfaction.options.5.label',
        value: 24,
        intention: 'neutral'
      }
    ],
    needed: [9, 10, 11, 12],
    excluded: [16]
  }
  
]

export const steps_A: Step[] = [
  {
    name: 'steps.A_1.name',
    section: firstSectionA,
    button: 'steps.A_1.button'
  },
  {
    name: 'steps.A_2.name',
    section: secondSectionA,
    button: 'steps.A_2.button'
  },
  {
    name: 'steps.A_3.name',
    section: secondSection,
    button: 'steps.A_3.button'
  }       
]

export const steps_B = [

]
