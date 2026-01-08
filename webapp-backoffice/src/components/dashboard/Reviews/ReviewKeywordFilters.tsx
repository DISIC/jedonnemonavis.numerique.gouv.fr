import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Tag from '@codegouvfr/react-dsfr/Tag';
import Tooltip from '@codegouvfr/react-dsfr/Tooltip';
import { push } from '@socialgouv/matomo-next';
import React, { useState } from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	product_id: number;
	form_id: number;
	start_date?: string;
	end_date?: string;
	onClick: (keyword: string) => void;
	selectedKeyword?: string;
}

const ReviewKeywordFilters = (props: Props) => {
	const {
		product_id,
		form_id,
		start_date,
		end_date,
		onClick,
		selectedKeyword
	} = props;

	const [size, setSize] = useState(10);

	const { data: hasKeywords } = trpc.answer.getKeywords.useQuery(
		{
			product_id,
			form_id,
			start_date,
			end_date,
			size: 1
		},
		{
			initialData: {
				data: []
			}
		}
	);

	const { data: keywordsResults } = trpc.answer.getKeywords.useQuery(
		{
			product_id,
			form_id,
			start_date,
			end_date,
			size
		},
		{
			initialData: {
				data: []
			},
			enabled: hasKeywords.data.length > 0
		}
	);

	const handleLoadMore = () => {
		push(['trackEvent', 'Product - Reviews', 'Load-More-Keywords']);
		setSize(prevSize => Math.min(prevSize + 10, 50));
	};

	const { cx, classes } = useStyles();

	if (!hasKeywords.data.length) {
		return null;
	}

	return (
		<div className={cx(classes.keywordsBox, fr.cx('fr-p-4v', 'fr-mb-8v'))}>
			<p className={fr.cx('fr-mb-0')}>
				<strong>Filtrer par mot récurrent</strong>{' '}
				<Tooltip
					kind="hover"
					title="Les mots récurrents apparaissent à partir de 5 occurrences d'un mot, dans des réponses différentes"
				/>
			</p>
			<div className={cx(classes.keywordsContainer)}>
				{keywordsResults.data.map(keywordObject => {
					const isSelected = selectedKeyword === keywordObject.keyword;
					return (
						<Tag
							pressed={isSelected}
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
			{size < 50 && keywordsResults.data.length === size && (
				<button
					className={cx(classes.loadMoreButton)}
					onClick={handleLoadMore}
					type="button"
				>
					Afficher plus de mots récurrents
				</button>
			)}
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
		gap: fr.spacing('2v'),
		flexWrap: 'wrap',
		[fr.breakpoints.down('md')]: {
			gap: fr.spacing('1v')
		}
	},
	loadMoreButton: {
		background: 'none',
		border: 'none',
		color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		...fr.typography[18].style,
		cursor: 'pointer',
		textDecoration: 'underline',
		padding: 0,
		marginTop: fr.spacing('2v'),
		marginBottom: 0,
		alignSelf: 'flex-start',
		'&:hover': {
			textDecoration: 'none'
		}
	}
});
