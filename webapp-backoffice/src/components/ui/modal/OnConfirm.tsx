import { CustomModalProps } from '@/src/types/custom';
import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import React from 'react';
import { tss } from 'tss-react/dsfr';


interface Props {
	modal: CustomModalProps;
	title: string;
	children: React.ReactNode;
	handleOnConfirm: () => void;
	confirmText?: string;
	cancelText?: string;
	kind?: 'default' | 'danger';
	disableAction?: boolean;
	priorityReversed?: boolean;
}

const OnConfirmModal = (props: Props) => {
	const { cx, classes } = useStyles();
	const {
		modal,
		title,
		children,
		handleOnConfirm,
		confirmText,
		cancelText,
		kind = 'default',
		disableAction,
		priorityReversed
	} = props;

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
					className: classes.dangerButton,
					disabled: disableAction ?? false
				};

				break;
			case 'default':
				confirmButtonProps = {
					children: confirmText ? confirmText : 'Confirmer',
					disabled: disableAction ?? false,
					priority: priorityReversed ? 'secondary' : 'primary'
				};
				break;
		}

		return confirmButtonProps;
	};

	const buttons: [
		ModalProps.ActionAreaButtonProps,
		...ModalProps.ActionAreaButtonProps[]
	] = [
		{
			children: cancelText ? cancelText : 'Annuler',
			priority: priorityReversed ? 'primary' : 'secondary'
		},
		{
			...getConfirmButtonProps(),
			doClosesModal: false,
			onClick: () => handleOnConfirm()
		}
	];
	const reversedButtons = [...buttons].reverse() as typeof buttons;

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
			buttons={priorityReversed ? reversedButtons : buttons}
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
