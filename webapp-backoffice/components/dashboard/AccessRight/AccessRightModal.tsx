import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { Input } from '@codegouvfr/react-dsfr/Input';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import type { AccessRightUserWithUsers } from '@/pages/api/prisma/accessRight/type';

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
	productId: number;
	setIsModalSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
	currentAccessRight: AccessRightUserWithUsers | undefined;
	setCurrentAccessRight: React.Dispatch<
		React.SetStateAction<AccessRightUserWithUsers | undefined>
	>;
}

const ButtonModal = (props: Props) => {
	const { cx } = useStyles();
	const {
		modal,
		isOpen,
		modalType,
		productId,
		currentAccessRight,
		setIsModalSubmitted,
		setCurrentAccessRight
	} = props;

	const [email, setEmail] = React.useState<string>('');
	const [errorStatus, setErrorStatus] = React.useState<number>();

	React.useEffect(() => {
		setEmail('');
		setErrorStatus(undefined);
	}, [isOpen]);

	async function handleModalSubmit(email?: string) {
		if (modalType === 'add' && email !== undefined) {
			const res = await fetch(
				`/api/prisma/accessRight?product_id=${productId}`,
				{
					method: 'POST',
					body: JSON.stringify({ email })
				}
			);
			if (res.ok) {
				const data = await res.json();
				setIsModalSubmitted(true);
				setCurrentAccessRight(data);
				modal.close();
			} else {
				setErrorStatus(res.status);
			}
		} else if (modalType === 'remove') {
			if (currentAccessRight === undefined) return;
			const res = await fetch(
				`/api/prisma/accessRight/${currentAccessRight.id}`,
				{
					method: 'PUT',
					body: JSON.stringify({ status: 'removed' })
				}
			);
			if (res.ok) {
				setIsModalSubmitted(true);
				modal.close();
			}
		}
	}

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
							stateRelatedMessage={
								errorStatus == 409
									? "L'utilisateur avec cet email fait déjà partie de ce produit"
									: 'Erreur serveur'
							}
							nativeInputProps={{
								value: email,
								onChange: e => setEmail(e.target.value)
							}}
						/>
					</div>
				);
			case 'remove':
				return (
					<div className={fr.cx('fr-pt-4v')}>
						<p>
							Vous êtes sûr de vouloir retirer{' '}
							{currentAccessRight?.user?.firstName}{' '}
							{currentAccessRight?.user?.lastName} comme porteur ou porteuse de
							ce produit numérique ?
						</p>
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
			case 'remove':
				return [
					...defaultButtons,
					{
						children: 'Retirer',
						priority: 'primary',
						doClosesModal: false,
						onClick: () => handleModalSubmit()
					}
				];
			default:
				return [...defaultButtons];
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
