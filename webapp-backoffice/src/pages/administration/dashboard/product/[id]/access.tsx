import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { tss } from 'tss-react/dsfr';
import AccessRightCard from '@/src/components/dashboard/AccessRight/AccessRightCard';
import AccessRightModal from '@/src/components/dashboard/AccessRight/AccessRightModal';
import React from 'react';
import { Product, AccessRight } from '@prisma/client';
import { AccessRightUserWithUsers } from '@/src/pages/api/prisma/accessRight/type';
import { Pagination } from '@/src/components/ui/Pagination';
import { getNbPages } from '@/src/utils/tools';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { trpc } from '@/src/utils/trpc';

interface Props {
	product: Product;
}

const modal = createModal({
	id: 'user-product-modal',
	isOpenedByDefault: false
});

const AccessManagement = (props: Props) => {
	const { cx, classes } = useStyles();

	const { product } = props;

	const [currentAccessRight, setCurrentAccessRight] =
		React.useState<AccessRightUserWithUsers>();
	const [modalType, setModalType] = React.useState<
		'add' | 'remove' | 'resend-email'
	>('add');

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, _] = React.useState(10);
	const [carriersRemovedFilter, setCarriersRemovedFilter] =
		React.useState(false);

	const [isModalSubmitted, setIsModalSubmitted] = React.useState(false);
	const isModalOpen = useIsModalOpen(modal);

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

	const handleModalOpening = async (
		modalType: 'add' | 'remove' | 'resend-email',
		accessRight?: AccessRightUserWithUsers
	) => {
		if (accessRight) {
			setCurrentAccessRight(accessRight);
		}

		setModalType(modalType);

		if (modalType == 'resend-email') {
			await fetch(
				`/api/prisma/accessRight/resend-email?user_email=${accessRight?.user_email_invite}&product_id=${product.id}`
			);
			setIsModalSubmitted(true);
			return;
		}

		setIsModalSubmitted(false);
		modal.open();
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
					return `${currentAccessRight?.user?.firstName} ${currentAccessRight?.user?.lastName} a été ajouté comme porteur.`;
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
				} a été retiré comme porteur ou porteuse de ce produit numérique.`;
		}
	};

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const nbPages = getNbPages(accessRightsCount, numberPerPage);

	return (
		<ProductLayout product={product}>
			<AccessRightModal
				modal={modal}
				isOpen={isModalOpen}
				modalType={modalType}
				productId={product.id}
				setIsModalSubmitted={setIsModalSubmitted}
				currentAccessRight={currentAccessRight}
				setCurrentAccessRight={setCurrentAccessRight}
			/>
			{isModalSubmitted && (
				<Alert
					closable
					onClose={function noRefCheck() {
						setIsModalSubmitted(false);
					}}
					severity={modalType === 'remove' ? 'info' : 'success'}
					className={fr.cx('fr-mb-5w')}
					small
					description={getAlertTitle()}
				/>
			)}
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col-8')}>
					<h2 className={fr.cx('fr-mb-2w')}>Gérer les droits d'accès</h2>
				</div>
				<div className={cx(fr.cx('fr-col-4'), classes.buttonRight)}>
					<Button
						priority="secondary"
						iconPosition="right"
						iconId="ri-user-add-line"
						onClick={() => handleModalOpening('add')}
					>
						Inviter un porteur
					</Button>
				</div>
			</div>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col-8')}>
					{nbPages > 1 && (
						<span className={fr.cx('fr-ml-0')}>
							Porteur de{' '}
							<span className={cx(classes.boldText)}>
								{numberPerPage * (currentPage - 1) + 1}
							</span>{' '}
							à{' '}
							<span className={cx(classes.boldText)}>
								{numberPerPage * (currentPage - 1) + accessRights.length}
							</span>{' '}
							de{' '}
							<span className={cx(classes.boldText)}>{accessRightsCount}</span>
						</span>
					)}
				</div>
				<div className={fr.cx('fr-col-4')}>
					<Checkbox
						className={fr.cx('fr-ml-auto')}
						style={{ userSelect: 'none' }}
						options={[
							{
								label: 'Afficher les porteur retirés',
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
				</div>
			</div>
			<div>
				{accessRights?.map((accessRight, index) => (
					<AccessRightCard
						key={index}
						accessRight={accessRight}
						onButtonClick={handleModalOpening}
					/>
				))}
			</div>
			<div className={fr.cx('fr-grid-row--center', 'fr-grid-row', 'fr-mb-15w')}>
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
	);
};

export default AccessManagement;

const useStyles = tss.create({
	boldText: {
		fontWeight: 'bold'
	},
	buttonRight: {
		textAlign: 'right'
	}
});

export { getServerSideProps };
