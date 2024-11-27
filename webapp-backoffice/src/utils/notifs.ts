import { PrismaClient } from "@prisma/client";

export const getProductsWithReviewCountsByScope = async (
    prisma: PrismaClient,
    scopes: { scope: 'daily' | 'weekly' | 'monthly'; startDate: Date; endDate: Date }[]
  ) => {
    const results: {
      scope: 'daily' | 'weekly' | 'monthly';
      startDate: Date,
      endDate: Date,
      products: { productId: number; reviewCount: number }[];
    }[] = [];
  
    for (const { scope, startDate, endDate } of scopes) {
      const productsWithReviewCounts = await prisma.review.groupBy({
        by: ['product_id'],
        _count: {
          id: true,
        },
        where: {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
      
      const formattedProducts = productsWithReviewCounts.map((entry) => ({
        productId: entry.product_id,
        reviewCount: entry._count.id,
      }));
  
      results.push({
        scope,
        startDate,
        endDate,
        products: formattedProducts,
      });
    }
  
    return results;
  }