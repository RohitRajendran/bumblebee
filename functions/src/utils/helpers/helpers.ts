import { logger, Request, Response } from "firebase-functions";
import { validateRequest } from "twilio";
import config from "../envConfig";
import MessagingResponse = require("twilio/lib/twiml/MessagingResponse");

export const validateTwilioWebhook =
  (
    handler: (req: Request, resp: Response) => void | Promise<void>,
    endpointUrl: string
  ) =>
  async (request: Request, response: Response) => {
    logger.info("Received webhook request", JSON.stringify(request.body));
    logger.info("Request headers:", JSON.stringify(request.headers));

    const twilioSignature = request.headers["x-twilio-signature"] as string;

    logger.info("Validating request", {
      twilioSignature,
      url: `${config.url}/${endpointUrl}`,
      params: request.body,
    });

    const requestIsValid = validateRequest(
      config.twilioauthtoken ?? "",
      twilioSignature,
      `${config.url}/${endpointUrl}`,
      request.body
    );

    if (!requestIsValid) {
      logger.info("Unauthorized request");

      response.status(401).send();
    } else {
      logger.info("Authorized request");

      try {
        await handler(request, response);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        logger.error(err.message, err);
        response.status(500).send(err.message);
      }
    }
  };

export const sendTwimlResponse = (
  response: Response,
  twiml: MessagingResponse | string
): void => {
  response.setHeader("content-type", "text/xml");

  response.send(twiml.toString());
};
