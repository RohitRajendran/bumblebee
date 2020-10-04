const twilio = require("twilio");
const queryString = require("query-string");
const intercept = require("azure-function-log-intercept");
const moment = require("moment-timezone");

module.exports.validateTwilioWebhook = (handler, endpointUrl) => async (
  context,
  req
) => {
  intercept(context); // console.log works now!

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

module.exports.extractBumblebeeActiveInterval = message => async () => {
  // Todo: Add support to create Add Request from and to time for various intervals.

  // Add parsed minutes to current time as EST
  const fromTimestamp = moment().tz("America/New_York");

  // Add parsed minutes to current time as EST
  const toTimestamp = moment()
    .tz("America/New_York")
    .add(parseInt(message, 10), "m");

  return [fromTimestamp, toTimestamp];
};
