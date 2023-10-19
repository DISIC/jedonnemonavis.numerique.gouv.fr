import { FormField } from './types';

export const firstSection: FormField[] = [
  {
    name: 'satisfaction',
    kind: 'smiley',
    label: 'fields.satisfaction.label',
    hint: 'fields.satisfaction.hint'
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
        value: 'good'
      },
      {
        label: 'fields.easy.options.1.label',
        value: 'medium'
      },
      {
        label: 'fields.easy.options.2.label',
        value: 'bad'
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
        value: 'bad'
      },
      {
        label: 'fields.comprehension.options.1.label',
        value: 'medium'
      },
      {
        label: 'fields.comprehension.options.2.label',
        value: 'good'
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
        value: 'yes'
      },
      {
        label: 'fields.difficulties.options.1.label',
        value: 'no'
      }
    ]
  },
  {
    name: 'difficulties_details',
    kind: 'checkbox',
    label: 'fields.difficulties_details.label',
    condition: {
      name: 'difficulties',
      values: ['yes']
    },
    options: [
      {
        label: 'fields.difficulties_details.options.0.label',
        value: 'missing-infos-before'
      },
      {
        label: 'fields.difficulties_details.options.1.label',
        value: 'bug'
      },
      {
        label: 'fields.difficulties_details.options.2.label',
        value: 'bug-display-mobile'
      },
      {
        label: 'fields.difficulties_details.options.3.label',
        value: 'bug-upload-documents'
      },
      {
        label: 'fields.difficulties_details.options.4.label',
        value: 'missing-infos-after'
      },
      {
        label: 'fields.difficulties_details.options.5.label',
        value: 'other'
      }
    ]
  },
  {
    condition: {
      name: 'difficulties_details',
      values: ['other']
    },
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
        value: 'yes'
      },
      {
        label: 'fields.contact.options.1.label',
        value: 'no'
      }
    ]
  },
  {
    name: 'contact_details',
    kind: 'radio',
    label: 'fields.contact_details.label',
    condition: {
      name: 'contact',
      values: ['yes']
    },
    options: [
      {
        label: 'fields.contact_details.options.0.label',
        value: 'not-found'
      },
      {
        label: 'fields.contact_details.options.1.label',
        value: 'not-reached'
      },
      {
        label: 'fields.contact_details.options.2.label',
        value: 'reached'
      }
    ]
  },

  {
    condition: {
      name: 'contact_details',
      values: ['not-reached', 'reached']
    },
    name: 'contact_channels',
    kind: 'checkbox',
    label: 'fields.contact_channels.label',
    options: [
      {
        label: 'fields.contact_channels.options.0.label',
        value: 'phone'
      },
      {
        label: 'fields.contact_channels.options.1.label',
        value: 'email-or-messaging'
      },
      {
        label: 'fields.contact_channels.options.2.label',
        value: 'agency-counter'
      },
      {
        label: 'fields.contact_channels.options.3.label',
        value: 'other'
      }
    ]
  },
  {
    condition: {
      name: 'contact_channels',
      values: ['other']
    },
    name: 'contact_channels_verbatim',
    kind: 'input-text',
    hint: 'fields.contact_channels_verbatim.hint',
    label: 'fields.contact_channels_verbatim.label'
  },
  {
    condition: {
      name: 'contact_details',
      values: ['reached']
    },
    name: 'contact_satisfaction',
    kind: 'smiley',
    label: 'fields.contact_satisfaction.label'
  },
  {
    name: 'help',
    kind: 'radio',
    label: 'fields.help.label',
    options: [
      {
        label: 'fields.help.options.0.label',
        value: 'yes'
      },
      {
        label: 'fields.help.options.1.label',
        value: 'no'
      }
    ]
  },
  {
    name: 'help_details',
    kind: 'checkbox',
    label: 'fields.help_details.label',
    condition: {
      name: 'help',
      values: ['yes']
    },
    options: [
      {
        label: 'fields.help_details.options.0.label',
        value: 'internet'
      },
      {
        label: 'fields.help_details.options.1.label',
        value: 'relative'
      },
      {
        label: 'fields.help_details.options.2.label',
        value: 'association'
      },
      {
        label: 'fields.help_details.options.3.label',
        value: 'other'
      }
    ]
  },
  {
    condition: {
      name: 'help_details',
      values: ['other']
    },
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
