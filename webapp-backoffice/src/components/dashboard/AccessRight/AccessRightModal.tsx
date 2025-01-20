import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { Input } from '@codegouvfr/react-dsfr/Input';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import type { AccessRightWithUsers } from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { AccessRightModalType } from '@/src/pages/administration/dashboard/product/[id]/access';
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
	isOpen: boolean;
	modal: CustomModalProps;
	modalType: AccessRightModalType;
	productId: number;
	productName: string;
	setIsModalSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
	currentAccessRight: AccessRightWithUsers | undefined;
	setCurrentAccessRight: React.Dispatch<
		React.SetStateAction<AccessRightWithUsers | undefined>
	>;
}

const ButtonModal = (props: Props) => {
	const { cx, classes } = useStyles();
	const {
		modal,
		isOpen,
		modalType,
		productId,
		productName,
		currentAccessRight,
		setIsModalSubmitted,
		setCurrentAccessRight
	} = props;

	const utils = trpc.useUtils();

	const [email, setEmail] = React.useState<string>('');
	const [errorStatus, setErrorStatus] = React.useState<number>();
	const [role, setRole] = React.useState<'carrier_user' | 'carrier_admin'>(
		'carrier_user'
	);
	React.useEffect(() => {
		setEmail('');
		setRole('carrier_user');
		setErrorStatus(undefined);
	}, [isOpen]);

	const createAccessRight = trpc.accessRight.create.useMutation({
		onSuccess: result => {
			utils.accessRight.getList.invalidate();
			setCurrentAccessRight(result.data);
			setIsModalSubmitted(true);
			modal.close();
		},
		onError: error => {
			setErrorStatus(error.data?.httpStatus);
		}
	});

	const updateAccessRight = trpc.accessRight.update.useMutation({
		onSuccess: () => {
			utils.accessRight.getList.invalidate();
			setIsModalSubmitted(true);
			modal.close();
		}
	});

	function handleModalSubmit(email?: string) {
		if (modalType === 'add' && email !== undefined) {
			createAccessRight.mutate({
				product_id: productId,
				user_email: email,
				role
			});
		} else if (modalType === 'switch') {
			const statusMapping = {
				carrier_admin: 'carrier_user',
				carrier_user: 'carrier_admin'
			} as const;

			if (
				currentAccessRight?.status &&
				currentAccessRight.status in statusMapping
			) {
				updateAccessRight.mutate({
					id: currentAccessRight.id,
					status:
						statusMapping[
							currentAccessRight.status as keyof typeof statusMapping
						]
				});
			}
		} else if (modalType === 'remove') {
			if (currentAccessRight === undefined) return;
			updateAccessRight.mutate({
				id: currentAccessRight.id,
				status: 'removed'
			});
		} else if (modalType === 'reintegrate') {
			if (currentAccessRight === undefined) return;
			updateAccessRight.mutate({
				id: currentAccessRight.id,
				status: 'carrier_user'
			});
		}
	}

	const displayModalTitle = (): string => {
		switch (modalType) {
			case 'add':
				return 'Inviter un utilisateur';
			case 'switch':
				return currentAccessRight?.status === 'carrier_admin'
					? 'Passer en utilisateur de service'
					: 'Passer en administrateur de service';
			case 'remove':
				return "Retirer l'accès";
			case 'reintegrate':
				return 'Réintégrer un administrateur';
			default:
				return '';
		}
	};

	const displayModalContent = (): JSX.Element => {
		switch (modalType) {
			case 'add':
				return (
					<>
						<div className={fr.cx('fr-pt-4v')}>
							<Input
								id="button-code"
								label="Adresse email"
								state={errorStatus ? 'error' : 'default'}
								stateRelatedMessage={
									errorStatus == 409
										? "L'utilisateur avec cet email a déja accès à ce service ou à l'oganisation à laquelle appartient ce service."
										: 'Erreur serveur'
								}
								nativeInputProps={{
									value: email,
									onChange: e => setEmail(e.target.value)
								}}
							/>
						</div>
						<div className={fr.cx('fr-pt-4v')}>
							<form>
								<RadioButtons
									legend="Rôle"
									name="access-role"
									options={[
										{
											label: 'Utilisateur du service',
											hintText:
												'Utilisateurs ayant le droit de voir le service, mais pas de le modifier',
											nativeInputProps: {
												value: 'carrier_user',
												onChange: e =>
													setRole(
														e.target.value as 'carrier_user' | 'carrier_admin'
													),
												checked: role === 'carrier_user'
											}
										},
										{
											label: 'Administrateur du service',
											hintText:
												'Utilisateurs ayant le droit de modifier tout aspect du service',
											nativeInputProps: {
												value: 'carrier_admin',
												onChange: e =>
													setRole(
														e.target.value as 'carrier_user' | 'carrier_admin'
													),
												checked: role === 'carrier_admin'
											}
										}
									]}
								/>
							</form>
						</div>
					</>
				);
			case 'switch':
				return (
					<div className={fr.cx('fr-pt-4v')}>
						{currentAccessRight &&
						currentAccessRight.status === 'carrier_admin' ? (
							<p>
								Êtes-vous sûr de vouloir passer{' '}
								<span className={cx(classes.boldText)}>
									{currentAccessRight?.user
										? `${currentAccessRight?.user?.firstName} ${currentAccessRight?.user?.lastName}`
										: currentAccessRight?.user_email_invite}
								</span>{' '}
								en utilisateur du service ? Cette personne ne va plus pouvoir
								modifier ce service.
							</p>
						) : (
							<p>
								Êtes-vous sûr de vouloir passer{' '}
								<span className={cx(classes.boldText)}>
									{currentAccessRight?.user
										? `${currentAccessRight?.user?.firstName} ${currentAccessRight?.user?.lastName}`
										: currentAccessRight?.user_email_invite}
								</span>{' '}
								en administrateur du service ? Cette personne va pouvoir
								modifier tout aspect de ce service.
							</p>
						)}
					</div>
				);
			case 'remove':
				return (
					<div className={fr.cx('fr-pt-4v')}>
						{currentAccessRight?.user ? (
							<p>
								Souhaitez-vous vraiment retirer les droits d'accès de{' '}
								<span className={cx(classes.boldText)}>
									{currentAccessRight?.user
										? `${currentAccessRight?.user?.firstName} ${currentAccessRight?.user?.lastName}`
										: currentAccessRight?.user_email_invite}
								</span>{' '}
								pour <span className={cx(classes.boldText)}>{productName}</span>{' '}
								?
							</p>
						) : (
							<p>
								Souhaitez-vous vraiment retirer les droits d'accès pour{' '}
								<span className={cx(classes.boldText)}>{productName}</span> ?
							</p>
						)}
					</div>
				);
			case 'reintegrate':
				return (
					<div className={fr.cx('fr-pt-4v')}>
						<p>
							Vous êtes sûr de vouloir rétablir l'accès à ce produit pour{' '}
							{currentAccessRight?.user
								? `${currentAccessRight?.user?.firstName} ${currentAccessRight?.user?.lastName}`
								: currentAccessRight?.user_email_invite}
							?
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
			case 'switch':
				return [
					...defaultButtons,
					{
						children:
							currentAccessRight?.status === 'carrier_admin'
								? 'Passer en utilisateur de service'
								: 'Passer en administrateur de service',
						priority: 'primary',
						doClosesModal: false,
						onClick: () => handleModalSubmit()
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
			case 'reintegrate':
				return [
					...defaultButtons,
					{
						children: "Rétablir l'accès",
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

const useStyles = tss.withName(ButtonModal.name).create(() => ({
	infoWrapper: {
		display: 'flex',
		alignItems: 'start'
	},
	infoText: {
		color: fr.colors.decisions.background.flat.info.default,
		fontSize: '0.875rem',
		lineHeight: '1.25rem',
		marginBottom: 0
	},
	boldText: {
		fontWeight: 'bold'
	}
}));

export default ButtonModal;
