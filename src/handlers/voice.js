const queryString = require("query-string");
const { validateTwilioWebhook } = require("../utils/helpers");
const { findActiveAccessRequest, buzz, getUsers } = require("../utils/db");
const { forwardCall } = require("../utils/phone");

const handler = async (context, req) => {
  context.log("Received call");

  const parsedBody = queryString.parse(req.body);

  // Check if coming from buzzer
  if (parsedBody.From === process.env.BUZZER_NUMBER) {
    console.log("Call from buzzer, checking if bumblebee is active");
    // Check if bumblebee is active
    const activeRequest = await findActiveAccessRequest();

    if (activeRequest) {
      // Buzz in if active
      console.log("Bumblebee is active, buzzing");
      const response = await buzz(activeRequest);

      context.res = {
        headers: {
          "content-type": "text/xml",
        },
        body: response,
      };
      return context.done();
    }
    console.log("Bumlebee is not active");
  } else {
    console.log("Call not from buzzer");
  }

  // No active request so forward numbers
  console.log("Forward call");
  const users = await getUsers();
  const forwardNumbers = Object.values(users).map(
    ({ phoneNumber }) => phoneNumber
  );

  context.res = {
    headers: {
      "content-type": "text/xml",
    },
    body: forwardCall(forwardNumbers),
  };

  return context.done();
};

module.exports.handler = validateTwilioWebhook(handler, "voice");
