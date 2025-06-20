import { Loader } from '@/src/components/ui/Loader';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { displayIntention, getStatsIcon } from '@/src/utils/stats';
import { formatDateToFrenchString, getSeverity } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { tss } from 'tss-react/dsfr';
import AnswersChart from '../../Stats/AnswersChart';
import ObservatoireStats from '../../Stats/ObservatoireStats';
import NoReviewsDashboardPanel from '../../Pannels/NoReviewsDashboardPanel';
import NoButtonsPanel from '../../Pannels/NoButtonsPanel';
import { CustomModalProps } from '@/src/types/custom';

interface Props {
	nbReviews: number;
	isLoading: boolean;
	form: FormWithElements;
	onClickGoToReviews?: () => void;
	hasButtons: boolean;
	modal: CustomModalProps;
}

const DashboardTab = ({
	nbReviews,
	isLoading,
	form,
	onClickGoToReviews,
	hasButtons,
	modal
}: Props) => {
	const router = useRouter();
	const { cx, classes } = useStyles();

	const { data: reviewResults, isFetching: isLoadingReviews } =
		trpc.review.getList.useQuery(
			{
				product_id: form.product_id,
				form_id: form.id,
				numberPerPage: 4,
				page: 1,
				shouldIncludeAnswers: true,
				mustHaveVerbatims: true,
				newReviews: true,
				needLogging: false // On ne veut pas créer l'événement service_reviews_view ici
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

	const hasNewReviews = reviewResults.data.length > 0;

	return nbReviews > 0 ? (
		<div className={fr.cx('fr-grid-row')}>
			<h2 className={fr.cx('fr-col-12', 'fr-mb-8v')}>Tableau de bord</h2>
			<h3 className={fr.cx('fr-col-12', 'fr-mb-6v')}>Dernières évolutions</h3>
			<div className={fr.cx('fr-col-4')}>
				<ObservatoireStats
					productId={form.product_id}
					formId={form.id}
					startDate={
						new Date(
							new Date(
								new Date().setDate(new Date().getDate() + 1)
							).setFullYear(new Date().getFullYear() - 1)
						)
							.toISOString()
							.split('T')[0]
					}
					endDate={new Date().toISOString().split('T')[0]}
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
			<div className={fr.cx('fr-col-8')}>
				<div className={fr.cx('fr-ml-4v')} style={{ height: '100%' }}>
					<AnswersChart
						fieldCode="satisfaction"
						productId={form.product.id}
						formId={form.id}
						startDate={
							new Date(new Date().setFullYear(new Date().getFullYear() - 1))
								.toISOString()
								.split('T')[0]
						}
						endDate={new Date().toISOString().split('T')[0]}
						total={nbReviews}
						displayLine={false}
						isFormDashboardType
						customHeight={350}
					/>
				</div>
			</div>

			<hr className={fr.cx('fr-col-12', 'fr-mt-10v', 'fr-mb-3v')} />

			<div className={fr.cx('fr-col-8')}>
				<h3>Dernières réponses</h3>
			</div>
			<div className={cx(classes.buttonsGroup, fr.cx('fr-col-4'))}>
				<Button
					priority="tertiary no outline"
					iconId="fr-icon-arrow-right-line"
					iconPosition="right"
					onClick={onClickGoToReviews}
				>
					Voir toutes les réponses
				</Button>
			</div>
			<div className={fr.cx('fr-col-12')}>
				<p className={classes.newReviewsLabel}>
					<b>
						{hasNewReviews
							? `${reviewResults.data.length} nouvelles réponses`
							: 'Aucune nouvelle réponse'}
					</b>{' '}
					depuis votre dernière connexion
				</p>
			</div>
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
									{displayIntention(satisfactionReview.intention ?? 'neutral')}
								</Badge>
							)}
							<p className={cx(classes.reviewText, fr.cx('fr-mb-4v'))}>
								{formatDateToFrenchString(
									review.created_at?.toISOString().split('T')[0] || ''
								)}
							</p>
							<p className={cx(classes.reviewText, fr.cx('fr-mb-0'))}>
								{
									review.answers?.find(a => a.field_code === 'verbatim')
										?.answer_text
								}
							</p>
						</div>
					);
				})}
			</div>
		</div>
	) : hasButtons ? (
		<div className={fr.cx('fr-my-10v')}>
			<NoReviewsDashboardPanel />
		</div>
	) : (
		<div>
			<h2>Tableau de bord</h2>
			<NoButtonsPanel
				onButtonClick={() => {
					modal.open();
				}}
			/>
		</div>
	);
};

const useStyles = tss.withName(DashboardTab.name).create({
	mainContainer: {
		...fr.spacing('padding', {}),
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		gap: fr.spacing('6v'),
		maxWidth: '65%',
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column',
			maxWidth: '100%'
		}
	},
	loaderContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: '500px',
		width: '100%'
	},
	container: {
		...fr.spacing('padding', {}),
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		a: {
			color: fr.colors.decisions.text.title.blueFrance.default
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
		}
	},
	reviewsContainer: {
		display: 'flex',
		width: '100%',
		gap: fr.spacing('3v')
	},
	reviewCard: {
		display: 'flex',
		width: '100%',
		maxWidth: '25%',
		flexDirection: 'column',
		padding: fr.spacing('4v'),
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`
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
		lineHeight: '20px'
	}
});

export default DashboardTab;
