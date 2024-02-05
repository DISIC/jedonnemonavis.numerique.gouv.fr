export const FIELD_CODE_BOOLEAN_VALUES = [
    {code : 'difficulties', question: "Avez-vous rencontré des difficultés ?"},
    {code : 'help', question: "Avez-vous eu besoin d'une aide supplémentaire pour cette démarche ?"},
    {code : 'contact_reached', question: "Avez vous réussi à les joindre ?"}
] as const;
export const FIELD_CODE_SMILEY_VALUES = [
    {code : 'satisfaction', question: "Comment s'est passée cette démarche pour vous ?"},
    {code : 'easy', question: "Selon les réponses suivantes, qu'est ce qui vous correspond le mieux :"},
    {code : 'comprehension', question: "Qu'avez-vous pensé du langage utilisé ?"},
    {code : 'contact_satisfaction', question: "Comment s’est passé l’échange avec le service de la démarche ?"},
] as const;
export const FIELD_CODE_DETAILS_VALUES = [
    {code : 'difficulties_details', question: "Quelles ont été ces difficultés ?"},
    {code : 'contact', question: "Avez-vous tenté de contacter le service d'aide en charge de la démarche ?"},
    {code : 'contact_channels', question: "Par quel(s) moyen(s) avez-vous tenté de contacter le service de la démarche ?"},
    {code : 'help_details', question: "De quelle aide avez vous eu besoin ?"}
] as const;
