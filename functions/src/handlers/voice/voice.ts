import { Request, Response, logger, https } from "firebase-functions";
import { parse } from "query-string";
import { buzz, findActiveAccessRequest, getUsers } from "../../utils/db/db";
import config from "../../utils/envConfig";
import {
  sendTwimlResponse,
  validateTwilioWebhook,
} from "../../utils/helpers/helpers";
import { forwardCall } from "../../utils/phone/phone";

/**
 * Handles phone call received through Twilio
 * @param request - Function request
 * @param response - Function response
 */
export const handler = async (request: Request, response: Response) => {
  logger.info("Received call");

  // Reply with success message
  const parsedBody = parse(request.body);

  // Check if coming from buzzer
  if (parsedBody.From === config.buzzernumber) {
    logger.info("Call from buzzer, checking if bumblebee is active");
    // Check if bumblebee is active
    const activeRequest = await findActiveAccessRequest();

    if (activeRequest) {
      // Buzz in if active
      logger.info("Bumblebee is active, buzzing");
      const twiml = await buzz(activeRequest);

      return sendTwimlResponse(response, twiml);
    }
    logger.info("Bumlebee is not active");
  } else {
    logger.info("Call not from buzzer");
  }

  // No active request so forward numbers
  logger.info("Forward call");
  const users = await getUsers();
  const forwardNumbers = Object.values(users).map(
    ({ phoneNumber }) => phoneNumber
  );

  const twiml = forwardCall(forwardNumbers);

  return sendTwimlResponse(response, twiml);
};

const wrappedHandler = validateTwilioWebhook(handler);
export default https.onRequest(wrappedHandler);
