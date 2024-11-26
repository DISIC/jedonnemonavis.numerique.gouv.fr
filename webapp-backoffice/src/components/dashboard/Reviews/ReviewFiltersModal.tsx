import { ReviewFiltersType } from '@/src/types/custom';
import {
	displayIntention,
	getStatsColor,
	getStatsIcon
} from '@/src/utils/stats';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { AnswerIntention } from '@prisma/client';
import React from 'react';
import Image from 'next/image';
import { tss } from 'tss-react/dsfr';
import { push } from '@socialgouv/matomo-next';
import Select from '@codegouvfr/react-dsfr/Select';
import { trpc } from '@/src/utils/trpc';

interface CustomModalProps {
	buttonProps: {
		id: string;
		'aria-controls': string;
		'data-fr-opened': boolean;
	};
	Component: (props: ModalProps) => JSX.Element;
	close: () => void;
	open: () => void;
	isOpenedByDefault: boolean;
	id: string;
}

interface Props {
	modal: CustomModalProps;
	filters: ReviewFiltersType;
	product_id: number;
	setButtonId: (buttonId: number | undefined) => void;
	submitFilters: (filters: ReviewFiltersType) => void;
}

const ReviewFiltersModal = (props: Props) => {
	const { modal, filters, submitFilters, setButtonId, product_id } = props;
	const { cx, classes } = useStyles();

	const { data: buttonResults, isLoading: isLoadingButtons } =
		trpc.button.getList.useQuery({
			page: 1,
			numberPerPage: 1000,
			product_id: product_id,
			isTest: true
		});

	const [tmpFilters, setTmpFilters] =
		React.useState<ReviewFiltersType>(filters);

	const isOpen = useIsModalOpen(modal);

	React.useEffect(() => {
		setTmpFilters(filters);
	}, [filters]);

	return (
		<modal.Component
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
			concealingBackdrop={false}
			title={'Filtres'}
			size="large"
		>
			<div className={fr.cx('fr-mt-4w')}>
				<p className={cx(classes.subtitle)}>Satisfaction</p>
				{['good', 'medium', 'bad'].map(intention => (
					<Button
						onClick={() => {
							setTmpFilters({
								...tmpFilters,
								satisfaction: tmpFilters.satisfaction.includes(intention)
									? tmpFilters.satisfaction.filter(item => item !== intention)
									: [...tmpFilters.satisfaction, intention]
							});
							push(['trackEvent', 'Product - Avis', 'Filtre-Satisfaction']);
						}}
						priority="tertiary"
						className={cx(
							classes.badge,
							tmpFilters.satisfaction.includes(intention)
								? classes.selectedOption
								: undefined
						)}
						key={`satisfaction_${intention}`}
						style={{
							color: getStatsColor({
								intention: (intention ?? 'neutral') as AnswerIntention
							})
						}}
					>
						<Image
							alt=""
							src={`/assets/smileys/${getStatsIcon({
								intention: (intention ?? 'neutral') as AnswerIntention
							})}.svg`}
							width={15}
							height={15}
						/>
						{displayIntention((intention ?? 'neutral') as AnswerIntention)}
					</Button>
				))}
			</div>

			<div className={fr.cx('fr-mt-4w')}>
				<p className={cx(classes.subtitle)}>
					Qu'avez-vous pensé des informations et des instructions fournies ?
				</p>
				<div className={cx(classes.rating)}>
					<span>Pas clair du tout</span>
					<fieldset className={fr.cx('fr-fieldset')}>
						<ul>
							{['1', '2', '3', '4', '5'].map(rating => (
								<li key={rating}>
									<input
										id={`radio-rating-${rating}`}
										className={fr.cx('fr-sr-only')}
										type="checkbox"
										onClick={() => {
											setTmpFilters({
												...tmpFilters,
												comprehension: tmpFilters.comprehension.includes(rating)
													? tmpFilters.comprehension.filter(
															item => item !== rating
														)
													: [...tmpFilters.comprehension, rating]
											});
											push(['trackEvent', 'Avis', 'Filtre-Notation']);
										}}
									/>
									<label
										htmlFor={`radio-rating-${rating}`}
										className={
											tmpFilters.comprehension.includes(rating)
												? classes.selectedNumberOption
												: undefined
										}
									>
										{rating}
									</label>
								</li>
							))}
						</ul>
					</fieldset>
					<span>Très clair</span>
				</div>
			</div>

			<div className={fr.cx('fr-mt-4w')}>
				<p className={cx(classes.subtitle)}>Filtres complémentaires</p>
				<Select
					label="Sélectionner une source"
					nativeSelectProps={{
						value: tmpFilters.buttonId[0],
						onChange: e => {
							setTmpFilters({
								...tmpFilters,
								buttonId: e.target.value !== 'undefined' ? [e.target.value] : []
							});
							push(['trackEvent', 'Avis', 'Sélection-bouton']);
						}
					}}
				>
					<option value="undefined">Toutes les sources</option>
					{buttonResults?.data?.map(button => {
						return (
							<option key={button.id} value={button.id}>
								{button.title}
							</option>
						);
					})}
				</Select>
			</div>

			<div className={fr.cx('fr-mt-4w')}>
				<p className={cx(classes.subtitle)}>Filtres complémentaires</p>
				<Checkbox
					options={[
						{
							label: 'Verbatim complété',
							nativeInputProps: {
								name: 'needVerbatim',
								checked: tmpFilters.needVerbatim,
								onChange: () => {
									setTmpFilters({
										...tmpFilters,
										needVerbatim: !tmpFilters.needVerbatim
									});
									push(['trackEvent', 'Avis', 'Filtre-Complémentaire']);
								}
							}
						}
					]}
					state="default"
				/>
			</div>

			<div
				className={fr.cx(
					'fr-grid-row',
					'fr-grid-row--gutters',
					'fr-grid-row--left',
					'fr-mt-4w'
				)}
			>
				<ul className={cx(classes.listContainer)}>
					<li>
						<Button
							priority="secondary"
							className={fr.cx('fr-mt-1w')}
							type="button"
							onClick={() => {
								setTmpFilters(filters);
								modal.close();
								push(['trackEvent', 'Product - Avis', 'Cancel-Filters']);
							}}
						>
							Annuler
						</Button>
					</li>
					<li>
						<Button
							priority="secondary"
							className={fr.cx('fr-mt-1w')}
							iconId="fr-icon-edit-line"
							iconPosition="right"
							type="button"
							onClick={() => {
								setTmpFilters({
									satisfaction: [],
									comprehension: [],
									needVerbatim: false,
									needOtherDifficulties: false,
									needOtherHelp: false,
									help: [],
									buttonId: []
								});
								push(['trackEvent', 'Product - Avis', 'Reinit-filters']);
							}}
						>
							Réinitialiser
						</Button>
					</li>
					<li>
						<div className={cx(classes.applyWrapper)}>
							<Button
								priority="primary"
								className={fr.cx('fr-mt-1w')}
								type="button"
								onClick={() => {
									submitFilters(tmpFilters);
									push(['trackEvent', 'Product - Avis', 'Apply-Filters']);
								}}
							>
								Appliquer les filtres
							</Button>
						</div>
					</li>
				</ul>
			</div>
		</modal.Component>
	);
};

