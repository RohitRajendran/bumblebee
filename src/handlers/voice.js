"use strict";

const queryString = require("query-string");
const { validateTwilioWebhook } = require("../utils/helpers");
const { findActiveAccessRequest, buzz } = require("../utils/db");
const { forwardCall } = require("../utils/phone");

const handler = async (context, req) => {
  context.log("Received SMS");
  let responseBody;

  const parsedBody = queryString.parse(req.body);

  if (parsedBody.From === process.env.BUZZER_NUMBER) {
    const activeRequest = await findActiveAccessRequest();

    if (activeRequest) {
      responseBody = await buzz(activeRequest);
    }
  }

  context.res = {
    headers: {
      "content-type": "text/xml",
    },
    body: responseBody || forwardCall(),
  };
};

module.exports.handler = validateTwilioWebhook(handler, "voice");
