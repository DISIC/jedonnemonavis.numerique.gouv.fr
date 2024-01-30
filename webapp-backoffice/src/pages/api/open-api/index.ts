import { NextApiRequest, NextApiResponse } from "next";

import { openApiDocument } from "@/src/server/openapi";

// Respond with our OpenAPI schema
const handler = (_: NextApiRequest, res: NextApiResponse) => {
  res.status(200).send(openApiDocument);
};

export default handler;
