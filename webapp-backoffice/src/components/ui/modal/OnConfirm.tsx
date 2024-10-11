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
	kind?: 'default' | 'danger';
}

const OnConfirmModal = (props: Props) => {
	const { cx, classes } = useStyles();
	const { modal, title, children, handleOnConfirm, kind = 'default' } = props;

	const getConfirmButtonProps = () => {
		let confirmButtonProps: ModalProps.ActionAreaButtonProps = {
			children: ''
		};

		switch (kind) {
			case 'danger':
				confirmButtonProps = {
					children: (
						<>
							Supprimer{' '}
							<span
								className={cx(classes.dangerIcon, fr.cx('ri-delete-bin-line'))}
								aria-hidden="true"
							/>
						</>
					),
					priority: 'tertiary',
					className: classes.dangerButton
				};

				break;
			case 'default':
				confirmButtonProps = { children: 'Oui' };
				break;
		}

		return confirmButtonProps;
	};

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
					...getConfirmButtonProps(),
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
	},
	dangerButton: {
		color: fr.colors.decisions.text.default.error.default,
		boxShadow: `inset 0 0 0 1px ${fr.colors.decisions.text.default.error.default}`
	},
	dangerIcon: {
		width: fr.spacing('4v'),
		height: fr.spacing('4v'),
		marginLeft: fr.spacing('1v'),
		'&::before': {
			width: fr.spacing('4v'),
			height: fr.spacing('4v'),
			verticalAlign: 'top'
		}
	}
}));

export default OnConfirmModal;
