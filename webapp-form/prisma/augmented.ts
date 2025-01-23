import { Prisma } from "@prisma/client";

const reviewWithButtonAndProduct = Prisma.validator<Prisma.ReviewDefaultArgs>()(
  {
    include: { button: true, product: true },
  },
);

export type ReviewWithButtonAndProduct = Prisma.ReviewGetPayload<
  typeof reviewWithButtonAndProduct
>;
