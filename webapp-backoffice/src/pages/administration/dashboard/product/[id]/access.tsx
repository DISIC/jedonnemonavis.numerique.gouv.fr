import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { tss } from 'tss-react/dsfr';
import AccessRightCard from '@/src/components/dashboard/AccessRight/AccessRightCard';
import AccessRightModal from '@/src/components/dashboard/AccessRight/AccessRightModal';
import React from 'react';
import { Product, AccessRight } from '@prisma/client';
import {
	AccessRightWithUsers,
	AdminEntityRightWithUsers
} from '@/src/types/prismaTypesExtended';
import { Pagination } from '@/src/components/ui/Pagination';
import { getNbPages } from '@/src/utils/tools';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { trpc } from '@/src/utils/trpc';
import { Loader } from '@/src/components/ui/Loader';
import Head from 'next/head';
import { useRouter } from 'next/router';
import EntityRightCard from '@/src/components/dashboard/Entity/EntityRightCard';
import { useSession } from 'next-auth/react';

interface Props {
	product: Product;
}

export type AccessRightModalType =
	| 'add'
	| 'remove'
	| 'resend-email'
	| 'reintegrate';

const modal = createModal({
	id: 'user-product-modal',
	isOpenedByDefault: false
});

const AccessManagement = (props: Props) => {
	const { cx, classes } = useStyles();

	const { product } = props;

	const [currentAccessRight, setCurrentAccessRight] =
		React.useState<AccessRightWithUsers>();

	const [modalType, setModalType] = React.useState<AccessRightModalType>('add');

	const router = useRouter();
	const [isMounted, setIsMounted] = React.useState(false);

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, _] = React.useState(10);
	const [carriersRemovedFilter, setCarriersRemovedFilter] =
		React.useState(false);

	const [isModalSubmitted, setIsModalSubmitted] = React.useState(false);
	const isModalOpen = useIsModalOpen(modal);
	const { data: session } = useSession();

	const { data: accessRightsResult, isLoading: isLoadingAccessRights } =
		trpc.accessRight.getList.useQuery(
			{
				product_id: product.id,
				numberPerPage,
				page: currentPage,
				isRemoved: carriersRemovedFilter
			},
			{
				initialData: {
					data: [],
					metadata: {
						count: 0
					}
				}
			}
		);

	const {
		data: accessRights,
		metadata: { count: accessRightsCount }
	} = accessRightsResult;

	const { data: accessAdminEntityRightsResult } =
		trpc.adminEntityRight.getList.useQuery(
			{
				page: currentPage,
				numberPerPage,
				entity_id: product?.entity_id || -1
			},
			{
				initialData: {
					data: [],
					metadata: {
						count: 0
					}
				}
			}
		);

	const { data: accessAdminEntityRights } = accessAdminEntityRightsResult;

	const { data: entityResult } = trpc.entity.getById.useQuery(
		{
			id: product.entity_id
		},
		{
			initialData: {
				data: null
			},
			enabled: product.entity_id !== null
		}
	);

	const { data: entity } = entityResult;

	const resendEmailAccessRight = trpc.accessRight.resendEmail.useMutation({
		onSuccess: () => setIsModalSubmitted(true)
	});

	const handleModalOpening = async (
		modalType: AccessRightModalType,
		accessRight?: AccessRightWithUsers
	) => {
		if (accessRight) setCurrentAccessRight(accessRight);

		setModalType(modalType);

		if (modalType == 'resend-email') {
			resendEmailAccessRight.mutate({
				product_id: product.id,
				user_email: accessRight?.user_email_invite as string
			});
			return;
		}

		setIsModalSubmitted(false);
		if (isMounted) modal.open();
	};

	const getAlertTitle = () => {
		switch (modalType) {
			case 'add':
				if (currentAccessRight?.user === null) {
					return `Un e-mail d’invitation a été envoyé à ${
						currentAccessRight?.user_email
							? currentAccessRight?.user_email
							: currentAccessRight?.user_email_invite
					}.`;
				} else {
					return `${currentAccessRight?.user?.firstName} ${currentAccessRight?.user?.lastName} fait partie de ${product.title}.`;
				}
			case 'resend-email':
				return `Un e-mail d’invitation a été renvoyé à ${
					currentAccessRight?.user_email
						? currentAccessRight?.user_email
						: currentAccessRight?.user_email_invite
				}.`;
			case 'remove':
				return `${
					currentAccessRight?.user !== null
						? `${currentAccessRight?.user?.firstName} ${currentAccessRight?.user?.lastName}`
						: currentAccessRight.user_email_invite
				} ne fait plus partie de ${product.title}.`;
			case 'reintegrate':
				return `${
					currentAccessRight?.user !== null
						? `${currentAccessRight?.user?.firstName} ${currentAccessRight?.user?.lastName}`
						: currentAccessRight.user_email_invite
				} a été réintégré comme administrateur de ce produit numérique.`;
		}
	};

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const nbPages = getNbPages(accessRightsCount, numberPerPage);

	React.useEffect(() => {
		setIsMounted(true);
		if (router.query.autoInvite === 'true') {
			handleModalOpening('add');
		}
	}, [router.query, isMounted]);

	return (
		<>
			<div className={cx(fr.cx('fr-container'), classes.alertContainer)}>
				{isModalSubmitted && (
					<Alert
						closable
						onClose={function noRefCheck() {
							setIsModalSubmitted(false);
						}}
						severity={'success'}
						className={fr.cx('fr-mb-5w')}
						small
						description={getAlertTitle()}
					/>
				)}
			</div>

			<ProductLayout product={product}>
				<Head>
					<title>{product.title} | Gérer l'accès | Je donne mon avis</title>
					<meta
						name="description"
						content={`${product.title} | Gérer l'accès | Je donne mon avis`}
					/>
				</Head>
				<AccessRightModal
					modal={modal}
					isOpen={isModalOpen}
					modalType={modalType}
					productId={product.id}
					productName={product.title}
					setIsModalSubmitted={setIsModalSubmitted}
					currentAccessRight={currentAccessRight}
					setCurrentAccessRight={setCurrentAccessRight}
				/>

				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					<div className={fr.cx('fr-col-8')}>
						<h2 className={fr.cx('fr-mb-2w')}>Gérer l'accès</h2>
					</div>
					<div className={cx(fr.cx('fr-col-4'), classes.alignRight)}>
						<Button
							priority="secondary"
							iconPosition="right"
							iconId="ri-user-add-line"
							onClick={() => handleModalOpening('add')}
						>
							Inviter des administrateurs
						</Button>
					</div>
				</div>
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					<div className={fr.cx('fr-col-8')}>
						{nbPages > 1 && (
							<span className={fr.cx('fr-ml-0')}>
								Admin de{' '}
								<span className={cx(classes.boldText)}>
									{numberPerPage * (currentPage - 1) + 1}
								</span>{' '}
								à{' '}
								<span className={cx(classes.boldText)}>
									{numberPerPage * (currentPage - 1) + accessRights.length}
								</span>{' '}
								sur{' '}
								<span className={cx(classes.boldText)}>
									{accessRightsCount}
								</span>
							</span>
						)}
					</div>
					{/* <div className={cx(fr.cx('fr-col-4'), classes.alignRight)}>
					<Checkbox
						className={cx(fr.cx('fr-ml-auto'), classes.checkbox)}
						style={{ userSelect: 'none' }}
						options={[
							{
								label: 'Afficher les admins retirés',
								nativeInputProps: {
									name: 'carriers-removed',
									onChange: () => {
										setCarriersRemovedFilter(!carriersRemovedFilter);
										setCurrentPage(1);
									}
								}
							}
						]}
					/>
				</div> */}
				</div>
				{isLoadingAccessRights ? (
					<div className={fr.cx('fr-py-10v')}>
						<Loader />
					</div>
				) : (
					<div>
						<h2 className={cx(classes.categoryTitle)}>
							Administrateurs du service
						</h2>
						<div>
							{accessRights.map((accessRight, index) => {
								if (
									accessRight.status === 'carrier' &&
									accessRight.user !== null
								) {
									return (
										<AccessRightCard
											key={index}
											accessRight={accessRight}
											onButtonClick={handleModalOpening}
										/>
									);
								}
							})}
						</div>
						{accessRights.some(accessRight => accessRight.user === null) && (
							<>
								<div className={cx(classes.inviteTitle)}>
									Invitations envoyées
								</div>
								<div>
									{accessRights.map((accessRight, index) => {
										if (accessRight.user === null) {
											return (
												<AccessRightCard
													key={index}
													accessRight={accessRight}
													onButtonClick={handleModalOpening}
												/>
											);
										}
									})}
								</div>
							</>
						)}
						{accessAdminEntityRights.length > 0 && (
							<>
								<div className={cx(classes.entityWrapper)}>
									<h2 className={cx(classes.organizationTitle)}>
										Administrateurs de l'organisation
									</h2>
									<div className={cx(classes.entityName)}>{entity?.name}</div>
								</div>
								<div>
									{accessAdminEntityRights.map(
										(accessAdminEntityRight, index) => {
											return (
												<EntityRightCard
													key={index}
													adminEntityRight={accessAdminEntityRight}
												/>
											);
										}
									)}
								</div>
							</>
						)}
					</div>
				)}

				<div
					className={fr.cx('fr-grid-row--center', 'fr-grid-row', 'fr-mb-15w')}
				>
					{nbPages > 1 && (
						<Pagination
							showFirstLast
							count={nbPages}
							defaultPage={currentPage}
							getPageLinkProps={pageNumber => ({
								onClick: event => {
									event.preventDefault();
									handlePageChange(pageNumber);
								},
								href: '#',
								classes: { link: fr.cx('fr-pagination__link') },
								key: `pagination - link - access - right - ${pageNumber}`
							})}
							className={fr.cx('fr-mt-1w')}
						/>
					)}
				</div>
			</ProductLayout>
		</>
	);
};

export default AccessManagement;

const useStyles = tss.create({
	boldText: {
		fontWeight: 'bold'
	},
	alignRight: {
		textAlign: 'right'
	},
	checkbox: {
		'.fr-checkbox-group': {
			display: 'flex',
			justifyContent: 'end'
		}
	},
	categoryTitle: {
		...fr.typography[20].style,
		fontWeight: 'bold',
		paddingBottom: '10px',
		borderBottom: '1px solid black'
	},
	inviteTitle: {
		fontWeight: 'bold',
		padding: '5px 0'
	},
	organizationTitle: {
		...fr.typography[20].style,
		marginBottom: 0,
		fontWeight: 'bold'
	},
	alertContainer: {
		marginTop: '1.5rem'
	},
	entityWrapper: {
		display: 'flex',
		gap: 10,
		width: '100%',
		alignItems: 'center',
		borderBottom: '1px solid black',
		paddingBottom: '10px',
		paddingTop: '3rem'
	},
	entityName: {
		...fr.typography[18].style,
		marginBottom: 0,
		color: '#666666',
		paddingLeft: '1rem'
	}
});

export { getServerSideProps };
