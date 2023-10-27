import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { ImportReview } from '../../../../../webapp-backoffice/src/pages/api/import/types';
import { ElkAnswer } from '@/src/utils/types';
import { Client as ElkClient } from '@elastic/elasticsearch';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const elkClient = new ElkClient({
  node: process.env.ELASTIC_HOST as string,
  auth: {
    username: process.env.ELASTIC_USERNAME as string,
    password: process.env.ELASTIC_PASSWORD as string
  },
  tls: {
    ca: fs.readFileSync(path.resolve(process.cwd(), './certs/ca/ca.crt')),
    rejectUnauthorized: false
  }
});

export async function importReviews(data: ImportReview[]) {
  const promises = data.map(d =>
    prisma.review.create({
      data: {
        form_id: d.form_id,
        xwiki_id: d.xwiki_id,
        product_id: d.product_id,
        button_id: d.button_id,
        created_at: d.created_at,
        answers: {
          create: d.answers
        }
      },
      include: {
        answers: true,
        product: true,
        button: true
      }
    })
  );

  const elkResponses = await Promise.all(promises).then(responses =>
    responses
      .map(r =>
        r.answers.map(ra => {
          const { id: newAnswerId, ...answerWithoutId } = ra;

          return elkClient.index<ElkAnswer>({
            index: 'jdma-answers',
            id: newAnswerId.toString(),
            body: {
              ...answerWithoutId,
              review_id: r.id,
              button_id: r.button_id,
              button_name: r.button.title,
              product_id: r.product_id,
              product_name: r.product.title,
              created_at: r.created_at
            }
          });
        })
      )
      .flat()
  );

  await Promise.all(elkResponses);

  return { count: elkResponses.length };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const token = await getToken({
  // 	req,
  // 	secret: process.env.JWT_SECRET
  // });
  // if (!token || (token.exp as number) > new Date().getTime())
  // 	return res.status(401).json({ msg: 'You shall not pass.' });

  if (req.method === 'POST') {
    const data = JSON.parse(JSON.stringify(req.body));
    const response = await importReviews(data);
    return res.status(201).json(response);
  }
}
