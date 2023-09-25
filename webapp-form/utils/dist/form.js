"use strict";
exports.__esModule = true;
exports.secondSection = exports.firstSection = void 0;
exports.firstSection = [
    {
        name: 'satisfaction',
        kind: 'smiley',
        label: 'fields.satisfaction.label',
        hint: 'Ce champ est obligatoire'
    }
];
exports.secondSection = [
    {
        name: 'easy',
        kind: 'smiley',
        label: 'Était-ce facile à utiliser ?'
    },
    {
        name: 'comprehension',
        kind: 'smiley',
        label: 'Le langage employé était-il facile à comprendre ?'
    },
    {
        name: 'difficulties',
        kind: 'checkbox',
        label: 'Avez-vous rencontré des difficultés ?',
        options: [
            {
                label: "Manque d'informations avant de commencer la démarche",
                value: "Manque d'informations avant de commencer la démarche"
            },
            {
                label: "La démarche n'a pas fonctionné",
                value: "La démarche n'a pas fonctionné"
            },
            {
                label: 'Difficulté à joindre les pièces justificatives',
                value: 'Difficulté à joindre les pièces justificatives'
            },
            {
                label: "Manque d'informations sur la suite, le délai...",
                value: "Manque d'informations sur la suite, le délai..."
            },
            {
                label: 'Autre',
                value: 'Autre'
            }
        ]
    },
    {
        condition: {
            name: 'difficulties',
            value: 'Autre'
        },
        name: 'difficulties_verbatim',
        kind: 'input-text',
        hint: 'Maximum 250 caractères.',
        label: 'Pouvez-vous préciser quelle autre difficulté vous avez rencontré ?'
    },
    {
        name: 'help',
        kind: 'checkbox',
        label: 'De quelle aide avez-vous eu besoin ?',
        options: [
            {
                label: 'Aucune',
                value: 'Aucune'
            },
            {
                label: 'Un ou une proche',
                hint: 'Famille, amis...',
                value: 'Un ou une proche'
            },
            {
                label: 'Une association',
                value: 'Une association'
            },
            {
                label: 'Un agent public',
                hint: "Santé, enseignement, impôts, force de l'ordre, France services...",
                value: 'Un agent public'
            },
            {
                label: 'Internet',
                hint: 'Site, forum...',
                value: 'Internet'
            },
            {
                label: 'Autre',
                value: 'Autre'
            }
        ]
    },
    {
        condition: {
            name: 'help',
            value: 'Autre'
        },
        name: 'help_verbatim',
        kind: 'input-text',
        hint: 'Maximum 250 caractères.',
        label: 'Pouvez-vous préciser de quelle autre aide vous avez eu besoin ?'
    },
    {
        name: 'verbatim',
        kind: 'input-textarea',
        hint: (React.createElement(React.Fragment, null,
            "Ne communiquez aucune information personnelle ici.",
            React.createElement("br", null),
            "Ceci n\u2019est pas un formulaire de contact. Si vous avez des questions sur cette d\u00E9marche, contactez le service concern\u00E9.")),
        label: 'Souhaitez-vous nous en dire davantage ?'
    }
];
