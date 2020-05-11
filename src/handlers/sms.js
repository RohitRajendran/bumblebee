"use strict";

const queryString = require("query-string");
const { addRequest } = require("../utils/db");
const { validateTwilioWebhook } = require("../utils/helpers");
const twilio = require("twilio");

var format = require("date-fns/format");
var addMinutes = require("date-fns/addMinutes");

const handler = async (context, req) => {
  context.log("Received SMS");

  const parsedBody = queryString.parse(req.body);

  const toTimestamp = addMinutes(new Date(), parseInt(parsedBody.Body));
  await addRequest({
    fromPhoneNumber: parsedBody.From,
    toTimestamp,
  });

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
