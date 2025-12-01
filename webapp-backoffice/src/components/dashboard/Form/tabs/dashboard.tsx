import { Loader } from '@/src/components/ui/Loader';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import {
	displayIntention,
	getStatsIcon
} from '@/src/utils/stats/intention-helpers';
import { formatDateToFrenchString, getSeverity } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { tss } from 'tss-react/dsfr';
import NoButtonsPanel from '../../Pannels/NoButtonsPanel';
import NoReviewsPanel from '../../Pannels/NoReviewsPanel';
import AnswersChart from '../../Stats/AnswersChart';
import ObservatoireStats from '../../Stats/ObservatoireStats';
import { ButtonModalType } from '../../ProductButton/ButtonModal';

interface Props {
	nbReviews: number;
	isLoading: boolean;
	form: FormWithElements;
	onClickGoToReviews?: () => void;
	hasButtons: boolean;
	handleModalOpening: (modalType: ButtonModalType, button?: any) => void;
}

const DashboardTab = ({
	nbReviews,
	isLoading,
	form,
	onClickGoToReviews,
	hasButtons,
	handleModalOpening
}: Props) => {
	const { cx, classes } = useStyles();

	const currentFormConfig = form.form_configs[0];

	const endDate = new Date().toISOString().split('T')[0];
	const startDate = (() => {
		const date = new Date();
		date.setFullYear(date.getFullYear() - 1);
		date.setHours(0, 0, 0, 0);
		return date.toISOString().split('T')[0];
	})();

	const { data: reviewResults, isFetching: isLoadingReviews } =
		trpc.review.getList.useQuery(
			{
				product_id: form.product_id,
				form_id: form.id,
				numberPerPage: 4,
				page: 1,
				shouldIncludeAnswers: true,
				mustHaveVerbatimsOptimzed: true,
				needLogging: false,
				sort: 'created_at:desc'
			},
			{
				initialData: {
					data: [],
					metadata: {
						countFiltered: 0,
						countAll: 0,
						countNew: 0,
						countForm1: 0,
						countForm2: 0
					}
				}
			}
		);

	if (isLoading || isLoadingReviews)
		return (
			<div className={cx(classes.loaderContainer)}>
				<Loader />
			</div>
		);

	const isMobile = window.innerWidth <= fr.breakpoints.getPxValues().md;

	return nbReviews > 0 ? (
		<div className={fr.cx('fr-grid-row')}>
			<h2 className={fr.cx('fr-col-12', 'fr-mb-6v')}>Tableau de bord</h2>
			<h3 className={fr.cx('fr-col-12', 'fr-mb-6v')}>Dernières évolutions</h3>
			<div className={fr.cx('fr-col-12', 'fr-col-lg-4')}>
				<ObservatoireStats
					productId={form.product_id}
					formConfig={currentFormConfig}
					formId={form.id}
					startDate={startDate}
					endDate={endDate}
					slugsToDisplay={[
						'satisfaction',
						'comprehension',
						'contactReachability',
						'contactSatisfaction'
					]}
					noTitle
					view="form-dashboard"
				/>
			</div>
			<div className={fr.cx('fr-col-12', 'fr-col-lg-8')}>
				<div className={cx(classes.chartContainer)}>
					<AnswersChart
						fieldCode="satisfaction"
						productId={form.product.id}
						formId={form.id}
						startDate={startDate}
						endDate={endDate}
						total={nbReviews}
						displayLine={false}
						isFormDashboardType
						customHeight={350}
					/>
				</div>
			</div>
			{reviewResults.data.length > 0 && (
				<>
					<hr className={fr.cx('fr-col-12', 'fr-mt-10v', 'fr-mb-3v')} />

					<div className={fr.cx('fr-col-12', 'fr-col-md-8')}>
						<h3 className={fr.cx('fr-mb-0')}>Derniers commentaires</h3>
					</div>
					{!isMobile && (
						<div
							className={cx(
								classes.buttonsGroup,
								fr.cx('fr-col-12', 'fr-col-md-4')
							)}
						>
							<Button
								priority="tertiary no outline"
								iconId="fr-icon-arrow-right-line"
								iconPosition="right"
								onClick={onClickGoToReviews}
							>
								Voir toutes les réponses
							</Button>
						</div>
					)}
					<div className={cx(classes.reviewsContainer)}>
						{reviewResults.data.map(review => {
							const satisfactionReview = review.answers?.find(
								a => a.field_code === 'satisfaction'
							);
							return (
								<div className={cx(classes.reviewCard)}>
									{satisfactionReview?.intention && (
										<Badge
											className={cx(classes.badge, fr.cx('fr-mb-4v'))}
											small
											noIcon
											severity={getSeverity(satisfactionReview.intention || '')}
										>
											<Image
												alt=""
												src={`/assets/smileys/${getStatsIcon({
													intention: satisfactionReview.intention ?? 'neutral'
												})}.svg`}
												width={15}
												height={15}
											/>
											{displayIntention(
												satisfactionReview.intention ?? 'neutral'
											)}
										</Badge>
									)}
									<p className={cx(classes.reviewText, fr.cx('fr-mb-4v'))}>
										{formatDateToFrenchString(
											review.created_at?.toISOString().split('T')[0] || ''
										)}
									</p>
									{review.answers?.find(a => a.field_code === 'verbatim') && (
										<p className={cx(classes.reviewText, fr.cx('fr-mb-0'))}>
											{
												review.answers?.find(a => a.field_code === 'verbatim')
													?.answer_text
											}
										</p>
									)}
								</div>
							);
						})}
					</div>
					{isMobile && (
						<div
							className={cx(
								classes.buttonsGroup,
								fr.cx('fr-col-12', 'fr-col-md-4')
							)}
						>
							<Button
								priority="tertiary no outline"
								iconId="fr-icon-arrow-right-line"
								iconPosition="right"
								onClick={onClickGoToReviews}
							>
								Voir toutes les réponses
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	) : (
		<div className={fr.cx('fr-grid-row')}>
			<h2 className={fr.cx('fr-col-12', 'fr-mb-6v')}>Tableau de bord</h2>
			{form.isDeleted ? (
				<div
					className={fr.cx('fr-col-12')}
					style={{ display: 'flex', justifyContent: 'center' }}
				>
					<span>Ce formulaire est fermé et ne contient aucune réponse</span>
				</div>
			) : hasButtons ? (
				<div className={fr.cx('fr-col-12')}>
					<NoReviewsPanel />
				</div>
			) : (
				<div className={fr.cx('fr-col-12')}>
					<NoButtonsPanel
						onButtonClick={() => {
							handleModalOpening('create');
						}}
					/>
				</div>
			)}
		</div>
	);
};

const useStyles = tss.withName(DashboardTab.name).create({
	loaderContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: '500px',
		width: '100%'
	},
	chartContainer: {
		height: '100%',
		marginLeft: fr.spacing('4v'),
		[fr.breakpoints.down('lg')]: {
			marginTop: fr.spacing('4v'),
			marginLeft: 0
		}
	},
	smallTitle: {
		fontWeight: 'bold',
		fontSize: '20px',
		lineHeight: '28px'
	},
	newReviewsLabel: {
		color: fr.colors.decisions.text.mention.grey.default,
		b: {
			color: fr.colors.decisions.text.title.grey.default
		}
	},
	buttonsGroup: {
		display: 'flex',
		justifyContent: 'end',
		gap: fr.spacing('4v'),
		alignSelf: 'center',
		button: {
			a: {
				display: 'flex',
				alignItems: 'center'
			}
		},
		[fr.breakpoints.down('md')]: {
			justifyContent: 'start',
			button: { paddingLeft: 0 }
		}
	},
	reviewsContainer: {
		display: 'flex',
		width: '100%',
		...fr.spacing('margin', { topBottom: '6v' }),
		gap: fr.spacing('3v'),
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column'
		}
	},
	reviewCard: {
		display: 'flex',
		width: '100%',
		maxWidth: '25%',
		flexDirection: 'column',
		padding: fr.spacing('4v'),
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		[fr.breakpoints.down('md')]: {
			maxWidth: '100%'
		}
	},
	badge: {
		fontSize: 11,
		paddingVertical: 4,
		display: 'flex',
		alignItems: 'center',
		gap: '0.25rem'
	},
	reviewText: {
		fontSize: '12px',
		lineHeight: '20px',
		display: '-webkit-box',
		WebkitLineClamp: 6,
		WebkitBoxOrient: 'vertical',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		wordBreak: 'break-all',
		whiteSpace: 'pre-wrap'
	}
});

export default DashboardTab;
