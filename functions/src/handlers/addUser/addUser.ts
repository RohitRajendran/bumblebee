import { https, logger, Request, Response } from "firebase-functions";
import { addUser } from "../../utils/db/db";

export const handler = async ({ body }: Request, response: Response) => {
  logger.info(`Adding user - ${body.firstName} ${body.lastName}`);

  await addUser(body);

  response.send("success");
};

export default https.onRequest(handler);
