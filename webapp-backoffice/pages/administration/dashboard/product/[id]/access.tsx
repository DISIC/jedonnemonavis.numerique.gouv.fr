import ProductLayout from '@/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { tss } from 'tss-react/dsfr';
import ProductAccessRightCard from '@/components/dashboard/ProductAccess/ProductAccessRightCard';
import React from 'react';
import { Product } from '@prisma/client';
import { UserProductUserWithUsers } from '@/pages/api/prisma/userProduct/type';

interface Props {
	product: Product;
}

const AccessManagement = (props: Props) => {
	const { cx, classes } = useStyles();

	const { product } = props;

	const [userProducts, setUserProducts] = React.useState<
		UserProductUserWithUsers[]
	>([]);
	const [count, setCount] = React.useState(0);

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, setNumberPerPage] = React.useState(10);

	const retrieveButtons = React.useCallback(async () => {
		const response = await fetch(
			`/api/prisma/userProduct?product_id=${product.id}&numberPerPage=${numberPerPage}&page=${currentPage}`
		);
		const res = await response.json();
		setUserProducts(res.data);
		setCount(res.count);
	}, [numberPerPage, currentPage]);

	React.useEffect(() => {
		retrieveButtons();
	}, [retrieveButtons]);

	return (
		<ProductLayout product={product}>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col-8')}>
					<h2 className={fr.cx('fr-mb-2w')}>Gérer les droits d'accès</h2>
				</div>
				<div className={cx(fr.cx('fr-col-4'), classes.buttonRight)}>
					<Button
						priority="secondary"
						iconPosition="right"
						iconId="ri-user-add-line"
						onClick={() => console.log('test')}
					>
						Inviter un porteur
					</Button>
				</div>
			</div>
			{/* <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col-4')}>
					<p>
						Boutons de{' '}
						<span className={cx(classes.boldText)}>
							{numberPerPage * (currentPage - 1) + 1}
						</span>{' '}
						à{' '}
						<span className={cx(classes.boldText)}>
							{numberPerPage * (currentPage - 1) + product.users.length}
						</span>{' '}
						de <span className={cx(classes.boldText)}>{count}</span>
					</p>
				</div>
			</div> */}
			<div>
				{userProducts?.map((userProduct, index) => (
					<ProductAccessRightCard key={index} userProduct={userProduct} />
				))}
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
