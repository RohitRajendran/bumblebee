const twilio = require("twilio");
const intercept = require("azure-function-log-intercept");
const helpers = require("./helpers");

jest.mock("twilio");
jest.mock("azure-function-log-intercept");

describe("Helpers", () => {
  describe("validateTwilioWebhook", () => {
    test("valid request", async () => {
      const mockHandler = jest.fn();
      twilio.validateRequest.mockReturnValue(true);

      const wrappedHandler = helpers.validateTwilioWebhook(mockHandler, "test");

      const context = { done: jest.fn() };
      const req = {
        headers: {
          "x-twilio-signature": "valid",
        },
        body: "?isValid=true",
      };
      await wrappedHandler(context, req);

      expect(intercept).toBeCalled();
      expect(twilio.validateRequest).toBeCalledWith(
        process.env.TWILIO_AUTH_TOKEN,
        req.headers["x-twilio-signature"],
        `${process.env.URL}/api/test`,
        { isValid: "true" }
      );
      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(context.done).toHaveBeenCalledTimes(1);
    });

    test("unauthorized request", async () => {
      const mockHandler = jest.fn();
      twilio.validateRequest.mockReturnValue(false);

      const wrappedHandler = helpers.validateTwilioWebhook(mockHandler, "test");

      const context = { done: jest.fn() };
      const req = {
        headers: {
          "x-twilio-signature": "inValid",
        },
        body: "?isValid=false",
      };
      await wrappedHandler(context, req);

      expect(intercept).toBeCalled();
      expect(twilio.validateRequest).toBeCalledWith(
        process.env.TWILIO_AUTH_TOKEN,
        req.headers["x-twilio-signature"],
        `${process.env.URL}/api/test`,
        { isValid: "false" }
      );
      expect(context.res).toEqual({ status: 401 });
      expect(mockHandler).not.toHaveBeenCalled();
      expect(context.done).toHaveBeenCalledTimes(1);
    });

    test("errored request", async () => {
      const mockHandler = jest.fn().mockRejectedValue(new Error("Error"));
      twilio.validateRequest.mockReturnValue(true);

      const wrappedHandler = helpers.validateTwilioWebhook(mockHandler, "test");

      const context = { done: jest.fn() };
      const req = {
        headers: {
          "x-twilio-signature": "valid",
        },
        body: "?isValid=true",
      };
      await wrappedHandler(context, req);

      expect(intercept).toBeCalled();
      expect(twilio.validateRequest).toBeCalledWith(
        process.env.TWILIO_AUTH_TOKEN,
        req.headers["x-twilio-signature"],
        `${process.env.URL}/api/test`,
        { isValid: "true" }
      );
      expect(context.res).toEqual({ status: 500, body: "Error" });
      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(context.done).toHaveBeenCalledTimes(1);
    });
  });
});