const useStyles = tss.withName(ReviewFiltersModal.name).create(() => ({
	applyWrapper: {
		display: 'flex',
		justifyContent: 'end'
	},
	wrapperMobile: {
		[fr.breakpoints.down('sm')]: {
			display: 'flex',
			justifyContent: 'end'
		}
	},
	listContainer: {
		display: 'flex',
		width: '100%',
		gap: '1rem',
		padding: 0,
		margin: 0,
		listStyle: 'none',
		justifyContent: 'space-between'
	},
	iconError: {
		color: fr.colors.decisions.text.default.error.default
	},
	subtitle: {
		...fr.typography[19].style,
		marginBottom: 10,
		fontWeight: 'bold'
	},
	badge: {
		marginRight: 10,
		cursor: 'pointer',
		gap: '0.25rem'
	},
	selectedOption: {
		backgroundColor: fr.colors.decisions.background.alt.grey.hover,
		color: 'white'
	},
	selectedNumberOption: {
		backgroundColor: fr.colors.decisions.background.flat.blueFrance.default,
		color: 'white',
		fontWeight: 'bold'
	},
	rating: {
		display: 'flex',
		alignItems: 'center',
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column'
		},
		'& > span': {
			...fr.typography[18].style,
			marginBottom: 0
		},
		fieldset: {
			margin: 0,
			[fr.breakpoints.down('md')]: {
				width: '100%'
			},
			ul: {
				listStyleType: 'none',
				columns: 5,
				gap: 10,
				margin: '0 1rem',
				padding: 0,
				overflow: 'hidden',
				[fr.breakpoints.down('md')]: {
					columns: 'auto',
					width: '100%'
				},
				li: {
					label: {
						width: '3.5rem',
						justifyContent: 'center',
						border: `1px solid ${fr.colors.decisions.background.alt.grey.hover}`,
						padding: `${fr.spacing('1v')} ${fr.spacing('3v')}`,
						display: 'flex',
						alignItems: 'center',
						cursor: 'pointer',
						['&:hover']: {
							borderColor: fr.colors.decisions.background.alt.grey.active,
							fontWeight: 'bold'
						},
						[fr.breakpoints.down('md')]: {
							width: '100%'
						}
					}
				}
			}
		}
	}
}));

export default ReviewFiltersModal;
