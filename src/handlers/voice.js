"use strict";

const queryString = require("query-string");
const { validateTwilioWebhook } = require("../utils/helpers");
const { findActiveAccessRequest, buzz } = require("../utils/db");
const { forwardCall } = require("../utils/phone");

const handler = async (context, req) => {
  context.log("Received SMS");

  const parsedBody = queryString.parse(req.body);

  // Check if coming from buzzer
  if (parsedBody.From === process.env.BUZZER_NUMBER) {
    // Check if bumblebee is active
    const activeRequest = await findActiveAccessRequest();

    if (activeRequest) {
      // Buzz in if active
      const response = await buzz(activeRequest);

      context.res = {
        headers: {
          "content-type": "text/xml",
        },
        body: response,
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
