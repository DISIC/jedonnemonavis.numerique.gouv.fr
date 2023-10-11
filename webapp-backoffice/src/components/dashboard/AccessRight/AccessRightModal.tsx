import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { Input } from '@codegouvfr/react-dsfr/Input';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import type { AccessRightWithUsers } from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { AccessRightModalType } from '@/src/pages/administration/dashboard/product/[id]/access';

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
		currentAccessRight,
		setIsModalSubmitted,
		setCurrentAccessRight
	} = props;

	const utils = trpc.useContext();

	const [email, setEmail] = React.useState<string>('');
	const [errorStatus, setErrorStatus] = React.useState<number>();

	React.useEffect(() => {
		setEmail('');
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
				user_email: email
			});
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
				status: 'carrier'
			});
		}
	}

	const displayModalTitle = (): string => {
		switch (modalType) {
			case 'add':
				return 'Inviter un porteur ou une porteuse';
			case 'remove':
				return 'Retirer un porteur ou une porteuse';
			case 'reintegrate':
				return 'Réintégrer un porteur ou une porteuse';
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
						<div className={classes.infoWrapper}>
							<i className={fr.cx('fr-info-text', 'fr-mt-0')}></i>
							<p className={cx(fr.cx(), classes.infoText)}>
								Si la personne a déjà un compte sur Je donne mon avis, elle va
								avoir accès immédiatement à ce produit numérique. Si la personne
								n’a pas encore de compte, elle reçoit un e-mail d’invitation à
								l’adresse saisie.
							</p>
						</div>
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
			case 'reintegrate':
				return (
					<div className={fr.cx('fr-pt-4v')}>
						<p>
							Vous êtes sûr de vouloir rétablir l'accès à ce produit pour{' '}
							{currentAccessRight?.user?.firstName}{' '}
							{currentAccessRight?.user?.lastName} ?
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
	}
}));

export default ButtonModal;
