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
    kind: 'checkbox',
    label: 'fields.difficulties.label',
    options: [
      {
        label: 'fields.difficulties.options.0.label',
        value: 'no',
        isolated: true
      },
      {
        label: 'fields.difficulties.options.1.label',
        value: 'yes-missing-infos-before'
      },
      {
        label: 'fields.difficulties.options.2.label',
        value: 'yes-bug'
      },
      {
        label: 'fields.difficulties.options.3.label',
        value: 'yes-bug-display-mobile'
      },
      {
        label: 'fields.difficulties.options.4.label',
        value: 'yes-bug-upload-documents'
      },
      {
        label: 'fields.difficulties.options.5.label',
        value: 'yes-missing-infos-after'
      },
      {
        label: 'fields.difficulties.options.6.label',
        value: 'yes-other'
      }
    ]
  },
  {
    condition: {
      name: 'difficulties',
      values: ['yes-other']
    },
    name: 'difficulties_verbatim',
    kind: 'input-text',
    hint: 'fields.difficulties_verbatim.hint',
    label: 'fields.difficulties_verbatim.label'
  },
  {
    name: 'contact',
    kind: 'radio',
    label: 'fields.contact.label',
    options: [
      {
        label: 'fields.contact.options.0.label',
        value: 'no'
      },
      {
        label: 'fields.contact.options.1.label',
        value: 'yes-but-not-found'
      },
      {
        label: 'fields.contact.options.2.label',
        value: 'yes-but-not-reached'
      },
      {
        label: 'fields.contact.options.3.label',
        value: 'yes-reached'
      }
    ]
  },
  {
    condition: {
      name: 'contact',
      values: ['yes-reached']
    },
    name: 'contact_satisfaction',
    kind: 'smiley',
    label: 'fields.contact_satisfaction.label'
  },
  {
    condition: {
      name: 'contact',
      values: ['yes-but-not-found', 'yes-but-not-reached', 'yes-reached']
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
    name: 'help',
    kind: 'checkbox',
    label: 'fields.help.label',
    options: [
      {
        label: 'fields.help.options.0.label',
        value: 'no',
        isolated: true
      },
      {
        label: 'fields.help.options.1.label',
        value: 'yes-internet'
      },
      {
        label: 'fields.help.options.2.label',
        value: 'yes-relative'
      },
      {
        label: 'fields.help.options.3.label',
        value: 'yes-association'
      },
      {
        label: 'fields.help.options.4.label',
        value: 'yes-other'
      }
    ]
  },
  {
    condition: {
      name: 'help',
      values: ['yes-other']
    },
    name: 'help_verbatim',
    kind: 'input-text',
    hint: 'fields.help_verbatim.hint',
    label: 'fields.help_verbatim.label'
  },
  {
    name: 'verbatim',
    kind: 'input-textarea',
    hint: 'fields.verbatim.hint',
    label: 'fields.verbatim.label'
  }
];
