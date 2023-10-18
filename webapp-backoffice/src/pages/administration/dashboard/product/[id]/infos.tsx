import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { Product } from '@prisma/client';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { trpc } from '@/src/utils/trpc';
import Tag from '@codegouvfr/react-dsfr/Tag';

interface Props {
	product: Product;
}

const ProductInformationPage = (props: Props) => {
	const { product } = props;

	const { data: entityResult, isLoading: isLoadingEntity } =
		trpc.entity.getById.useQuery(
			{
				id: product.entity_id
			},
			{
				initialData: {
					data: null
				}
			}
		);

	const { data: entity } = entityResult;

	const { classes } = useStyles();

	return (
		<ProductLayout product={product}>
			<div className={classes.column}>
				<div className={classes.headerWrapper}>
					<h1>Informations</h1>
					<Button
						priority="secondary"
						iconId="fr-icon-edit-line"
						iconPosition="right"
					>
						Modifier
					</Button>
				</div>
				<div>
					<h4 className={fr.cx('fr-mb-3v')}>Identifiant</h4>
					{product.id}
				</div>
				<div>
					<h4 className={fr.cx('fr-mb-3v')}>Organisation</h4>
					{!isLoadingEntity && <Tag>{entity?.name}</Tag>}
				</div>
				<div>
					<h4 className={fr.cx('fr-mb-3v')}>URLs</h4>
					{product.urls.map(url => (
						<Tag linkProps={{ href: url }}>{url}</Tag>
					))}
				</div>
				<div>
					<h4 className={fr.cx('fr-mb-3v')}>Volumétrie par an</h4>
					{product.volume ? product.volume : 'Non renseigné'}
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
	}
});

export default ProductInformationPage;

export { getServerSideProps };
