const twilio = require("twilio");
const phone = require("./phone");

jest.mock("twilio");
twilio.twiml = jest.requireActual("twilio").twiml;

describe("Phone", () => {
  const forwardNumbers = ["123-456-7890", "234-567-8901"];

  describe("forwardCall", () => {
    test("valid", () => {
      const response = new twilio.twiml.VoiceResponse();
      forwardNumbers.map((num) => response.dial(num));
      const expected = response.toString();

      const actual = phone.forwardCall(forwardNumbers);
      expect(actual).toBe(expected);
    });
  });

  describe("pressBuzz", () => {
    test("valid", async () => {
      const clientMock = { messages: { create: jest.fn() } };
      twilio.mockReturnValue(clientMock);

      const response = new twilio.twiml.VoiceResponse();
      response.play({ digits: 9 });
      const expected = response.toString();

      const result = await phone.pressBuzz(forwardNumbers);

      expect(clientMock.messages.create).toBeCalledTimes(2);
      expect(result).toBe(expected);
    });
  });
});
