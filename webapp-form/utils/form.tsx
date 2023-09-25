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
		kind: 'smiley',
		label: 'fields.easy.label'
	},
	{
		name: 'comprehension',
		kind: 'smiley',
		label: 'fields.comprehension.label'
	},
	{
		name: 'difficulties',
		kind: 'checkbox',
		label: 'fields.difficulties.label',
		options: [
			{
				label: 'fields.difficulties.options.0.label',
				value: 'fields.difficulties.options.0.label'
			},
			{
				label: 'fields.difficulties.options.1.label',
				value: 'fields.difficulties.options.1.label'
			},
			{
				label: 'fields.difficulties.options.2.label',
				value: 'fields.difficulties.options.2.label'
			},
			{
				label: 'fields.difficulties.options.3.label',
				value: 'fields.difficulties.options.3.label'
			},
			{
				label: 'fields.difficulties.options.4.label',
				value: 'fields.difficulties.options.4.label'
			}
		]
	},
	{
		condition: {
			name: 'difficulties',
			value: 'fields.difficulties.options.4.label'
		},
		name: 'difficulties_verbatim',
		kind: 'input-text',
		hint: 'fields.difficulties_verbatim.hint',
		label: 'fields.difficulties_verbatim.label'
	},
	{
		name: 'help',
		kind: 'checkbox',
		label: 'fields.help.label',
		options: [
			{
				label: 'fields.help.options.0.label',
				value: 'fields.help.options.0.label'
			},
			{
				label: 'fields.help.options.1.label',
				hint: 'fields.help.options.1.hint',
				value: 'fields.help.options.1.label'
			},
			{
				label: 'fields.help.options.2.label',
				value: 'fields.help.options.2.label'
			},
			{
				label: 'fields.help.options.3.label',
				hint: 'fields.help.options.3.hint',
				value: 'fields.help.options.3.label'
			},
			{
				label: 'fields.help.options.4.label',
				hint: 'fields.help.options.4.hint',
				value: 'fields.help.options.4.label'
			},
			{
				label: 'fields.help.options.5.label',
				value: 'fields.help.options.5.label'
			}
		]
	},
	{
		condition: {
			name: 'help',
			value: 'fields.help.options.5.label'
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
