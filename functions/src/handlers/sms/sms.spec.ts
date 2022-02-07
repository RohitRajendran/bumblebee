import { Request, Response } from "firebase-functions";
import * as moment from "moment";
import * as twilio from "twilio";
import {
  cancelActiveAccessRequest,
  findActiveAccessRequest,
} from "../../utils/db/db";
import * as sms from "./sms";

jest.mock("../../utils/db/db");
jest.mock("../../utils/firebase", () => ({}));
jest.mock("firebase-functions");

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

    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;
    const req = { body: { Body: "60", From: "1234567890" } } as Request;

    await sms.handler(req, res);

    expect(res.send).toBeCalledWith(expectedBody);
  });

  describe("cancel active request", () => {
    test("no active request", async () => {
      const { MessagingResponse } = twilio.twiml;
      const twiml = new MessagingResponse();
      const expectedBody = twiml
        .message(`There wasn't anything active to cancel.`)
        .toString();
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;
      const req = { body: { Body: "nvm", From: "1234567890" } } as Request;

      await sms.handler(req, res);

      expect(res.send).toBeCalledWith(expectedBody);
    });

    test("found active request", async () => {
      const activeRequest = { id: "id", numbBuzzes: 0 };
      (findActiveAccessRequest as jest.Mock).mockReturnValue(activeRequest);

      const { MessagingResponse } = twilio.twiml;
      const twiml = new MessagingResponse();
      const expectedBody = twiml.message(`Standing down!`).toString();
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;
      const req = { body: { Body: "nvm", From: "1234567890" } } as Request;

      await sms.handler(req, res);

      expect(cancelActiveAccessRequest).toBeCalledWith(activeRequest);
      expect(res.send).toBeCalledWith(expectedBody);
    });

    test("Undefined body text returns error message", async () => {
      const { MessagingResponse } = twilio.twiml;
      const twiml = new MessagingResponse();
      const expectedBody = twiml
        .message(`Hmm, I couldn't understand what you said.`)
        .toString();

      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;
      const req = { body: { From: "1234567890" } } as Request;

      await sms.handler(req, res);

      expect(res.send).toBeCalledWith(expectedBody);
    });

    test("Undefined from text returns error message", async () => {
      const { MessagingResponse } = twilio.twiml;
      const twiml = new MessagingResponse();
      const expectedBody = twiml
        .message(`Hmm, I couldn't understand what you said.`)
        .toString();

      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;
      const req = { body: { Body: "60" } } as Request;

      await sms.handler(req, res);

      expect(res.send).toBeCalledWith(expectedBody);
    });
  });
});
