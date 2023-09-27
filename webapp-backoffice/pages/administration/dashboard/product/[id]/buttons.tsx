import ProductLayout from '@/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { Product } from '@prisma/client';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { tss } from 'tss-react/dsfr';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';

interface Props {
	product: Product;
}

const ProductButtonsPage = (props: Props) => {
	const { product } = props;

	const { cx, classes } = useStyles();

	return (
		<ProductLayout product={product}>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col-8')}>
					<h2 className={fr.cx('fr-mb-2w')}>Gérer mes boutons</h2>
				</div>
				<div className={fr.cx('fr-col-4')}>
					<Button
						priority="secondary"
						iconPosition="right"
						iconId="ri-add-box-line"
					>
						Créer un bouton
					</Button>
				</div>
			</div>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col-4')}>
					<p>
						Boutons de <span className={cx(classes.boldText)}>1</span> à{' '}
						<span className={cx(classes.boldText)}>10</span> sur{' '}
						<span className={cx(classes.boldText)}>10</span>
					</p>
				</div>
				<div className={fr.cx('fr-col-4')}>
					<Checkbox
						options={[
							{
								label: 'Afficher les boutons de test',
								nativeInputProps: {
									name: 'test-buttons',
									value: 'test'
								}
							}
						]}
					/>
				</div>
				<div className={fr.cx('fr-col-4')}>
					<Checkbox
						options={[
							{
								label: 'Afficher les boutons archivés',
								nativeInputProps: {
									name: 'archived-buttons',
									value: 'archived'
								}
							}
						]}
					/>
				</div>
			</div>
			<div></div>
		</ProductLayout>
	);
};

export default ProductButtonsPage;

const useStyles = tss.create({
	boldText: {
		fontWeight: 'bold'
	}
});

export { getServerSideProps };
