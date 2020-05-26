const twilio = require("twilio");
const moment = require("moment");
const sms = require("./sms");

jest.mock("../../utils/db/db");
jest.mock("../../utils/firebase", () => ({}));

describe("SMS handler", () => {
  test("valid", async () => {
    const { MessagingResponse } = twilio.twiml;
    const twiml = new MessagingResponse();
    const expectedBody = twiml
      .message(
        `Ready to buzz until ${moment()
          .tz("America/New_York")
          .add(60, "m")
          .format("LLL")}`
      )
      .toString();

    const context = {};
    const req = { body: "?Body=60" };

    await sms.handler(context, req);

    expect(context.res).toStrictEqual({
      headers: {
        "content-type": "text/xml",
      },
      body: expectedBody,
    });
  });
});
