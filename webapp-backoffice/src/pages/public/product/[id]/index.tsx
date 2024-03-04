import { GetServerSideProps } from 'next';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { isValidDate } from '@/src/utils/tools';

const ProductPage = () => {
	return;
};

export const getServerSideProps: GetServerSideProps = async context => {
	const { id, startDate, endDate } = context.query;
	const prisma = new PrismaClient();
	const product = await prisma.product.findUnique({
		where: {
			id: parseInt(id as string)
		}
	});

	if(!product || !product.isPublic) {
		return {
			props: {
				product: null
			}
		};
	}

	return {
		props: {
			product: JSON.parse(JSON.stringify(product)),
			startDate: startDate && isValidDate(startDate as string) ? startDate : new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
			endDate: endDate && isValidDate(endDate as string) ? endDate : new Date().toISOString().split('T')[0]
		}
	};
};

export default ProductPage;
