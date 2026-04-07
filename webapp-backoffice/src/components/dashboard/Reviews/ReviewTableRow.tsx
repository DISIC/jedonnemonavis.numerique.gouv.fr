import { ReviewPartialWithRelations } from '@/prisma/generated/zod';
import { FormTemplateWithElements } from '@/src/types/prismaTypesExtended';
import {
	displayIntention,
	getStatsColor,
	getStatsIcon
} from '@/src/utils/stats/intention-helpers';
import {
	formatDateToFrenchString,
	formatFullFrenchDateTime,
	getSeverity
} from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { push } from '@socialgouv/matomo-next';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { tss } from 'tss-react/dsfr';

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

const ReviewTableRow = ({
	review,
	search,
	formTemplate,
	isSelected,
	onSelectReview,
	onClickMoreInfo,
	rowRef
}: {
	review: ReviewPartialWithRelations;
	search: string;
	formTemplate: FormTemplateWithElements;
	isSelected?: boolean;
	onSelectReview: (review: ReviewPartialWithRelations) => void;
	onClickMoreInfo?: () => void;
	rowRef?: (el: HTMLTableRowElement | null) => void;
}) => {
	const { cx, classes } = useStyles();

	const mainBlocks = formTemplate.form_template_steps
		.flatMap(step => step.form_template_blocks)
		.filter(block => block.isMainBlock);

	const hasVerbatimBlock = formTemplate.form_template_steps
		.flatMap(step => step.form_template_blocks)
		.some(block => block.field_code === 'verbatim');

	const verbatimAnswer = hasVerbatimBlock
		? review.answers?.find(answer => answer.field_code === 'verbatim')
		: undefined;

	const handleSelect = () => {
		onSelectReview(review);
		push(['trackEvent', 'Product - Avis', 'Display-More-Infos']);
		onClickMoreInfo?.();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleSelect();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			const next = e.currentTarget.nextElementSibling as HTMLElement | null;
			next?.focus();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			const prev = e.currentTarget.previousElementSibling as HTMLElement | null;
			prev?.focus();
		}
	};

	return (
		<tr
			ref={rowRef}
			className={cx(classes.container, isSelected && classes.containerSelected)}
			onClick={handleSelect}
			role="row"
			tabIndex={0}
			onKeyDown={handleKeyDown}
			aria-selected={isSelected}
			title={`Plus d'infos sur l'avis ${review.id?.toString(16)}`}
		>
			<div
				className={cx(
					classes.line,
					fr.cx('fr-grid-row', 'fr-grid-row--middle')
				)}
			>
				<td
					className={cx(
						classes.dateLabel,
						fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')
					)}
					aria-label={`Avis du ${formatFullFrenchDateTime(
						review.created_at?.toString() || ''
					)}`}
				>
					<span aria-hidden="true">
						{formatDateToFrenchString(review.created_at?.toString() || '')}
						<br />
						<span className={fr.cx('fr-text--sm', 'fr-mb-0')}>
							{formatDateToFrenchString(review.created_at?.toString() || '', {
								hourOnly: true,
								hourFormat: 'short'
							})}
						</span>
					</span>
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
										: formTemplateBlockOption?.alias ??
										  formTemplateBlockOption?.label ??
										  answer.answer_text ??
										  ''}
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
					<td className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-7')}>
						<p
							className={cx(classes.content, classes.contentVerbatim)}
							dangerouslySetInnerHTML={{
								__html: `${
									verbatimAnswer
										? highlightSearchTerms(
												verbatimAnswer.answer_text || '',
												search
										  )
										: '-'
								}`
							}}
						></p>
					</td>
				)}

				<td
					className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-1')}
					onClick={e => e.stopPropagation()}
				>
					<Link
						title={`Plus d'infos sur l'avis ${review.id?.toString(16)}`}
						className={cx(classes.action, fr.cx('fr-link'))}
						onClick={handleSelect}
						href={'#'}
					>
						Voir l'avis
					</Link>
				</td>
			</div>
		</tr>
	);
};

const useStyles = tss.create({
	container: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		cursor: 'pointer',
		borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		'td:last-of-type': {
			textAlign: 'right'
		},
		'&:hover': {
			backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
			'& .fr-link': {
				backgroundSize: '100% 1.25px'
			}
		},
		'&:focus-visible': {
			outline: `2px solid ${fr.colors.decisions.border.active.blueFrance.default}`,
			outlineOffset: '-2px'
		}
	},
	containerSelected: {
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default
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
		gap: '0.3rem',
		marginRight: '-4rem',
		marginLeft: '-2rem',
		[fr.breakpoints.down('lg')]: {
			marginRight: 0,
			marginLeft: 0
		}
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
		WebkitLineClamp: 10,
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
	action: {
		textWrap: 'nowrap',
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

export default ReviewTableRow;
