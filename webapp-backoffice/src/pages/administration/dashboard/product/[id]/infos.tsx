import React from 'react';
import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { Product } from '@prisma/client';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { trpc } from '@/src/utils/trpc';
import Tag from '@codegouvfr/react-dsfr/Tag';
import ProductModal from '@/src/components/dashboard/Product/ProductModal';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useRouter } from 'next/router';
import { Toast } from '@/src/components/ui/Toast';
import Link from 'next/link';
import Head from 'next/head';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import OnConfirmModal from '@/src/components/ui/modal/OnConfirm';
import { push } from '@socialgouv/matomo-next';
import EntityModal from '@/src/components/dashboard/Entity/EntityModal';
import { Entity } from '@/prisma/generated/zod';
import Alert from '@codegouvfr/react-dsfr/Alert';

interface Props {
	product: Product;
	ownRight: 'admin' | 'viewer';
}

const editProductModal = createModal({
	id: 'edit-product-modal',
	isOpenedByDefault: false
});

const onConfirmModal = createModal({
	id: 'archive-on-confirm-modal',
	isOpenedByDefault: false
});

const entityModal = createModal({
	id: 'entity-modal',
	isOpenedByDefault: false
});

const ProductInformationPage = (props: Props) => {
	const { product, ownRight } = props;

	const router = useRouter();

	const [displayToast, setDisplayToast] = React.useState(false);

	const [statusProductState, setStatusProductState] = React.useState<{
		msg: string;
		role: 'status' | 'alert';
	} | null>(null);

	const [entityCreated, setEntityCreated] = React.useState<
		Entity | undefined
	>();
	const [productTitle, setProductTitle] = React.useState<string>('');

	const { data: entityResult, isLoading: isLoadingEntity } =
		trpc.entity.getById.useQuery(
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

	const archiveProduct = trpc.product.archive.useMutation({
		onSuccess: () => {
			router.push('/dashboard/products');
		}
	});

	const { cx, classes } = useStyles();

	const handleSubmit = async (newEntity?: Entity) => {
		setEntityCreated(newEntity);
		editProductModal.open();
	};

	return (
		<ProductLayout product={product} ownRight={ownRight}>
			<Head>
				<title>{product.title} | Informations | Je donne mon avis</title>
				<meta
					name="description"
					content={`${product.title} | Informations | Je donne mon avis`}
				/>
			</Head>
			<OnConfirmModal
				modal={onConfirmModal}
				title="Supprimer ce service"
				handleOnConfirm={() => {
					archiveProduct.mutate({
						product_id: product.id
					});
					onConfirmModal.close();
				}}
				kind="danger"
			>
				<div>
					<p>
						Vous êtes sûr de vouloir supprimer le service{' '}
						<b>"{product.title}"</b> ?{' '}
					</p>
					<p>En supprimant ce service :</p>
					<ul className={fr.cx('fr-mb-8v')}>
						<li>vous n’aurez plus accès aux avis du formulaire,</li>
						<li>
							les utilisateurs de ce service n’auront plus accès au formulaire.
						</li>
					</ul>
				</div>
			</OnConfirmModal>
			<Toast
				isOpen={displayToast}
				setIsOpen={setDisplayToast}
				autoHideDuration={2000}
				severity="info"
				message="Identifiant copié dans le presse papier !"
			/>
			<ProductModal
				modal={editProductModal}
				product={product}
				onSubmit={() => router.replace(router.asPath)}
				allowCreateEntity={true}
				onNewEntity={() => {
					editProductModal.close();
					entityModal.open();
				}}
				newCreatedEntity={entityCreated}
			/>
			<EntityModal
				modal={entityModal}
				onSubmit={newEntity => handleSubmit(newEntity)}
			/>

			{statusProductState && (
				<div className={cx(classes.container)}>
					<Alert
						closable
						onClose={function noRefCheck() {
							setStatusProductState(null);
						}}
						severity={
							statusProductState.role === 'alert' ? 'warning' : 'success'
						}
						className={fr.cx('fr-mb-5w')}
						small
						description={
							<>
								<p role={statusProductState.role}>{statusProductState.msg}</p>
							</>
						}
					/>
				</div>
			)}
			<div className={classes.column}>
				<div className={classes.headerWrapper}>
					<h1>Informations</h1>
					{ownRight === 'admin' && (
						<Button
							priority="secondary"
							iconId="fr-icon-edit-line"
							iconPosition="right"
							nativeButtonProps={editProductModal.buttonProps}
						>
							Modifier
						</Button>
					)}
				</div>
				<div>
					<h4 className={fr.cx('fr-mb-3v')}>Identifiant</h4>
					<Tag id="product-id" small>
						{`# ${product.id}`}
					</Tag>
					<Button
						priority="tertiary"
						type="button"
						className={classes.copyBtn}
						nativeButtonProps={{
							title: `Copier l’identifiant du service « ${product.id} » dans le presse-papier`,
							'aria-label': `Copier l’identifiant du service « ${product.id} » dans le presse-papier`,
							onClick: () => {
								navigator.clipboard.writeText(product.id.toString());
								setDisplayToast(true);
							}
						}}
					>
						Copier dans le presse-papier
					</Button>
				</div>
				<div>
					<h4 className={fr.cx('fr-mb-3v')}>Organisation</h4>
					{!isLoadingEntity && (
						<Tag>
							{entity?.name} ({entity?.acronym})
						</Tag>
					)}
				</div>
				<div>
					<h4 className={fr.cx('fr-mb-3v')}>URLs</h4>
					<div className={classes.urlsWrapper}>
						{product.urls.map(url => (
							<Tag key={url} linkProps={{ href: url }}>
								{url}
							</Tag>
						))}
					</div>
				</div>
				<div>
					<h4 className={fr.cx('fr-mb-3v')}>Données statistiques publiques</h4>
					{product.isPublic ? 'Oui' : 'Non'}
					{product.isPublic && (
						<div className={fr.cx('fr-mt-1v')}>
							<Link
								className={fr.cx('fr-link', 'fr-text--sm')}
								href={`/public/product/${product.id}/stats`}
								target="_blank"
							>
								Voir la page publique
							</Link>
						</div>
					)}
				</div>
				{ownRight === 'admin' && (
					<div>
						<h4 className={fr.cx('fr-mb-3v')}>Supprimer le service</h4>
						<p>En supprimant ce service :</p>
						<ul className={fr.cx('fr-mb-8v')}>
							<li>vous n’aurez plus accès aux avis du formulaire,</li>
							<li>
								les utilisateurs de ce service n’auront plus accès au
								formulaire.
							</li>
						</ul>
						<Button
							type="button"
							iconId="ri-delete-bin-line"
							iconPosition="right"
							priority="tertiary"
							className={classes.buttonError}
							onClick={() => {
								if (product.isTop250) {
									setStatusProductState({
										msg: `Le service "${product.title}" fait partie des démarches essentielles et ne peut pas être supprimé.`,
										role: 'alert'
									});
									window.scrollTo({
										top: 0,
										behavior: 'smooth' // Scroll avec animation
									});
								} else {
									onConfirmModal.open();
									push(['trackEvent', 'Product', 'Modal-Delete']);
								}
							}}
						>
							Supprimer ce service
						</Button>
					</div>
				)}
			</div>
		</ProductLayout>
	);
};

const useStyles = tss.withName(ProductInformationPage.name).create({
	headerWrapper: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	column: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('10v')
	},
	container: {
		marginTop: '1.5rem'
	},
	urlsWrapper: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: fr.spacing('4v')
	},
	copyBtn: {
		boxShadow: 'none'
	},
	buttonError: {
		color: fr.colors.decisions.text.default.error.default
	}
});

export default ProductInformationPage;

export { getServerSideProps };
