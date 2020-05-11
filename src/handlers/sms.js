"use strict";

const { addRequest } = require("../utils/db");
const { validateTwilioWebhook } = require("../utils/helpers");
const queryString = require("query-string");
const twilio = require("twilio");
const moment = require("moment-timezone");

const handler = async (context, req) => {
  context.log("Received SMS");

  const parsedBody = queryString.parse(req.body);

  // Add parsed minutes to current time as EST
  const toTimestamp = moment()
    .tz("America/New_York")
    .add(parseInt(parsedBody.Body), "m")
    .toDate();

  // Add request to DB
  await addRequest({
    fromPhoneNumber: parsedBody.From,
    toTimestamp,
  });

  // Reply with message success message
  const MessagingResponse = twilio.twiml.MessagingResponse;
  const twiml = new MessagingResponse();
  twiml.message(`Ready to buzz until ${format(toTimestamp, "Pp")}`);

  context.res = {
    headers: {
      "content-type": "text/xml",
    },
    body: twiml.toString(),
  };
};

module.exports.handler = validateTwilioWebhook(handler, "sms");
