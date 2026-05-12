import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Tag from '@codegouvfr/react-dsfr/Tag';
import Tooltip from '@codegouvfr/react-dsfr/Tooltip';
import { push } from '@socialgouv/matomo-next';
import React, { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { Loader } from '../../ui/Loader';

interface Props {
	product_id: number;
	form_id: number;
	start_date?: string;
	end_date?: string;
	onClick: (keyword: string) => void;
	selectedKeyword?: string;
	fields?: Array<{ field_code: string; values: string[] }>;
}

const ReviewKeywordFilters = (props: Props) => {
	const {
		product_id,
		form_id,
		start_date,
		end_date,
		onClick,
		selectedKeyword,
		fields
	} = props;

	const [size, setSize] = useState(10);
	const [isFilterChange, setIsFilterChange] = useState(false);

	const fieldsKey = JSON.stringify(fields);
	useEffect(() => {
		setSize(10);
		setIsFilterChange(true);
	}, [product_id, form_id, start_date, end_date, fieldsKey]);

	const { data: keywordsResults, isFetching: isKeywordsLoading } =
		trpc.answer.getKeywords.useQuery(
			{
				product_id,
				form_id,
				start_date,
				end_date,
				fields,
				size
			},
			{ keepPreviousData: true }
		);

	useEffect(() => {
		if (!isKeywordsLoading) setIsFilterChange(false);
	}, [isKeywordsLoading]);

	const keywords =
		isFilterChange && isKeywordsLoading ? [] : keywordsResults?.data ?? [];

	const handleLoadMore = () => {
		push(['trackEvent', 'Product - Reviews', 'Load-More-Keywords']);
		setSize(prevSize => Math.min(prevSize + 10, 50));
	};

	const { cx, classes } = useStyles();

	return (
		<div className={cx(classes.keywordsBox, fr.cx('fr-mb-8v', 'fr-mt-4v'))}>
			<p className={fr.cx('fr-mb-0')}>
				<strong className={classes.containerTitle}>
					Filtrer par mot récurrent
				</strong>{' '}
				<Tooltip
					kind="hover"
					title="Les mots récurrents apparaissent à partir de 5 occurrences d'un mot, dans des réponses différentes"
				/>
				<Badge severity="new" as="span" className={fr.cx('fr-ml-2v')} small>
					Beta
				</Badge>
			</p>
			<div className={cx(classes.keywordsContainer)}>
				{keywords.length === 0 ? (
					<div className={cx(classes.noKeywordsFound)}>
						{isKeywordsLoading ? (
							<Loader size="sm" />
						) : (
							<span className={fr.cx('fr-text--sm', 'fr-mb-0')}>
								Aucun mot récurrent n'a été détecté pour le moment
							</span>
						)}
					</div>
				) : (
					<>
						{' '}
						{keywords.map(keywordObject => {
							const isSelected =
								selectedKeyword === `"${keywordObject.keyword}"`;
							return (
								<Tag
									pressed={isSelected}
									nativeButtonProps={{
										onClick: () => {
											onClick(isSelected ? '' : keywordObject.keyword);
										}
									}}
									key={keywordObject.keyword}
								>
									{keywordObject.keyword}
								</Tag>
							);
						})}
						{isKeywordsLoading && !isFilterChange ? (
							<Loader size="sm" />
						) : (
							size < 50 &&
							keywords.length === size && (
								<button
									className={cx(classes.loadMoreButton, fr.cx('fr-text--sm'))}
									onClick={handleLoadMore}
									type="button"
								>
									Afficher plus
									<span
										className={fr.cx(
											'fr-icon-arrow-down-s-line',
											'fr-icon--sm'
										)}
										aria-hidden="true"
									/>
								</button>
							)
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default ReviewKeywordFilters;

const useStyles = tss.withName(ReviewKeywordFilters.name).create({
	containerTitle: {
		fontSize: '0.875rem',
		color: fr.colors.decisions.text.title.grey.default
	},
	keywordsBox: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('2v')
	},
	keywordsContainer: {
		display: 'flex',
		gap: fr.spacing('2v'),
		flexWrap: 'wrap',
		alignItems: 'center',
		[fr.breakpoints.down('md')]: {
			gap: fr.spacing('1v')
		}
	},
	loadMoreButton: {
		background: 'none',
		border: 'none',
		alignSelf: 'center',
		color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		fontWeight: 500,
		cursor: 'pointer',
		margin: 0,
		marginLeft: fr.spacing('3v'),
		padding: 0,
		display: 'inline-flex',
		alignItems: 'center',
		gap: fr.spacing('1v'),
		'&:hover': {
			textDecoration: 'underline',
			background: 'transparent!important'
		}
	},
	noKeywordsFound: {
		height: fr.spacing('10v'),
		width: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: fr.colors.decisions.background.default.grey.hover,
		color: fr.colors.decisions.text.default.grey.default
	}
});
