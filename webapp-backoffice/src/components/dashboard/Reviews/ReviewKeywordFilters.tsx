import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Tag from '@codegouvfr/react-dsfr/Tag';
import React from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	product_id: number;
	form_id: number;
	start_date?: string;
	end_date?: string;
	onClick: (keyword: string) => void;
}

const ReviewKeywordFilters = (props: Props) => {
	const { product_id, form_id, start_date, end_date, onClick } = props;

	const { data: keywordsResults } = trpc.answer.getKeywords.useQuery(
		{
			product_id,
			form_id,
			start_date,
			end_date
		},
		{
			initialData: {
				data: []
			}
		}
	);

	const { cx, classes } = useStyles();

	if (!keywordsResults.data.length) {
		return null;
	}

	return (
		<div className={cx(classes.keywordsBox, fr.cx('fr-p-4v', 'fr-mb-8v'))}>
			<p className={fr.cx('fr-mb-0')}>
				<strong>Filtrer par mot récurrent</strong>
			</p>
			<div className={cx(classes.keywordsContainer)}>
				{keywordsResults.data.map(keywordObject => {
					return (
						<Tag
							nativeButtonProps={{
								onClick: () => {
									onClick(keywordObject.keyword);
								}
							}}
							key={keywordObject.keyword}
						>
							{keywordObject.keyword}
						</Tag>
					);
				})}
			</div>
		</div>
	);
};

export default ReviewKeywordFilters;

const useStyles = tss.withName(ReviewKeywordFilters.name).create({
	keywordsBox: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('2v'),
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`
	},
	keywordsContainer: {
		display: 'flex',
		gap: fr.spacing('2v')
	}
});
