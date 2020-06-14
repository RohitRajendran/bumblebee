const queryString = require("query-string");
const twilio = require("twilio");
const moment = require("moment-timezone");
const { validateTwilioWebhook } = require("../../utils/helpers/helpers");
const {
  addRequest,
  findActiveAccessRequest,
  cancelActiveAccessRequest,
} = require("../../utils/db/db");

const handler = async (context, req) => {
  console.log("Received SMS");
  // Reply with success message
  const { MessagingResponse } = twilio.twiml;
  const twiml = new MessagingResponse();

  const parsedBody = queryString.parse(req.body);

  if (parsedBody.Body.toLowerCase() === "cancel") {
    const activeRequest = await findActiveAccessRequest();

    if (activeRequest) {
      console.log("Found active request, cancelling");
      await cancelActiveAccessRequest(activeRequest);

      twiml.message("Standing down!");
    } else {
      twiml.message(`There wasn't anything active to cancel.`);
    }
  } else {
    // Add parsed minutes to current time as EST
    const toTimestamp = moment()
      .tz("America/New_York")
      .add(parseInt(parsedBody.Body, 10), "m");

    // Add request to DB
    await addRequest({
      fromPhoneNumber: parsedBody.From,
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
