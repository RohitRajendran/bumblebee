const twilio = require("twilio");
const queryString = require("query-string");

module.exports.validateTwilioWebhook = (handler, endpointUrl) => async (
  context,
  req
) => {
  console.log("Validating webhook request");
  const twilioSignature = req.headers["x-twilio-signature"];

  const params = queryString.parse(req.body);

  const requestIsValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    twilioSignature,
    `${process.env.URL}/api/${endpointUrl}`,
    params
  );

  if (!requestIsValid) {
    console.log("Unauthorized request");

    context.res = {
      status: 401,
    };

    context.done();
  } else {
    console.log("Authorized request");

    try {
      await handler(context, req);
    } catch (err) {
      console.error(err.message, err);
      context.res = {
        status: 500,
        body: err.message,
      };
    } finally {
      context.done();
    }
  }
};
