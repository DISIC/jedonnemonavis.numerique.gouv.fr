import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { Input } from '@codegouvfr/react-dsfr/Input';
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
	isOpen: boolean;
	modal: CustomModalProps;
	modalType: 'add' | 'remove' | 'resend-email';
	productId: string;
}

const ButtonModal = (props: Props) => {
	const { cx } = useStyles();
	const { modal, isOpen, modalType, productId } = props;

	const [email, setEmail] = React.useState<string>('');
	const [errorStatus, setErrorStatus] = React.useState<number>();

	React.useEffect(() => {
		setEmail('');
		setErrorStatus(undefined);
	}, [isOpen]);

	async function handleModalSubmit(email?: string) {
		if (modalType === 'add' && email !== undefined) {
			const res = await fetch(`/api/prisma/userProduct?product_id=${productId}`, {
				method: 'POST',
				body: JSON.stringify({ email })
			});
			if (res.ok) {
				modal.close();
			} else {
				setErrorStatus(res.status);
			}
		}
		// else if (modalType === 'remove') {
		// 	await fetch(`/api/prisma/userProduct/${currentUserProductId}`, {
		// 		method: 'PUT',
		// 		body: JSON.stringify({ status: 'removed' })
		// 	});
		// }
	};

	const displayModalTitle = (): string => {
		switch (modalType) {
			case 'add':
				return 'Inviter un porteur ou une porteuse';
			case 'remove':
				return 'Retirer un porteur ou une porteuse';
			default:
				return '';
		}
	};

	const displayModalContent = (): JSX.Element => {
		switch (modalType) {
			case 'add':
				return (
					<div className={fr.cx('fr-pt-4v')}>
						<Input
							id="button-code"
							label="Adresse mail du porteur"
							state={errorStatus ? 'error' : 'default'}
							stateRelatedMessage={errorStatus == 409 ? "L'utilisateur avec cet email fait déjà partie de ce produit" : "Erreur serveur"}
							nativeInputProps={{
								value: email,
								onChange: e => setEmail(e.target.value)
							}}
						/>
					</div>
				);
			default:
				return <div></div>;
		}
	};

	const displayModalButtons = ():
		| ModalProps.ActionAreaButtonProps
		| [ModalProps.ActionAreaButtonProps, ...ModalProps.ActionAreaButtonProps[]]
		| undefined => {
		const defaultButtons = [
			{
				children: 'Annuler',
				priority: 'secondary',
				onClick: modal.close
			}
		] as const;

		switch (modalType) {
			case 'add':
				return [
					...defaultButtons,
					{
						children: 'Inviter',
						priority: 'primary',
						doClosesModal: false,
						onClick: () => handleModalSubmit(email)
					}
				];
		}

		return;
	};

	return (
		<modal.Component
			title={displayModalTitle()}
			concealingBackdrop={false}
			topAnchor={true}
			size="medium"
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
			buttons={displayModalButtons()}
		>
			{displayModalContent()}
		</modal.Component>
	);
};

const useStyles = tss.withName(ButtonModal.name).create(() => ({}));

export default ButtonModal;
