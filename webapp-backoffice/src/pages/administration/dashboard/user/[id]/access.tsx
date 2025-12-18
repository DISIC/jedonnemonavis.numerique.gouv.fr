import {
	AccessRightSchema,
	AccessRightWithRelations,
	AdminEntityRightWithRelations,
	User
} from '@/prisma/generated/zod';
import AccessCard from '@/src/components/dashboard/Account/Informations/accessCard';
import OnConfirmModal from '@/src/components/ui/modal/OnConfirm';
import AccountLayout from '@/src/layouts/Account/AccountLayout';
import { formatDateToFrenchString } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { RightAccessStatus, UserRole } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { getServerSideProps } from '.';

interface Props {
	isOwn: Boolean;
	userId: number;
	user: User & {
		accessRights: AccessRightWithRelations[];
		adminEntityRights: AdminEntityRightWithRelations[];
	};
}

interface Product {
	id?: number;
	title: string;
	date: string;
	modifiable: boolean;
	link: string;
	right?: RightAccessStatus;
	action?: (message: string) => Promise<void>;
}

interface GroupedEntity {
	name: string;
	products: Product[];
}

const onConfirmModal = createModal({
	id: 'user-switch-role-modal',
	isOpenedByDefault: false
});

export const modalAccessContents = [
	{
		kind: 'removeAccessRight',
		title: "Retirer l'accès au service",
		sentence:
			"Êtes-vous sûr de vouloir retirer __!NAME!__ de ce service ? Cette personne n'aura plus aucun accès au service.",
		message: "L'accès au service a bien été retiré pour __!NAME!__."
	},
	{
		kind: 'switchAccessRightAdmin',
		title: 'Passer en administrateur de service',
		sentence:
			'Êtes-vous sûr de vouloir passer __!NAME!__ en administrateur du service ? Cette personne pourra modifier et supprimer le service.',
		message: ''
	},
	{
		kind: 'switchAccessRightUser',
		title: 'Passer en utilisateur de service',
		sentence:
			'Êtes-vous sûr de vouloir passer __!NAME!__ en utilisateur du service ? Cette personne ne pourra plus modifier le service.',
		message: ''
	},
	{
		kind: 'removeEntityright',
		title: "Retirer l'accès à l'organisation",
		sentence:
			"Êtes-vous sûr de vouloir retirer __!NAME!__ de cette organisation ? Cette personne n'aura plus aucun accès à cette orgnisation ou aux services associés.",
		message: ''
	},
	{
		kind: 'addSuperAdmin',
		title: 'Passer en rôle superadmin',
		sentence:
			'Êtes-vous sûr de vouloir passer __!NAME!__ en tant que superadmin ? Cette personne pourra modifier et supprimer tous les services, toutes les organisations et tous les utilisateurs.',
		message: ''
	},
	{
		kind: 'removeSuperAdmin',
		title: 'Retirer le rôle superadmin',
		sentence:
			"Êtes-vous sûr de vouloir retirer l'accès de __!NAME!__ en tant que superadmin ? Cette personne pourra plus ni modifier ni supprimer les services, les organisations et les utilisateurs.",
		message: ''
	}
];

export type ModalAccessKind = (typeof modalAccessContents)[number]['kind'];
export type ModalAccessContent = (typeof modalAccessContents)[number];

