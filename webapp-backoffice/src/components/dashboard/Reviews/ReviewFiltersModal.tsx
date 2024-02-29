import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { tss } from 'tss-react/dsfr';
import React from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { displayIntention, getStatsColor, getStatsIcon } from '@/src/utils/stats';
import { AnswerIntention } from '@prisma/client';
import { ReviewFiltersType } from '@/src/types/custom';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import Select from '@codegouvfr/react-dsfr/Select';
import { DIFFICULTIES_LABEL, HELP_LABELS } from '@/src/utils/helpers';
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";

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
	submitFilters: (filters: ReviewFiltersType) => void;
}

const ReviewFiltersModal = (props: Props) => {
	const { modal, filters, submitFilters } = props;
	const { cx, classes } = useStyles();

	const [tmpFilters, setTmpFilters] = React.useState<ReviewFiltersType>(filters);

	const isOpen = useIsModalOpen(modal);

	React.useEffect(() => {
		if(isOpen){
			setTmpFilters(filters)
		}
	}, [isOpen]);

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

			<div className={fr.cx(
				'fr-mt-4v'
			)}>
				<p className={cx(classes.subtitle)}>Satisfaction</p>
				{['good', 'medium', 'bad'].map((intention) => (
					<Button
						iconId={getStatsIcon({
							intention: (intention ?? 'neutral') as AnswerIntention
						})}
						onClick={() => {setTmpFilters({...tmpFilters, satisfaction: tmpFilters.satisfaction !== intention ? intention : ''})}}
						priority="tertiary"
						className={cx(classes.badge)}
						key={`satisfaction_${intention}`}
						style={{
							color: getStatsColor({
								intention: (intention ?? 'neutral') as AnswerIntention
							}),
							backgroundColor: tmpFilters.satisfaction === intention ? '#dfdfdf' : 'transparent'
						}}
					>
						{displayIntention((intention ?? 'neutral') as AnswerIntention)}
				  </Button>
				))}	
			</div>

			<div className={fr.cx(
				'fr-mt-4v'
			)}>
				<p className={cx(classes.subtitle)}>Facilité</p>
				{['good', 'medium', 'bad'].map((intention) => (
					<Button
						iconId={getStatsIcon({
							intention: (intention ?? 'neutral') as AnswerIntention
						})}
						onClick={() => {setTmpFilters({...tmpFilters, easy: tmpFilters.easy !== intention ? intention : ''})}}
						priority="tertiary"
						className={cx(classes.badge)}
						key={`easy_${intention}`}
						style={{
							color: getStatsColor({
								intention: (intention ?? 'neutral') as AnswerIntention
							}),
							backgroundColor: tmpFilters.easy === intention ? '#dfdfdf' : 'transparent'
						}}
					>
						{displayIntention((intention ?? 'neutral') as AnswerIntention)}
				</Button>
				))}	
			</div>


			<div className={fr.cx(
				'fr-mt-4v'
			)}>
				<p className={cx(classes.subtitle)}>Langage</p>
				{['good', 'medium', 'bad'].map((intention) => (
					<Button
						iconId={getStatsIcon({
							intention: (intention ?? 'neutral') as AnswerIntention
						})}
						onClick={() => {setTmpFilters({...tmpFilters, comprehension: tmpFilters.comprehension !== intention ? intention : ''})}}
						priority="tertiary"
						className={cx(classes.badge)}
						key={`comprehension_${intention}`}
						style={{
							color: getStatsColor({
								intention: (intention ?? 'neutral') as AnswerIntention
							}),
							backgroundColor: tmpFilters.comprehension === intention ? '#dfdfdf' : 'transparent'
						}}
					>
						{displayIntention((intention ?? 'neutral') as AnswerIntention)}
				  </Button>
				))}	
			</div>

			<div className={fr.cx(
				'fr-mt-4v'
			)}>
				<p className={cx(classes.subtitle)}>Informations rentrées par l'utilisateur</p>
				<Checkbox
					options={[
						{
							label: 'Verbatim',
							nativeInputProps: {
								name: 'needVerbatim',
								checked: tmpFilters.needVerbatim,
								onChange: () => {setTmpFilters({...tmpFilters, needVerbatim: !tmpFilters.needVerbatim})}
							}
						},
						{
							label: 'Autre difficulté',
							nativeInputProps: {
								name: 'needOtherDifficulties',
								checked: tmpFilters.needOtherDifficulties,
								onChange: () => {setTmpFilters({...tmpFilters, needOtherDifficulties: !tmpFilters.needOtherDifficulties})}
							}
						},
						{
							label: 'Autre aide',
							nativeInputProps: {
								name: 'needOtherHelp',
								checked: tmpFilters.needOtherHelp,
								onChange: () => {setTmpFilters({...tmpFilters, needOtherHelp: !tmpFilters.needOtherHelp})}
							}
						}
					]}
					state="default"
					/>
			</div>

			<div className={fr.cx(
				'fr-mt-4v'
			)}>
				<Select
					label="Difficulté"
					nativeSelectProps={{
						name: 'difficulties',
						onChange: event => setTmpFilters({...tmpFilters, difficulties: event.target.value}),
						value: tmpFilters.difficulties
					}}
				>
					<option disabled hidden value="">Sélectionner une option</option>
					{DIFFICULTIES_LABEL.map((difficulty) => (
						<option value={difficulty.value} key={`difficulty_${difficulty.value}`}>{difficulty.label}</option>
					))}
				</Select>
			</div>

			<div className={fr.cx(
				'fr-mt-4v'
			)}>
				<Select
					label="Aide"
					nativeSelectProps={{
						name: 'help',
						onChange: event => setTmpFilters({...tmpFilters, help: event.target.value}),
						value: tmpFilters.help
					}}
				>
					<option disabled hidden value="">Sélectionner une option</option>
					{HELP_LABELS.map((help) => (
						<option value={help.value} key={`help_${help.value}`}>{help.label}</option>
					))}
				</Select>
			</div>

			<div className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--gutters',
				'fr-grid-row--left',
				'fr-mt-4v'
			)}>
				<div className={fr.cx('fr-col-6', 'fr-col-sm-3')}>
					<Button
						priority="secondary"
						className={fr.cx('fr-mt-1w')}
						type="button"
						onClick={() => modal.close()}
					>
						Annuler
					</Button>
				</div>
				<div className={cx(classes.wrapperMobile, fr.cx('fr-col-6', 'fr-col-sm-3'))}>
					<Button
						priority="secondary"
						className={fr.cx('fr-mt-1w')}
						iconId="fr-icon-edit-line"
						iconPosition="right"
						type="button"
						onClick={() => setTmpFilters({
							satisfaction: '',
							easy: '',
							comprehension: '',
							needVerbatim: false,
							needOtherDifficulties: false,
							needOtherHelp: false,
							difficulties: '',
							help: ''
						})}
					>
						Réinitialiser
					</Button>
				</div>
				<div className={cx(fr.cx('fr-col-12', 'fr-col-sm-6'), classes.applyWrapper)}>
					<Button
						priority="primary"
						className={fr.cx('fr-mt-1w')}
						type="button"
						onClick={() => submitFilters(tmpFilters)}
					>
						Appliquer les filtres
					</Button>
				</div>

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
	iconError: {
		color: fr.colors.decisions.text.default.error.default
	},
	subtitle: {
		fontSize: 16,
		marginBottom: 10
	},
	badge: {
		marginRight: 10,
		cursor: 'pointer'
	}
}));

export default ReviewFiltersModal;