import { AdminEntityRightWithUsers } from '@/src/types/prismaTypesExtended';
import { getNbPages, isValidEmail } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { Entity } from '@prisma/client';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { Loader } from '../../ui/Loader';
import EntityRightCard from './EntityRightCard';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { push } from '@socialgouv/matomo-next';
import { CustomModalProps } from '@/src/types/custom';
import { PageItemsCounter } from '../../ui/Pagination';

export type AdminEntityRightActionType = 'add' | 'remove' | 'resend-email';

interface Props {
	modal: CustomModalProps;
	refetchEntities: () => void;
	entity?: Entity;
	onClose: () => void;
	fromSearch?: boolean;
}

const EntityRightsModal = (props: Props) => {
	const { modal, entity, fromSearch, refetchEntities, onClose } = props;

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

	useIsModalOpen(modal, {
		onConceal: () => {
			setActionType(null);
		}
	});

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
					setAdminEntityRightsCount(
						adminEntityRightsResult.data.filter(aer => aer.user !== null).length
					);
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

	const handleAddUser = () => {
		addAdminEntityRight.mutate({
			user_email: userAddEmail,
			entity_id: entity?.id || -1,
			entity_name: entity?.name || ''
		});
		push(['trackEvent', 'BO - Entities', `Invite-Admin`]);
	};

	const handleActionsButtons = (
		actionType: AdminEntityRightActionType,
		adminEntityRight: AdminEntityRightWithUsers
	) => {
		setActionType(actionType);
		setActionEntityRight(adminEntityRight);

		if (actionType === 'remove') {
			removeAdminEntityRight.mutate({
				admin_entity_right_id: adminEntityRight.id,
				entity_name: entity?.name || '',
				user_email: adminEntityRight.user_email || ''
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
				onClick: () => {
					setActionType(null);
					onClose();
				}
			}
		];
	};

	const getAlertTitle = () => {
		switch (actionType) {
			case 'add':
				if (actionEntityRight?.user === null) {
					return `Une invitation a été envoyée à ${
						actionEntityRight?.user_email
							? actionEntityRight?.user_email
							: actionEntityRight?.user_email_invite
					}.`;
				} else {
					return `${actionEntityRight?.user?.firstName} ${actionEntityRight?.user?.lastName} est administrateur.`;
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
				} n'a plus accès.`;
		}

		return '';
	};

	const displayRightsTable = () => {
		if (
			!adminEntityRights.filter(aer => aer.user !== null).length &&
			!session?.user.role.includes('admin')
		) {
			return (
				<div role="status">
					<Alert
						className={fr.cx('fr-mb-16v')}
						description={
							<>
								Pour devenir administrateur, envoyer un email à
								contact.jdma@design.numerique.gouv.fr
							</>
						}
						severity="info"
						title=""
					/>
				</div>
			);
		}

		return (
			<>
				{actionType && (
					<div role="status">
						<Alert
							closable
							onClose={function noRefCheck() {
								setActionType(null);
							}}
							severity={'success'}
							className={fr.cx('fr-mb-2w')}
							small
							description={getAlertTitle()}
						/>
					</div>
				)}
				{adminEntityRightsCount !== 0 && (
					<div
						className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-pb-2w')}
					>
						<div className={fr.cx('fr-col-8')}>
							<PageItemsCounter
								label="Administrateurs"
								startItemCount={numberPerPage * (currentPage - 1) + 1}
								endItemCount={
									numberPerPage * (currentPage - 1) +
									adminEntityRights.filter(aer => aer.user !== null).length
								}
								totalItemsCount={adminEntityRightsCount}
							/>
						</div>
					</div>
				)}
				<div>
					{!entity || isLoading ? (
						<div className={fr.cx('fr-py-10v')}>
							<Loader />
						</div>
					) : (
						<>
							<ul className={cx(classes.entitySection)}>
								{adminEntityRights.map((adminEntityRight, index) => {
									if (adminEntityRight.user !== null) {
										return (
											<EntityRightCard
												key={index}
												adminEntityRight={adminEntityRight}
												onButtonClick={handleActionsButtons}
												withOptions={isMine}
											/>
										);
									}
								})}
							</ul>
							<div>
								{adminEntityRights.some(
									adminEntityRight => adminEntityRight.user === null
								) && (
									<>
										<div className={cx(classes.inviteTitle)}>
											Invitations envoyées
										</div>
										<ul className={classes.entityList}>
											{adminEntityRights
												.filter(
													adminEntityRight => adminEntityRight.user === null
												)
												.map((adminEntityRight, index) => (
													<EntityRightCard
														key={index}
														adminEntityRight={adminEntityRight}
														onButtonClick={handleActionsButtons}
														withOptions={isMine}
													/>
												))}
										</ul>
									</>
								)}
							</div>
						</>
					)}
				</div>
				{isMine && (
					<form
						onSubmit={e => {
							e.preventDefault();
							handleAddUser();
						}}
					>
						<div className={classes.addSection}>
							<Input
								label="Envoyez une invitation par e-mail"
								hintText="Exemple : prenomnom@email.com"
								className={classes.emailInput}
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
				)}
			</>
		);
	};

	const isMine =
		session?.user.role.includes('admin') ||
		adminEntityRights
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

	useEffect(() => {
		setUserAddEmail('');
		setActionType(null);
	}, [entity]);

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
			buttons={fromSearch ? displayModalButtons() : undefined}
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
		emailInput: {
			marginBottom: '0 !important'
		},
		addSection: {
			display: 'flex',
			alignItems: 'flex-end',
			width: '100%',
			marginTop: fr.spacing('6v'),
			'& > div': {
				flexGrow: 1
			},
			'& > button': {
				marginLeft: fr.spacing('5v'),
				marginBottom: !!addError ? fr.spacing('9v') : ''
			}
		},
		entitySection: {
			marginBottom: '0.75rem',
			paddingInlineStart: 0
		},
		inviteTitle: {
			fontWeight: 'bold',
			padding: '5px 0'
		},
		entityList: {
			paddingInlineStart: 0
		}
	}));

export default EntityRightsModal;
