import { PrismaClient, Typebloc } from '@prisma/client';
import { TRPCError } from '@trpc/server';

/**
 * Les endpoints d'agrégation de `answerRouter` renvoient la valeur brute des
 * réponses comme clé de bucket. Ils ne doivent donc être ouverts qu'aux
 * questions à choix fermé : sur un champ libre (`verbatim`, `contact_email`,
 * …) l'agrégation revient à dumper les réponses des usagers.
 */
const AGGREGATABLE_TYPE_BLOCS: Typebloc[] = [
	'mark_input',
	'smiley_input',
	'select',
	'radio',
	'checkbox'
];

/**
 * Questions à choix fermé des formulaires historiques (form_id 1 et 2), qui ne
 * sont pas décrites par un FormTemplate en base.
 */
const LEGACY_AGGREGATABLE_FIELD_CODES = new Set([
	'satisfaction',
	'easy',
	'comprehension',
	'difficulties',
	'difficulties_details',
	'help',
	'help_details',
	'contact',
	'contact_tried',
	'contact_reached',
	'contact_channels',
	'contact_details',
	'contact_satisfaction'
]);

const forbidden = (field_code: string) =>
	new TRPCError({
		code: 'BAD_REQUEST',
		message: `Field code "${field_code}" is not aggregatable`
	});

/**
 * Vérifie qu'un `field_code` correspond bien à une question à choix fermé,
 * soit du formulaire historique, soit du template du formulaire ciblé.
 */
export const assertAggregatableFieldCode = async ({
	prisma,
	form,
	field_code
}: {
	prisma: PrismaClient;
	form: { form_template_id: number };
	field_code: string;
}) => {
	if (LEGACY_AGGREGATABLE_FIELD_CODES.has(field_code)) return;

	const block = await prisma.formTemplateBlock.findFirst({
		where: {
			field_code,
			type_bloc: { in: AGGREGATABLE_TYPE_BLOCS },
			form_template_step: { form_template_id: form.form_template_id }
		},
		select: { id: true }
	});

	if (!block) throw forbidden(field_code);
};

/**
 * Variante sans formulaire connu (endpoints agrégeant sur l'ensemble des
 * formulaires d'un service) : on se limite aux questions historiques.
 */
export const assertLegacyAggregatableFieldCode = (field_code: string) => {
	if (!LEGACY_AGGREGATABLE_FIELD_CODES.has(field_code))
		throw forbidden(field_code);
};
