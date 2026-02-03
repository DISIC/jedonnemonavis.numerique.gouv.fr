import {
	FormConfigWithChildren,
	FormTemplateWithElements
} from '@/src/types/prismaTypesExtended';
import {
	displayIntention,
	getStatsColor,
	getStatsIcon
} from '@/src/utils/stats/intention-helpers';
import { formatDateToFrenchString, getSeverity } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { push } from '@socialgouv/matomo-next';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { tss } from 'tss-react/dsfr';
import ReviewVerbatimMoreInfos from './ReviewVerbatimMoreInfos';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { ReviewPartialWithRelations } from '@/prisma/generated/zod';

const highlightSearchTerms = (text: string, search: string): string => {
	if (!search.trim()) return text;

	const words = search.split(' ').filter(Boolean);
	let highlightedText = text;

	words.forEach(word => {
		const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

		const patterns = [
			`\\b${escapedWord}(?=\\w)`,
			`(?<=\\w)${escapedWord}\\b`,
			`\\b${escapedWord}\\b`,
			`^${escapedWord}(?=\\w)`,
			`^${escapedWord}\\b`,
			`(?<=\\w)${escapedWord}$`,
			`\\b${escapedWord}$`,
			`^${escapedWord}$`
		];

		patterns.forEach(pattern => {
			const regex = new RegExp(pattern, 'gi');
			highlightedText = highlightedText.replace(regex, match => {
				return `<span>${match}</span>`;
			});
		});
	});

	return highlightedText;
};

const ReviewLineVerbatim = ({
	review,
	search,
	formConfigHelper,
	hasManyVersions,
	formTemplate
}: {
	review: ReviewPartialWithRelations;
	search: string;
	formConfigHelper: {
		formConfig?: FormConfigWithChildren;
		versionNumber: number;
	};
	hasManyVersions: boolean;
	formTemplate: FormTemplateWithElements;
}) => {
	const { cx, classes } = useStyles();
	const [displayMoreInfo, setDisplayMoreInfo] = React.useState(false);

	const { mutate: createReviewViewLog } =
		trpc.reviewViewLog.create.useMutation();

	const mainBlocks = formTemplate.form_template_steps
		.flatMap(step => step.form_template_blocks)
		.filter(block => block.isMainBlock);

	const hasVerbatimBlock = formTemplate.form_template_steps
		.flatMap(step => step.form_template_blocks)
		.some(block => block.field_code === 'verbatim');

	const verbatimAnswer = hasVerbatimBlock
		? review.answers?.find(answer => answer.field_code === 'verbatim')
		: undefined;

	useEffect(() => {
		if (displayMoreInfo)
			createReviewViewLog({
				review_id: review.id as number,
				review_created_at: review.created_at as Date
			});
	}, [displayMoreInfo]);

	return (
		<tr className={cx(classes.container)}>
			<div
				className={cx(
					classes.line,
					fr.cx('fr-grid-row', 'fr-grid-row--middle')
				)}
			>
				<td
					className={cx(
						classes.dateLabel,
						fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2', 'fr-pr-2v')
					)}
				>
					{formatDateToFrenchString(review.created_at?.toString() || '')}
				</td>

				{mainBlocks.map((block, index) => {
					const answer = review.answers?.find(
						answer => answer.field_code === block.field_code
					);

					const formTemplateBlockOption = block.options.find(
						opt => opt.id === answer?.answer_item_id
					);

					return (
						<td
							key={index}
							className={cx(
								classes.label,
								fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')
							)}
							style={{
								color: answer?.intention
									? getStatsColor({ intention: answer.intention })
									: undefined
							}}
						>
							{answer && answer.intention && (
								<Badge
									className={cx(classes.badge)}
									noIcon={true}
									severity={getSeverity(answer.intention || '')}
								>
									{answer.field_code === 'satisfaction' && (
										<Image
											alt=""
											src={`/assets/smileys/${getStatsIcon({
												intention: answer.intention ?? 'neutral'
											})}.svg`}
											width={16}
											height={16}
										/>
									)}

									{answer.field_code === 'satisfaction'
										? displayIntention(answer.intention ?? 'neutral')
										: (formTemplateBlockOption?.alias ??
											formTemplateBlockOption?.label ??
											answer.answer_text ??
											'')}
								</Badge>
							)}
							{answer && !answer.intention && (
								<span>{answer.answer_text || '-'}</span>
							)}
							{!answer && <span>-</span>}
						</td>
					);
				})}

				{hasVerbatimBlock && (
					<td
						className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-5', 'fr-pr-3v')}
					>
						<p
							className={cx(classes.content, classes.contentVerbatim)}
							dangerouslySetInnerHTML={{
								__html: `${verbatimAnswer ? highlightSearchTerms(verbatimAnswer.answer_text || '', search) : '-'}`
							}}
						></p>
					</td>
				)}

				<td className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
					<Button
						priority="tertiary no outline"
						title={`Plus d'infos sur l'avis ${review.id?.toString(16)}`}
						size="small"
						onClick={() => {
							setDisplayMoreInfo(!displayMoreInfo);
							push(['trackEvent', 'Product - Avis', 'Display-More-Infos']);
						}}
						className={classes.button}
						style={{
							backgroundColor: displayMoreInfo
								? fr.colors.decisions.background.alt.blueFrance.default
								: undefined
						}}
					>
						{' '}
						Voir le détail de la réponse
					</Button>
				</td>
			</div>
			{displayMoreInfo && (
				<ReviewVerbatimMoreInfos
					review={review}
					formConfigHelper={formConfigHelper}
					hasManyVersions={hasManyVersions}
					search={search}
				/>
			)}
			<hr />
		</tr>
	);
};

const useStyles = tss.create({
	container: {
		display: 'flex',
		flexDirection: 'column',
		marginBottom: 12,
		width: '100%',
		'td:last-of-type': {
			textAlign: 'right'
		}
	},
	line: {
		fontSize: fr.spacing('4v'),
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding: fr.spacing('4v'),
		width: '100%',
		borderRadius: 0,
		fontWeight: 'normal'
	},
	dateLabel: {
		fontWeight: 'bold'
	},
	label: {
		fontWeight: 'bold',
		display: 'flex',
		alignItems: 'center',
		gap: '0.3rem'
	},
	verbatim: {
		flexShrink: 1
	},
	date: {
		fontSize: 12,
		width: 100,
		flexShrink: 0
	},
	content: {
		display: '-webkit-box',
		WebkitLineClamp: 3,
		WebkitBoxOrient: 'vertical',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		margin: 0,
		span: {
			backgroundColor: 'yellow'
		}
	},
	contentVerbatim: {
		...fr.typography[18].style,
		wordBreak: 'break-word',
		margin: 0
	},
	button: {
		textDecoration: 'underline',
		[fr.breakpoints.down('md')]: {
			width: '100%',
			justifyContent: 'center'
		}
	},
	badge: {
		fontSize: 12,
		paddingVertical: 4,
		display: 'flex',
		alignItems: 'center',
		gap: '0.25rem'
	}
});

export default ReviewLineVerbatim;
