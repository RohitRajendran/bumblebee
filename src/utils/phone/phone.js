const twilio = require("twilio");

module.exports.forwardCall = (forwardNumbers) => {
  const response = new twilio.twiml.VoiceResponse();
  forwardNumbers.map((num) => response.dial(num));

  return response.toString();
};

module.exports.pressBuzz = async (forwardNumbers) => {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  console.log("Sending buzzed in SMS");
  await Promise.all(
    forwardNumbers.map(async (number) => {
      client.messages.create({
        body: "Buzzing in! 🐝",
        from: process.env.TWILIO_NUMBER,
        to: number,
      });
    })
  );

  const { VoiceResponse } = twilio.twiml;

  const response = new VoiceResponse();
  response.pause({
    length: 2,
  });
  response.play({ digits: 999999 }); // Press 9 a bunch of times since it doesn't always work after one

  console.log("Buzzed!");
  return response.toString();
};
