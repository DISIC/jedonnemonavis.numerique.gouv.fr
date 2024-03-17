import { AdminEntityRightWithUsers } from '@/src/types/prismaTypesExtended';
import { getNbPages, isValidEmail } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { AdminEntityRight, Entity } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { Loader } from '../../ui/Loader';
import EntityRightCard from './EntityRightCard';
import { useSession } from 'next-auth/react';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Input from '@codegouvfr/react-dsfr/Input';
import Button from '@codegouvfr/react-dsfr/Button';

export type AdminEntityRightActionType = 'add' | 'remove' | 'resend-email';

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
	refetchEntities: () => void;
	entity?: Entity;
}

const EntityRightsModal = (props: Props) => {
	const { modal, entity, isOpen, refetchEntities } = props;

	const { data: session } = useSession();

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, _] = React.useState(1000);
	const [adminEntityRights, setAdminEntityRights] = useState<
		AdminEntityRightWithUsers[]
	>([]);
	const [adminEntityRightsCount, setAdminEntityRightsCount] =
		useState<number>(0);

	const [actionType, setActionType] =
		useState<AdminEntityRightActionType | null>(null);
	const [actionEntityRight, setActionEntityRight] =
		useState<AdminEntityRightWithUsers | null>(null);

	const [userAddEmail, setUserAddEmail] = useState<string>('');
	const [addError, setAddError] = useState<string>('');

	const { cx, classes } = useStyles({ addError });

	const nbPages = getNbPages(adminEntityRightsCount, numberPerPage);

	const { refetch: refetchAdminEntityRights, isLoading } =
		trpc.adminEntityRight.getList.useQuery(
			{
				page: currentPage,
				numberPerPage,
				entity_id: entity?.id || -1
			},
			{
				enabled: !!entity,
				onSuccess: adminEntityRightsResult => {
					setAdminEntityRights(adminEntityRightsResult.data);
					setAdminEntityRightsCount(adminEntityRightsResult.metadata.count);
				}
			}
		);

	const addAdminEntityRight = trpc.adminEntityRight.create.useMutation({
		onSuccess: response => {
			setActionType('add');
			setActionEntityRight(response.data);
			refetchAdminEntityRights();
			setUserAddEmail('');
		},
		onError: e => {
			if (e.data?.httpStatus === 409) {
				setAddError('Cet utilisateur fait déjà parti des administrateurs');
			} else {
				setAddError('Erreur coté serveur...');
			}
		}
	});

	const resendEmailAdminEntityRight =
		trpc.adminEntityRight.resendEmail.useMutation({});

	const removeAdminEntityRight = trpc.adminEntityRight.delete.useMutation({
		onSuccess: () => {
			refetchAdminEntityRights();
		}
	});

	const handleModalClose = () => {
		modal.close();
	};

	const handleAddUser = () => {
		addAdminEntityRight.mutate({
			user_email: userAddEmail,
			entity_id: entity?.id || -1
		});
	};

	const handleActionsButtons = (
		actionType: AdminEntityRightActionType,
		adminEntityRight: AdminEntityRightWithUsers
	) => {
		setActionType(actionType);
		setActionEntityRight(adminEntityRight);

		if (actionType === 'remove') {
			removeAdminEntityRight.mutate({
				admin_entity_right_id: adminEntityRight.id
			});
			return;
		}

		if (actionType == 'resend-email') {
			resendEmailAdminEntityRight.mutate({
				entity_id: entity?.id || -1,
				user_email: adminEntityRight?.user_email_invite as string
			});
			return;
		}
	};

	const displayModalButtons = ():
		| ModalProps.ActionAreaButtonProps
		| [ModalProps.ActionAreaButtonProps, ...ModalProps.ActionAreaButtonProps[]]
		| undefined => {
		return [
			{
				children: 'Retour',
				iconId: 'ri-arrow-left-line',
				priority: 'secondary',
				doClosesModal: false,
				onClick: () => handleModalClose()
			}
		];
	};

	const getAlertTitle = () => {
		switch (actionType) {
			case 'add':
				if (actionEntityRight?.user === null) {
					return `Un e-mail d’invitation a été envoyé à ${
						actionEntityRight?.user_email
							? actionEntityRight?.user_email
							: actionEntityRight?.user_email_invite
					}.`;
				} else {
					return `${actionEntityRight?.user?.firstName} ${actionEntityRight?.user?.lastName} a été ajouté comme administrateur.`;
				}
			case 'resend-email':
				return `Un e-mail d’invitation a été renvoyé à ${
					actionEntityRight?.user_email
						? actionEntityRight?.user_email
						: actionEntityRight?.user_email_invite
				}.`;
			case 'remove':
				return `${
					actionEntityRight?.user !== null
						? `${actionEntityRight?.user?.firstName} ${actionEntityRight?.user?.lastName}`
						: actionEntityRight.user_email_invite
				} a été retiré comme administrateur ou administratrice de cette organisation.`;
		}

		return '';
	};

	const displayRightsTable = () => {
		if (!adminEntityRights.length) {
			return (
				<Alert
					className={fr.cx('fr-mb-16v')}
					description={
						<>
							Pour devenir administrateur, envoyer un email à [adresse email de
							contact].
						</>
					}
					severity="info"
					title=""
				/>
			);
		}

		return (
			<>
				{actionType && (
					<Alert
						closable
						onClose={function noRefCheck() {
							setActionType(null);
						}}
						severity={actionType === 'remove' ? 'info' : 'success'}
						className={fr.cx('fr-mb-2w')}
						small
						description={getAlertTitle()}
					/>
				)}
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					<div className={fr.cx('fr-col-8')}>
						{nbPages > 1 && (
							<span className={fr.cx('fr-ml-0')}>
								Administrateurs de{' '}
								<span className={cx(classes.boldText)}>
									{numberPerPage * (currentPage - 1) + 1}
								</span>{' '}
								à{' '}
								<span className={cx(classes.boldText)}>
									{numberPerPage * (currentPage - 1) + adminEntityRights.length}
								</span>{' '}
								sur{' '}
								<span className={cx(classes.boldText)}>
									{adminEntityRightsCount}
								</span>
							</span>
						)}
					</div>
				</div>
				<div>
					{!entity || isLoading ? (
						<div className={fr.cx('fr-py-10v')}>
							<Loader />
						</div>
					) : (
						adminEntityRights.map((adminEntityRight, index) => (
							<EntityRightCard
								key={index}
								adminEntityRight={adminEntityRight}
								onButtonClick={handleActionsButtons}
								isMine={isMine}
							/>
						))
					)}
				</div>
				<form
					onSubmit={e => {
						e.preventDefault();
						handleAddUser();
					}}
				>
					<div className={classes.addSection}>
						<Input
							label="Adresse email"
							nativeInputProps={{
								onChange: e => {
									setAddError('');
									setUserAddEmail(e.target.value);
								},
								value: userAddEmail,
								name: 'email'
							}}
							state={addError ? 'error' : 'default'}
							stateRelatedMessage={addError}
						/>
						<Button
							priority="secondary"
							type="submit"
							disabled={!userAddEmail || !isValidEmail(userAddEmail)}
						>
							Inviter
						</Button>
					</div>
				</form>
			</>
		);
	};

	const isMine = adminEntityRights
		.map(aer => aer.user_email)
		.includes(session?.user?.email || 'none');

	const displayModalContent = () => {
		if (entity) {
			return (
				<div className={fr.cx('fr-mt-8v')}>
					{!isMine && (
						<p>
							Pour devenir administrateur, contacter l’une de ces personnes.
						</p>
					)}
					<h6 className={fr.cx('fr-mt-2v')}>{entity?.name}</h6>
					{displayRightsTable()}
				</div>
			);
		}
	};

	return (
		<modal.Component
			title={isMine ? 'Gérer les administrateurs' : 'Devenir administrateur'}
			concealingBackdrop={false}
			size="large"
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

const useStyles = tss
	.withName(EntityRightsModal.name)
	.withParams<{ addError: string }>()
	.create(({ addError }) => ({
		boldText: {
			fontWeight: 'bold'
		},
		addSection: {
			display: 'flex',
			alignItems: 'center',
			width: '100%',
			marginTop: fr.spacing('6v'),
			'& > div': {
				flexGrow: 1
			},
			'& > button': {
				marginLeft: fr.spacing('5v'),
				marginTop: fr.spacing('2v'),
				marginBottom: !!addError ? fr.spacing('9v') : ''
			}
		}
	}));

export default EntityRightsModal;