const UserAccess: React.FC<Props> = props => {
	const { isOwn, userId, user } = props;
	const { classes, cx } = useStyles();
	const utils = trpc.useUtils();
	const lastModalTriggerRef = React.useRef<HTMLElement | null>(null);
	const restoreFocusToTrigger = React.useCallback(() => {
		const trigger = lastModalTriggerRef.current;
		if (!trigger) return;
		if (typeof document === 'undefined') return;
		if (!document.contains(trigger)) return;
		requestAnimationFrame(() => {
			trigger.focus();
		});
	}, []);

	const [displayToast, setDisplayToast] = React.useState<string | null>(null);
	const [modal, setModal] = React.useState<ModalAccessContent | null>(null);
	const [idConcerned, setIdConcerned] = React.useState<number | null>(null);
	const router = useRouter();

	useIsModalOpen(onConfirmModal, {
		onConceal: () => {
			restoreFocusToTrigger();
		}
	});

	const editUser = trpc.user.update.useMutation({
		onSuccess: async () => {
			utils.user.getByIdWithRights.invalidate({});
		}
	});

	const updateAccessRight = trpc.accessRight.update.useMutation({
		onSuccess: () => {
			utils.user.getByIdWithRights.invalidate({});
		}
	});

	const removeAdminEntityright = trpc.adminEntityRight.delete.useMutation({
		onSuccess: async () => {
			utils.user.getByIdWithRights.invalidate({});
		}
	});

	const removeAccessRight = trpc.accessRight.delete.useMutation({
		onSuccess: async () => {
			utils.user.getByIdWithRights.invalidate({});
		}
	});

	const handleAction = async (kind: ModalAccessKind, id?: number) => {
		lastModalTriggerRef.current =
			typeof document !== 'undefined' &&
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;
		const modalContent = modalAccessContents.find(item => item.kind === kind);
		if (modalContent) setModal({ ...modalContent });
		setIdConcerned(id ?? null);
		onConfirmModal.open();
	};

	const handleSwitchStatus = async (id: number) => {
		const ar = user?.accessRights.find(ar => ar.id === id);
		let parsedAr = AccessRightSchema.parse(ar);
		if (ar) {
			updateAccessRight.mutate({
				...parsedAr,
				status: ar.status.includes('admin') ? 'carrier_user' : 'carrier_admin'
			});
			setDisplayToast(
				`L'utilisateur ${user?.firstName} ${user?.lastName} a été passé ${
					ar.status.includes('admin') ? 'utilisateur' : 'administrateur'
				} du service "${user?.accessRights.find(aer => aer.id === id)?.product
					.title}".`
			);
		}
	};

	const handleSwitchrole = async () => {
		if (user) {
			setDisplayToast(
				`L'accès au rôle superadmin a bien été ${
					user.role.includes('admin') ? 'retiré' : 'accordé'
				} pour le compte ${user.firstName} ${user.lastName}.`
			);
			editUser.mutate({
				id: user?.id,
				user: {
					role: user.role.includes('admin') ? 'user' : ('admin' as UserRole)
				}
			});
		}
	};

	const handleRemove = async (id: number, type: 'entity' | 'product') => {
		if (type === 'entity') {
			removeAdminEntityright.mutate({
				admin_entity_right_id: id
			});
			setDisplayToast(
				`L'accès à l'organisation "${user?.adminEntityRights.find(
					aer => aer.id === id
				)?.entity
					.name}" a bien été supprimé pour le compte ${user?.firstName} ${user?.lastName}.`
			);
		} else {
			removeAccessRight.mutate({
				access_right_id: id
			});
			setDisplayToast(
				`L'accès au service "${user?.accessRights.find(aer => aer.id === id)
					?.product
					.title}" a bien été supprimé pour le compte ${user?.firstName} ${user?.lastName}.`
			);
		}
	};

	const groupedEntities: Record<string, GroupedEntity> = {};

	user?.adminEntityRights.forEach(aer => {
		const { entity } = aer;
		if (!groupedEntities[entity.name]) {
			groupedEntities[entity.name] = { name: entity.name, products: [] };
		}
		groupedEntities[entity.name].products.push(
			...entity.products.map(p => ({
				title: p.title,
				date: formatDateToFrenchString(aer.created_at.toString()),
				modifiable: false,
				link: `/administration/dashboard/product/${p.id}/forms`
			}))
		);
	});

	user?.accessRights.forEach(ar => {
		const { product } = ar;
		const { entity } = product;
		if (!groupedEntities[entity.name]) {
			groupedEntities[entity.name] = { name: entity.name, products: [] };
		}
		groupedEntities[entity.name].products.push({
			id: ar.id,
			title: product.title,
			date: formatDateToFrenchString(ar.created_at.toString()),
			modifiable: true,
			link: `/administration/dashboard/product/${product.id}/forms`,
			right: ar.status,
			action: async (message: string) => {
				setDisplayToast(message);
				handleRemove(ar.id, 'product');
			}
		});
	});

	const sortedEntities = Object.values(groupedEntities)
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(entity => ({
			...entity,
			products: entity.products.sort((p1, p2) =>
				p1.title.localeCompare(p2.title)
			)
		}));

	return (
		<>
			<OnConfirmModal
				modal={onConfirmModal}
				title={`${modal?.title}`}
				handleOnConfirm={() => {
					switch (modal?.kind) {
						case 'addSuperAdmin':
						case 'removeSuperAdmin':
							handleSwitchrole();
							break;
						case 'removeAccessRight':
							if (idConcerned) handleRemove(idConcerned, 'product');
							break;
						case 'removeEntityright':
							if (idConcerned) handleRemove(idConcerned, 'entity');
							break;
						case 'switchAccessRightAdmin':
						case 'switchAccessRightUser':
							if (idConcerned) handleSwitchStatus(idConcerned);
							break;
					}
					onConfirmModal.close();
					router.replace(router.asPath);
				}}
			>
				<>
					<p className={fr.cx('fr-mt-8v')}>{`${modal?.sentence.replace(
						'__!NAME!__',
						`${user.firstName} ${user.lastName}`
					)}`}</p>
				</>
			</OnConfirmModal>
			<AccountLayout isOwn={isOwn} user={user}>
				<Head>
					<title>
						{`${user.firstName} ${user.lastName}`} | Compte Accès services et
						organisations | Je donne mon avis
					</title>
					<meta
						name="description"
						content={`${user.firstName} ${user.lastName} | Compte Accès services et organisations | Je donne mon avis`}
					/>
				</Head>
				{displayToast && (
					<div className={cx(fr.cx('fr-mt-4v'))} role="status">
						<Alert
							closable
							onClose={function noRefCheck() {
								setDisplayToast(null);
							}}
							severity={'success'}
							className={fr.cx('fr-mb-5w')}
							small
							description={displayToast}
						/>
					</div>
				)}
				<div className={classes.column}>
					<div
						className={cx(
							fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--middle'
							)
						)}
					>
						<div className={cx(fr.cx('fr-col-12', 'fr-col-md-6'))}>
							<h2 className={fr.cx('fr-mb-0')}>Accès</h2>
						</div>
						<div
							className={cx(
								fr.cx('fr-col-12', 'fr-col-md-6'),
								classes.actionWrapper
							)}
						>
							{!user.role.includes('admin') && (
								<Button
									priority="secondary"
									type="button"
									iconId="fr-icon-user-star-line"
									iconPosition="right"
									onClick={() => {
										handleAction('addSuperAdmin');
										push(['trackEvent', 'Users', 'Set-Superadmin']);
									}}
									nativeButtonProps={{
										'aria-label': 'Attribuer le rôle superadmin',
										title: 'Attribuer le rôle superadmin'
									}}
								>
									Passer en superadmin
								</Button>
							)}
						</div>
					</div>
					{user.role.includes('admin') ? (
						<div>
							<h3>Superadmin</h3>
							<p>
								{`${user.firstName} ${user.lastName}`} est superadmin. Cette
								personne a accès à toutes les organisations et tous les
								services, et peut passer les utilisateurs en superadmin.
							</p>
							<Button
								priority="secondary"
								type="button"
								onClick={() => {
									handleAction('removeSuperAdmin');
									push(['trackEvent', 'Users', 'Unset-Superadmin']);
								}}
								nativeButtonProps={{
									'aria-label': 'Retirer le rôle superadmin',
									title: 'Retirer le rôle superadmin'
								}}
							>
								Retirer le rôle superadmin à ce compte
							</Button>
						</div>
					) : (
						<div
							className={cx(
								fr.cx(
									'fr-grid-row',
									'fr-grid-row--gutters',
									'fr-grid-row--middle'
								)
							)}
						>
							<div className={fr.cx('fr-col-12', 'fr-mt-8v', 'fr-mb-4v')}>
								<h3>Organisations</h3>
								<p>{`${user.firstName} ${user.lastName} ${
									user.adminEntityRights.length > 0
										? 'est administrateur des organisations suivantes : '
										: "n'est administrateur d'aucune organisation pour le moment."
								}`}</p>
								<ul className={cx(classes.ulContainer)}>
									{user.adminEntityRights
										.sort((a, b) => a.entity.name.localeCompare(b.entity.name))
										.map(aer => (
											<li key={aer.id}>
												<AccessCard
													id={aer.id}
													title={aer.entity.name}
													date={formatDateToFrenchString(
														aer.created_at.toString()
													)}
													modifiable={true}
													action={async (message: string) => {
														setDisplayToast(message);
														handleRemove(aer.id, 'entity');
													}}
													handleAction={handleAction}
												></AccessCard>
											</li>
										))}
								</ul>
							</div>
							<div className={fr.cx('fr-col-12')}>
								<h3>Services</h3>
								<p>{`${user.firstName} ${user.lastName} ${
									sortedEntities.length > 0
										? 'est administrateur des services suivants : '
										: "n'est administrateur d'aucun service pour le moment."
								}`}</p>
								<ul className={cx(classes.ulContainer)}>
									{sortedEntities.map((entity, index) => (
										<li key={entity.name} className={fr.cx('fr-mb-12v')}>
											<React.Fragment key={index}>
												<h5>{entity.name}</h5>
												<hr />
												<ul className={cx(classes.ulContainer)}>
													{entity.products.map((product, productIndex) => (
														<li key={product.title + '_' + product.modifiable}>
															<AccessCard
																key={productIndex}
																id={product.id}
																title={product.title}
																date={product.date}
																modifiable={product.modifiable}
																right={product.right}
																action={product.action}
																handleAction={handleAction}
																link={product.link}
															></AccessCard>
														</li>
													))}
												</ul>
											</React.Fragment>
										</li>
									))}
								</ul>
							</div>
						</div>
					)}
				</div>
			</AccountLayout>
		</>
	);
};

const useStyles = tss.withName(UserAccess.name).create({
	actionWrapper: {
		display: 'flex',
		justifyContent: 'flex-end',
		[fr.breakpoints.down('md')]: {
			justifyContent: 'flex-start'
		}
	},
	column: {
		display: 'flex',
		flexDirection: 'column'
	},
	droppableArea: {
		padding: '8px',
		backgroundColor: '#f4f4f4',
		minHeight: '200px'
	},
	ulContainer: {
		padding: 0,
		margin: 0,
		listStyle: 'none !important',
		li: {
			paddingBottom: 0
		}
	},
	urlsWrapper: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: fr.spacing('4v')
	}
});

export default UserAccess;

export { getServerSideProps };
