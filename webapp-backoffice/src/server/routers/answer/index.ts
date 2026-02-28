import { publicProcedure, router } from '@/src/server/trpc';
import {
	getByFieldCodeInputSchema,
	getByFieldCodeQuery
} from './get-by-field-code';
import {
	getByChildFieldCodeInputSchema,
	getByChildFieldCodeQuery
} from './get-by-child-field-code';
import {
	countByFieldCodeInputSchema,
	countByFieldCodeQuery
} from './count-by-field-code';
import {
	countByFieldCodePerMonthInputSchema,
	countByFieldCodePerMonthQuery
} from './count-by-field-code-per-month';
import {
	getByFieldCodeIntervalInputSchema,
	getByFieldCodeIntervalQuery
} from './get-by-field-code-interval';
import {
	getByChildFieldCodeIntervalInputSchema,
	getByChildFieldCodeIntervalQuery
} from './get-by-child-field-code-interval';
import {
	getByFieldCodeIntervalAverageInputSchema,
	getByFieldCodeIntervalAverageQuery
} from './get-by-field-code-interval-average';
import {
	getObservatoireStatsInputSchema,
	getObservatoireStatsQuery
} from './get-observatoire-stats';
import { getKeywordsInputSchema, getKeywordsQuery } from './get-keywords';

export const answerRouter = router({
	getByFieldCode: publicProcedure
		.input(getByFieldCodeInputSchema)
		.query(getByFieldCodeQuery),

	getByChildFieldCode: publicProcedure
		.input(getByChildFieldCodeInputSchema)
		.query(getByChildFieldCodeQuery),

	countByFieldCode: publicProcedure
		.input(countByFieldCodeInputSchema)
		.query(countByFieldCodeQuery),

	countByFieldCodePerMonth: publicProcedure
		.input(countByFieldCodePerMonthInputSchema)
		.query(countByFieldCodePerMonthQuery),

	getByFieldCodeInterval: publicProcedure
		.input(getByFieldCodeIntervalInputSchema)
		.query(getByFieldCodeIntervalQuery),

	getByChildFieldCodeInterval: publicProcedure
		.input(getByChildFieldCodeIntervalInputSchema)
		.query(getByChildFieldCodeIntervalQuery),

	getByFieldCodeIntervalAverage: publicProcedure
		.input(getByFieldCodeIntervalAverageInputSchema)
		.query(getByFieldCodeIntervalAverageQuery),

	getObservatoireStats: publicProcedure
		.input(getObservatoireStatsInputSchema)
		.query(getObservatoireStatsQuery),

	getKeywords: publicProcedure
		.input(getKeywordsInputSchema)
		.query(getKeywordsQuery)
});
