"use strict";

const { addRequest } = require("../utils/db");
const { format, addMinutes } = require("date-fns");
const { utcToZonedTime } = require("date-fns-tz");
const { validateTwilioWebhook } = require("../utils/helpers");
const queryString = require("query-string");
const twilio = require("twilio");

const handler = async (context, req) => {
  context.log("Received SMS");

  const parsedBody = queryString.parse(req.body);

  // Add parsed minutes to current time as EST
  const currTime = utcToZonedTime(new Date().toUTCString(), "America/New_York");
  const toTimestamp = addMinutes(currTime, parseInt(parsedBody.Body));

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
