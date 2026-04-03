import {
	AnswerPartialWithRelations,
	ReviewPartialWithRelations
} from '@/prisma/generated/zod';
import {
	FormConfigWithChildren,
	FormTemplateWithElements
} from '@/src/types/prismaTypesExtended';
import {
	displayIntention,
	getStatsIcon
} from '@/src/utils/stats/intention-helpers';
import {
	formatFullFrenchDateTime,
	getSeverity,
	retrieveButtonName
} from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { Drawer } from '@mui/material';
import Image from 'next/image';
import React from 'react';
import { tss } from 'tss-react/dsfr';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AnswerDisplay = {
	parentOptionLabel?: string;
	text: string;
};

type ChildFieldGroup = {
	label: string;
	values: AnswerDisplay[];
};

type ReviewDrawerProps = {
	review: ReviewPartialWithRelations | null;
	formConfig?: FormConfigWithChildren;
	hasManyVersions: boolean;
	formTemplate: FormTemplateWithElements;
	onClose: () => void;
};

const EXCLUDED_BLOCK_TYPES = [
	'paragraph',
	'heading_1',
	'heading_2',
	'heading_3',
	'divider'
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTopLevelAnswers(
	allAnswers: AnswerPartialWithRelations[] | undefined,
	fieldCode: string | null
) {
	return (
		allAnswers?.filter(
			a => a.field_code === fieldCode && !a.parent_answer_id
		) ?? []
	);
}

function groupChildAnswersByField(
	allAnswers: AnswerPartialWithRelations[] | undefined,
	parentAnswers: AnswerPartialWithRelations[]
): Record<string, ChildFieldGroup> {
	const children = parentAnswers.flatMap(parent => {
		const matched =
			allAnswers?.filter(a => a.parent_answer_id === parent.id) ?? [];
		return matched.map(child => ({
			child,
			parentOptionLabel: parent.answer_text || undefined
		}));
	});

	return children.reduce<Record<string, ChildFieldGroup>>(
		(acc, { child, parentOptionLabel }) => {
			const key = child.field_code || '';
			if (!acc[key]) {
				acc[key] = {
					label: child.field_label || child.field_code || '',
					values: []
				};
			}
			acc[key].values.push({
				parentOptionLabel,
				text: child.answer_text || '-'
			});
			return acc;
		},
		{}
	);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const AnswerValues = ({
	values,
	cx,
	classes
}: {
	values: string[];
	cx: (...args: any[]) => string;
	classes: ReturnType<typeof useStyles>['classes'];
}) => {
	if (values.length > 1) {
		return (
			<ul className={cx(classes.answerList)}>
				{values.map((v, i) => (
					<li key={i} className={cx(classes.answerText)}>
						{v}
					</li>
				))}
			</ul>
		);
	}
	return <span className={cx(classes.answerText)}>{values[0] ?? '-'}</span>;
};

const ChildAnswerValue = ({
	value,
	cx,
	classes
}: {
	value: AnswerDisplay;
	cx: (...args: any[]) => string;
	classes: ReturnType<typeof useStyles>['classes'];
}) => (
	<>
		{value.parentOptionLabel && (
			<span className={fr.cx('fr-text--sm')}>{value.parentOptionLabel} : </span>
		)}
		<span className={cx(classes.answerText)}>{value.text}</span>
	</>
);

const ChildAnswerValues = ({
	values,
	cx,
	classes
}: {
	values: AnswerDisplay[];
	cx: (...args: any[]) => string;
	classes: ReturnType<typeof useStyles>['classes'];
}) => {
	if (!values.length) return null;

	return (
		<ul className={cx(classes.answerList)}>
			{values.map((v, i) => (
				<li key={i}>
					<ChildAnswerValue value={v} cx={cx} classes={classes} />
				</li>
			))}
		</ul>
	);
};

const InfoRow = ({
	label,
	value,
	cx,
	classes
}: {
	label: string;
	value: React.ReactNode;
	cx: (...args: any[]) => string;
	classes: ReturnType<typeof useStyles>['classes'];
}) => (
	<>
		<div className={cx(classes.infoLine)}>
			<span className={cx(classes.infoLabel)}>{label}</span>
			<span>{value}</span>
		</div>
		<hr className="fr-pb-4v" />
	</>
);

const SatisfactionBadge = ({
	answer,
	optionLabel,
	cx,
	classes
}: {
	answer: AnswerPartialWithRelations;
	optionLabel: string;
	cx: (...args: any[]) => string;
	classes: ReturnType<typeof useStyles>['classes'];
}) => (
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
			: optionLabel}
	</Badge>
);

// ---------------------------------------------------------------------------
// Main components
// ---------------------------------------------------------------------------

const ReviewDrawer = (props: ReviewDrawerProps) => {
	const { review, onClose, ...rest } = props;

	return (
		<Drawer
			anchor="right"
			open={!!review}
			onClose={onClose}
			PaperProps={{
				sx: { width: { xs: '100%', md: '600px' } }
			}}
		>
			{review && (
				<ReviewDrawerContent review={review} onClose={onClose} {...rest} />
			)}
		</Drawer>
	);
};

const ReviewDrawerContent = ({
	review,
	formConfig,
	hasManyVersions,
	formTemplate,
	onClose
}: ReviewDrawerProps & { review: ReviewPartialWithRelations }) => {
	const { cx, classes } = useStyles();

	const buttonName = review.button_id
		? retrieveButtonName(review.button_id)
		: undefined;

	const allBlocks = formTemplate.form_template_steps.flatMap(
		step => step.form_template_blocks
	);

	const mainBlock = allBlocks.find(block => block.isMainBlock);
	const mainAnswer = mainBlock
		? review.answers?.find(a => a.field_code === mainBlock.field_code)
		: undefined;
	const mainBlockOption = mainBlock?.options.find(
		opt => opt.id === mainAnswer?.answer_item_id
	);

	const answerBlocks = allBlocks.filter(
		block =>
			!EXCLUDED_BLOCK_TYPES.includes(block.type_bloc) &&
			block.field_code !== null
	);

	return (
		<div className={cx(classes.container)}>
			{/* Header */}
			<div className={cx(classes.header)}>
				<div />
				<Button
					priority="tertiary no outline"
					iconId="fr-icon-close-line"
					iconPosition="right"
					title="Fermer"
					size="small"
					onClick={onClose}
				>
					Fermer
				</Button>
			</div>

			<h1 className={cx(classes.title, fr.cx('fr-h4'))}>
				Détail de l'avis du{' '}
				{formatFullFrenchDateTime(review.created_at?.toString() || '')}
			</h1>
			<hr className={cx(classes.titleSeparator)} />

			{/* Navigation */}
			<div className={classes.actionsContainer}>
				<Button
					priority="tertiary"
					iconId="fr-icon-arrow-left-s-line"
					size="small"
				>
					Voir l'avis précédent
				</Button>
				<Button
					priority="tertiary"
					iconId="fr-icon-arrow-right-s-line"
					iconPosition="right"
					size="small"
				>
					Voir l'avis suivant
				</Button>
			</div>

			{/* Main satisfaction badge */}
			{mainAnswer && mainAnswer.intention && (
				<>
					<div className={cx(classes.infoLine)}>
						<span className={cx(classes.infoLabel)}>
							{mainBlock?.alias || 'Satisfaction'} :
						</span>
						<SatisfactionBadge
							answer={mainAnswer}
							optionLabel={
								mainBlockOption?.alias ??
								mainBlockOption?.label ??
								mainAnswer.answer_text ??
								''
							}
							cx={cx}
							classes={classes}
						/>
					</div>
					<hr className="fr-pb-4v" />
				</>
			)}

			{/* Metadata */}
			{hasManyVersions && (
				<InfoRow
					label="Formulaire :"
					value={`Version ${formConfig?.version ?? 0}`}
					cx={cx}
					classes={classes}
				/>
			)}
			<InfoRow
				label="Identifiant :"
				value={review.id}
				cx={cx}
				classes={classes}
			/>
			<InfoRow
				label="Lien d'intégration utilisé :"
				value={buttonName || 'Pas de source'}
				cx={cx}
				classes={classes}
			/>

			{/* Answers section */}
			<h2
				className={cx(
					classes.sectionTitle,
					fr.cx('fr-h6', 'fr-mt-6v', 'fr-mb-4v')
				)}
			>
				Réponses
			</h2>

			{answerBlocks.map((block, index) => {
				const answers = getTopLevelAnswers(review.answers, block.field_code);
				const childFields = groupChildAnswersByField(review.answers, answers);
				const answerTexts = answers.map(a => a.answer_text || '-');

				return (
					<React.Fragment key={index}>
						{/* Parent question */}
						<div className={cx(classes.answerLine)}>
							<span className={fr.cx('fr-text--sm', 'fr-mb-2v')}>
								{block.label || block.field_code}
							</span>
							<AnswerValues
								values={answerTexts.length ? answerTexts : ['-']}
								cx={cx}
								classes={classes}
							/>
						</div>
						<hr className={fr.cx('fr-mt-6v')} />

						{/* Child sub-questions with parent option labels */}
						{Object.entries(childFields).map(
							([fieldCode, { label, values }]) => (
								<React.Fragment key={fieldCode}>
									<div className={cx(classes.answerLine)}>
										<span className={fr.cx('fr-text--sm', 'fr-mb-2v')}>
											{label}
										</span>
										<ChildAnswerValues
											values={values}
											cx={cx}
											classes={classes}
										/>
									</div>
									<hr className={fr.cx('fr-mt-6v')} />
								</React.Fragment>
							)
						)}
					</React.Fragment>
				);
			})}
		</div>
	);
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const useStyles = tss.create({
	container: {
		...fr.spacing('padding', { rightLeft: '12v', topBottom: '6v' }),
		height: '100%',
		overflowY: 'auto'
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: fr.spacing('4v')
	},
	title: {
		color: fr.colors.decisions.artwork.major.blueFrance.default
	},
	titleSeparator: {
		backgroundImage: `linear-gradient(0deg, ${fr.colors.decisions.artwork.major.blueFrance.default}, ${fr.colors.decisions.artwork.major.blueFrance.default})`
	},
	actionsContainer: {
		display: 'flex',
		justifyContent: 'space-between',
		marginBottom: fr.spacing('6v'),
		paddingBottom: fr.spacing('4v')
	},
	sectionTitle: {
		fontWeight: 'bold',
		marginBottom: 0
	},
	infoLine: {
		display: 'flex',
		alignItems: 'center',
		gap: fr.spacing('2v'),
		marginBottom: fr.spacing('4v')
	},
	answerLine: {
		display: 'flex',
		flexDirection: 'column'
	},
	infoLabel: {
		fontWeight: 'bold'
	},
	badge: {
		fontSize: 12,
		display: 'flex',
		alignItems: 'center',
		gap: '0.25rem'
	},
	answerText: {
		fontWeight: 'bold',
		wordBreak: 'break-word' as const
	},
	answerList: {
		margin: 0,
		paddingLeft: fr.spacing('4v'),
		listStyleType: 'disc'
	}
});

export default ReviewDrawer;
