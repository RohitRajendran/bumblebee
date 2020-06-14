const twilio = require("twilio");
const moment = require("moment");
const sms = require("./sms");
const {
  findActiveAccessRequest,
  cancelActiveAccessRequest,
} = require("../../utils/db/db");

jest.mock("../../utils/db/db");
jest.mock("../../utils/firebase", () => ({}));

describe("SMS handler", () => {
  test("set active request", async () => {
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

  describe("cancel active request", () => {
    test("no active request", async () => {
      const { MessagingResponse } = twilio.twiml;
      const twiml = new MessagingResponse();
      const expectedBody = twiml
        .message(`There wasn't anything active to cancel.`)
        .toString();
      const context = {};
      const req = { body: "?Body=cancel" };

      await sms.handler(context, req);

      expect(context.res).toStrictEqual({
        headers: {
          "content-type": "text/xml",
        },
        body: expectedBody,
      });
    });

    test("found active request", async () => {
      const activeRequest = { id: "id", numbBuzzes: 0 };
      findActiveAccessRequest.mockReturnValue(activeRequest);

      const { MessagingResponse } = twilio.twiml;
      const twiml = new MessagingResponse();
      const expectedBody = twiml.message(`Standing down!`).toString();
      const context = {};
      const req = { body: "?Body=cancel" };

      await sms.handler(context, req);

      expect(cancelActiveAccessRequest).toBeCalledWith(activeRequest);
      expect(context.res).toStrictEqual({
        headers: {
          "content-type": "text/xml",
        },
        body: expectedBody,
      });
    });
  });
});
