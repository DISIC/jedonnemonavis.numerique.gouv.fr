import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { tss } from 'tss-react/dsfr';
import React from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { ReviewFiltersType } from '@/src/types/custom';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';

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
	counts: {
		countFiltered: number,
		countAll: number
	},
	action: (choice: 'all' | 'filtered') => void;
}

const ExportModal = (props: Props) => {
	const { modal, counts, action } = props;
	const [choice, setChoice] = React.useState<'all' | 'filtered' | null>(null)
	const { cx, classes } = useStyles();

	return (
		<modal.Component
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
			concealingBackdrop={false}
			title={'Télécharger les avis'}
			size="large"
		>
			
			<Alert
				description="
				Vous pouvez télécharger l'ensemble des avis relatifs à cette démarche ou uniquement ceux correspondant aux critères spécifiés par les filtres que vous avez sélectionnés."
				severity="info"
				small
				className={
					fr.cx('fr-mt-10v')
				}
			/>
			<RadioButtons
				legend="Que souhaitez-vous télécharger ?"
				name="radio"
				options={[
					{
						label: `Télécharger tous les avis (${counts.countAll} avis)`,
						nativeInputProps: {
							value: 'all',
							onClick: () => {
								setChoice('all')
							}
						}
					},
					{
						label: `Télécharger en fonction des filtres (${counts.countFiltered} avis)`,
						nativeInputProps: {
							value: 'filtered',
							onClick: () => {
								setChoice('filtered')
							}
						}
					}
				]}
				className={
					fr.cx('fr-mt-10v')
				}
			/>
			<div className={cx(classes.buttonWrapper, fr.cx('fr-col-12'))}>
				<Button
						priority="primary"
						type="button"
						disabled={choice === null}
						nativeButtonProps={{
							onClick: () => {
								if(choice) action(choice)
							}
						}}
						className={
							fr.cx('fr-mt-10v')
						}
					>
					Valider
                </Button>
			</div>

		</modal.Component>
	);
};

const useStyles = tss.withName(ExportModal.name).create(() => ({
	buttonWrapper: {
		display: 'flex',
		justifyContent: 'flex-end'
	}
}));

export default ExportModal;