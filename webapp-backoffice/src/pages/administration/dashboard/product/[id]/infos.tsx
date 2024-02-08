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
import Alert from '@codegouvfr/react-dsfr/Alert';

interface Props {
	product: Product;
}

const editProductModal = createModal({
	id: 'edit-product-modal',
	isOpenedByDefault: false
});

const ProductInformationPage = (props: Props) => {
	const { product } = props;

	const router = useRouter();

	const [displayToast, setDisplayToast] = React.useState(false);

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

	const { classes } = useStyles();

	return (
		<ProductLayout product={product}>
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
			/>
			<div className={classes.column}>
				<div className={classes.headerWrapper}>
					<h1>Informations</h1>
					<Button
						priority="secondary"
						iconId="fr-icon-edit-line"
						iconPosition="right"
						nativeButtonProps={editProductModal.buttonProps}
					>
						Modifier
					</Button>
				</div>
				<div>
					<h4 className={fr.cx('fr-mb-3v')}>Identifiant</h4>
					<Tag
						id="product-id"
						small
						nativeButtonProps={{
							onClick: () => {
								navigator.clipboard.writeText(product.id.toString());
								setDisplayToast(true);
							}
						}}
					>
						{`#${product.id}`}
					</Tag>
				</div>
				<div>
					<h4 className={fr.cx('fr-mb-3v')}>Organisation</h4>
					{!isLoadingEntity && <Tag>{entity?.name}</Tag>}
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
					<h4 className={fr.cx('fr-mb-3v')}>Volumétrie par an</h4>
					{product.volume ? product.volume : 'Non renseigné'}
				</div>
				<div>
					<h4 className={fr.cx('fr-mb-3v')}>Données statistiques publiques</h4>
					{product.isPublic ? 'Oui' : 'Non'}
				</div>
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
	urlsWrapper: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: fr.spacing('4v')
	}
});

export default ProductInformationPage;

export { getServerSideProps };
