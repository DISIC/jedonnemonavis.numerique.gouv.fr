import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import React from 'react';
import { tss } from 'tss-react/dsfr';

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
	title: string;
	children: React.ReactNode;
	handleOnConfirm: () => void;
}

const OnConfirmModal = (props: Props) => {
	const { cx, classes } = useStyles();
	const { modal, title, children, handleOnConfirm } = props;

	return (
		<modal.Component
			title={title}
			concealingBackdrop={false}
			size="large"
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
			buttons={[
				{
					children: 'Annuler',
					priority: 'secondary'
				},
				{
					children: 'Oui',
					doClosesModal: false,
					onClick: () => handleOnConfirm()
				}
			]}
		>
			<div>{children}</div>
		</modal.Component>
	);
};

const useStyles = tss.withName(OnConfirmModal.name).create(() => ({
	boldText: {
		fontWeight: 'bold'
	}
}));

export default OnConfirmModal;
