const queryString = require("query-string");
const twilio = require("twilio");
const {
  validateTwilioWebhook,
  extractBumblebeeActiveInterval
} = require("../../utils/helpers/helpers");
const {
  addRequest,
  findActiveAccessRequest,
  cancelActiveAccessRequest,
} = require("../../utils/db/db");

const cancelKeywords = ["nevermind", "nvm"];

const handler = async (context, req) => {
  console.log("Received SMS");
  // Reply with success message
  const { MessagingResponse } = twilio.twiml;
  const twiml = new MessagingResponse();

  const parsedBody = queryString.parse(req.body);

  if (cancelKeywords.includes(parsedBody.Body.toLowerCase())) {
    const activeRequest = await findActiveAccessRequest();

    if (activeRequest) {
      console.log("Found active request, cancelling");
      await cancelActiveAccessRequest(activeRequest);

      twiml.message("Standing down!");
    } else {
      twiml.message(`There wasn't anything active to cancel.`);
    }
  } else {
    const [fromTimestamp, toTimestamp] = extractBumblebeeActiveInterval(
      parsedBody.Body
    );

    // Add request to DB
    await addRequest({
      fromPhoneNumber: parsedBody.From,
      fromTimestamp: fromTimestamp.From,
      toTimestamp: toTimestamp.toDate(),
    });

    twiml.message(`Ready to buzz until ${toTimestamp.format("LLL")}`);
  }

  context.res = {
    headers: {
      "content-type": "text/xml",
    },
    body: twiml.toString(),
  };
};

module.exports.wrappedHandler = validateTwilioWebhook(handler, "sms");
module.exports.handler = handler;
