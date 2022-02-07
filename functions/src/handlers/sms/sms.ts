import { https, logger, Request, Response } from "firebase-functions";
import * as moment from "moment-timezone";
import { twiml } from "twilio";
import {
  addRequest,
  cancelActiveAccessRequest,
  findActiveAccessRequest,
} from "../../utils/db/db";
import {
  sendTwimlResponse,
  validateTwilioWebhook,
} from "../../utils/helpers/helpers";

const cancelKeywords = ["nevermind", "nvm", "cancel", "stop"];

/**
 * Handles sms received through Twilio
 * @param request - Function request
 * @param response - Function response
 */
export const handler = async (request: Request, response: Response) => {
  logger.info("Received SMS");

  // Reply with success message
  const twimlResponse = new twiml.MessagingResponse();
  const parsedBody = request.body;

  // TODO: Create helper function for this
  const bodyText =
    parsedBody.Body === null
      ? undefined
      : parsedBody.Body instanceof Array
      ? parsedBody.Body.join()
      : typeof parsedBody.Body === "string"
      ? parsedBody.Body
      : undefined;

  const fromText =
    parsedBody.From === null
      ? undefined
      : parsedBody.From instanceof Array
      ? parsedBody.From.join()
      : typeof parsedBody.From === "string"
      ? parsedBody.From
      : undefined;

  if (bodyText === undefined || fromText === undefined) {
    // TODO: Create helper util
    twimlResponse.message("Hmm, I couldn't understand what you said.");

    return sendTwimlResponse(response, twimlResponse);
  } else if (cancelKeywords.includes(bodyText.toLowerCase())) {
    const activeRequest = await findActiveAccessRequest();

    if (activeRequest) {
      logger.info("Found active request, cancelling");
      await cancelActiveAccessRequest(activeRequest);

      twimlResponse.message("Standing down!");
    } else {
      twimlResponse.message(`There wasn't anything active to cancel.`);
    }
  } else {
    // Try parsing minutes from body text
    let parsedTime;
    try {
      parsedTime = parseInt(bodyText, 10);

      if (isNaN(parsedTime) || parsedTime < 0) {
        throw Error("Invalid time");
      }
    } catch (err) {
      logger.error(err);
      twimlResponse.message("Hmm, I couldn't understand what you said.");

      return sendTwimlResponse(response, twimlResponse);
    }

    // Add parsed minutes to current time as EST
    const toTimestamp = moment().tz("America/New_York").add(parsedTime, "m");

    // Add request to DB
    await addRequest({
      fromPhoneNumber: fromText,
      toTimestamp: toTimestamp.toDate(),
    });

    twimlResponse.message(`Ready to buzz until ${toTimestamp.format("LLL")}`);
  }

  return sendTwimlResponse(response, twimlResponse);
};

const wrappedHandler = validateTwilioWebhook(handler, "sms");
export default https.onRequest(wrappedHandler);
