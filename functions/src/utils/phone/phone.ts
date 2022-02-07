import { logger } from "firebase-functions";
import { Twilio, twiml } from "twilio";
import config from "../envConfig";

export const forwardCall = (forwardNumbers: string[]): string => {
  const response = new twiml.VoiceResponse();
  forwardNumbers.map((num) => response.dial(num));

  return response.toString();
};

export const pressBuzz = async (forwardNumbers: string[]): Promise<string> => {
  const client = new Twilio(config.twilioAccountSID, config.twilioAuthToken);

  logger.info("Sending buzzed in SMS");

  await Promise.all(
    forwardNumbers.map(async (number) => {
      client.messages.create({
        body: "Buzzing in! 🐝",
        from: config.twilioNumber,
        to: number,
      });
    })
  );

  const { VoiceResponse } = twiml;

  const response = new VoiceResponse();
  response.pause({
    length: 3,
  });
  response.play({ digits: "9" }); // Press 9 to unlock
  response.pause({
    length: 1,
  });
  response.play({ digits: "9" }); // Try pressing 9 again since it doesn't always work after the first attempt

  logger.info("Buzzed!");
  return response.toString();
};
