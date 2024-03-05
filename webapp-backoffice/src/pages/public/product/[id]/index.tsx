import { isValidDate } from '@/src/utils/tools';
import { PrismaClient } from '@prisma/client';
import { GetServerSideProps } from 'next';

const ProductPage = () => {
	return;
};

export const getServerSideProps: GetServerSideProps = async context => {
	const { id, date_debut: startDate, date_fin: endDate } = context.query;
	const prisma = new PrismaClient();
	const product = await prisma.product.findUnique({
		where: {
			id: parseInt(id as string)
		}
	});

	if (!product || !product.isPublic) {
		return {
			props: {
				product: null
			}
		};
	}

	return {
		props: {
			product: JSON.parse(JSON.stringify(product)),
			defaultStartDate:
				startDate && isValidDate(startDate as string)
					? startDate
					: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
							.toISOString()
							.split('T')[0],
			defaultEndDate:
				endDate && isValidDate(endDate as string)
					? endDate
					: new Date().toISOString().split('T')[0]
		}
	};
};

export default ProductPage;
