import type { Context } from '@/src/server/trpc';
import { z } from 'zod';
import { checkAndGetFormForProduct, queryCountByFieldCode } from './utils';

export const countByFieldCodeInputSchema = z.object({
	field_code: z.string(),
	product_id: z.number(),
	form_id: z.number(),
	button_id: z.number().optional(),
	start_date: z.string(),
	end_date: z.string()
});

export const countByFieldCodeQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof countByFieldCodeInputSchema>;
}) => {
	const { product_id, form_id, button_id } = input;

	const form = await checkAndGetFormForProduct({ ctx, product_id, form_id });

	// Volontairement sans restriction sur `field_code` : ce endpoint ne renvoie
	// qu'un compteur, et `field_code` y est une *valeur* de terme ES, pas un nom
	// de champ — aucune réponse d'usager n'en sort. Il est appelé avec `verbatim`
	// pour la tuile « Nombre de verbatims ». Seules les agrégations qui exposent
	// les valeurs brutes sont restreintes, via `assertAggregatableFieldCode`.
	const data = await ctx.elkClient.count({
		index: 'jdma-answers',
		query: queryCountByFieldCode({
			...input,
			legacy: !!form?.legacy
		})
	});

	return { data: data.count };
};
