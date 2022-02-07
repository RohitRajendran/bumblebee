import * as twilio from "twilio";
import { forwardCall, pressBuzz } from "./phone";

describe("Phone", () => {
  const forwardNumbers = ["123-456-7890", "234-567-8901"];

  describe("forwardCall", () => {
    test("valid", () => {
      const response = new twilio.twiml.VoiceResponse();
      forwardNumbers.map((num) => response.dial(num));
      const expected = response.toString();

      const actual = forwardCall(forwardNumbers);
      expect(actual).toBe(expected);
    });
  });

  describe("pressBuzz", () => {
    jest.mock("../envConfig.js", () => {
      // eslint-disable-line
      const config = require("../../env/local.sample.json");

      return {
        ...config,
        twilioaccountsid: "AC1234", // SID needs to start with AC
      };
    });

    test("valid", async () => {
      const response = new twilio.twiml.VoiceResponse();
      response.pause({ length: 3 });
      response.play({ digits: "9" });
      response.pause({ length: 1 });
      response.play({ digits: "9" });

      const result = await pressBuzz(forwardNumbers);

      expect(result).toBe(response.toString());
    });
  });
});
