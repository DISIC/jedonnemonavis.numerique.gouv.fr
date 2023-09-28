import ProductLayout from '@/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { Button as PrismaButtonType, Product } from '@prisma/client';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { tss } from 'tss-react/dsfr';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import ProductButtonCard from '@/components/dashboard/Product/ProductButtonCard';
import { ProductWithButtons } from '@/pages/api/prisma/products/type';
import { Pagination } from '../../../../../components/ui/Pagination';

import React from 'react';

interface Props {
	product: ProductWithButtons;
}

const ProductButtonsPage = (props: Props) => {
	const { product } = props;

	const [buttons, setButtons] = React.useState<PrismaButtonType[]>([]);
	const [page, setPage] = React.useState(1);

	const retrieveButtons = React.useCallback(async () => {
		const response = await fetch(
			`/api/prisma/buttons?product_id=${product.id}`
		);
		const data = await response.json();
		setButtons(data);
	}, []);

	React.useEffect(() => {
		retrieveButtons();
	}, [retrieveButtons]);

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
						<span className={cx(classes.boldText)}>{buttons.length}</span>
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
			<div>
				{buttons?.map((button, index) => (
					<ProductButtonCard key={index} button={button} />
				))}
			</div>
			<Pagination
				showFirstLast
				count={10}
				defaultPage={page}
				getPageLinkProps={pageNumber => ({
					onClick: event => {
						event.preventDefault();
						setPage(pageNumber);
					},
					href: '#',
					key: `pagination-link-${pageNumber}`
				})}
				className={fr.cx('fr-mt-1w')}
			/>
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
