"use strict";

const queryString = require("query-string");
const { validateTwilioWebhook } = require("../utils/helpers");
const { findActiveAccessRequest, buzz } = require("../utils/db");
const { forwardCall } = require("../utils/phone");

const handler = async (context, req) => {
  context.log("Received SMS");

  const parsedBody = queryString.parse(req.body);

  if (parsedBody.From === process.env.BUZZER_NUMBER) {
    const activeRequest = await findActiveAccessRequest();

    if (activeRequest) {
      context.res = {
        headers: {
          "content-type": "text/xml",
        },
        body: await buzz(activeRequest),
      };
      return context.done();
    }
  }

  // No active request so forward numbers
  const users = await this.getUsers();
  const forwardNumbers = Object.values(users).map(
    ({ phoneNumber }) => phoneNumber
  );

  context.res = {
    headers: {
      "content-type": "text/xml",
    },
    body: forwardCall(forwardNumbers),
  };
};

module.exports.handler = validateTwilioWebhook(handler, "voice");
