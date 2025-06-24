import prisma from '@/src/utils/db';
import { isValidDate } from '@/src/utils/tools';
import { GetServerSideProps } from 'next';

const ProductPage = () => {
	return;
};

export const getServerSideProps: GetServerSideProps = async context => {
	const {
		id,
		'date-debut': startDate,
		'date-fin': endDate,
		xwiki
	} = context.query;
	const product = await prisma.product.findUnique({
		where:
			xwiki === 'true'
				? {
						xwiki_id: parseInt(id as string)
					}
				: {
						id: parseInt(id as string)
					},
		include: {
			forms: {
				include: {
					form_template: true,
					form_configs: {
						include: {
							form_config_displays: true,
							form_config_labels: true
						},
						orderBy: {
							created_at: 'desc'
						}
					}
				},
				orderBy: {
					created_at: 'asc'
				}
			}
		}
	});

	prisma.$disconnect();

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
