import { Request, Response } from "firebase-functions/v1";
import * as twilio from "twilio";
import { twilioauthtoken, url } from "../../../../env/local.sample.json";
import { validateTwilioWebhook } from "./helpers";

jest.mock("twilio");
jest.mock("firebase-functions");

describe("Helpers", () => {
  describe("validateTwilioWebhook", () => {
    test("valid request", async () => {
      const mockHandler = jest.fn();
      (twilio.validateRequest as jest.Mock).mockReturnValue(true);

      const wrappedHandler = validateTwilioWebhook(mockHandler, "test");

      const res = { status: jest.fn() } as unknown as Response;
      const req = {
        headers: {
          "x-twilio-signature": "valid",
        },
        body: "?isValid=true",
      } as unknown as Request;
      await wrappedHandler(req, res);

      expect(twilio.validateRequest).toBeCalledWith(
        twilioauthtoken,
        req.headers["x-twilio-signature"],
        `${url}/test`,
        { isValid: "true" }
      );
      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledTimes(0);
    });

    test("unauthorized request", async () => {
      const mockHandler = jest.fn();
      (twilio.validateRequest as jest.Mock).mockReturnValue(false);

      const wrappedHandler = validateTwilioWebhook(mockHandler, "test");

      const sendMock = jest.fn();
      const res = {
        status: jest.fn(() => ({
          send: sendMock,
        })),
      } as unknown as Response;
      const req = {
        headers: {
          "x-twilio-signature": "inValid",
        },
        body: "?isValid=false",
      } as unknown as Request;
      await wrappedHandler(req, res);

      expect(twilio.validateRequest).toBeCalledWith(
        twilioauthtoken,
        req.headers["x-twilio-signature"],
        `${url}/test`,
        { isValid: "false" }
      );
      expect(mockHandler).not.toHaveBeenCalled();
      expect(res.status).toBeCalledWith(401);
      expect(sendMock).toBeCalled();
    });

    test("errored request", async () => {
      const mockHandler = jest.fn().mockRejectedValue(new Error("Error"));
      (twilio.validateRequest as jest.Mock).mockReturnValue(true);

      const wrappedHandler = validateTwilioWebhook(mockHandler, "test");

      const sendMock = jest.fn();
      const res = {
        status: jest.fn(() => ({
          send: sendMock,
        })),
      } as unknown as Response;
      const req = {
        headers: {
          "x-twilio-signature": "valid",
        },
        body: "?isValid=true",
      } as unknown as Request;
      await wrappedHandler(req, res);

      expect(twilio.validateRequest).toBeCalledWith(
        twilioauthtoken,
        req.headers["x-twilio-signature"],
        `${url}/test`,
        { isValid: "true" }
      );
      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(res.status).toBeCalledWith(500);
      expect(sendMock).toBeCalledWith("Error");
    });
  });
});
