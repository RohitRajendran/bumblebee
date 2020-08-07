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
    length: 3,
  });
  response.play({ digits: 9 }); // Press 9 to unlock
  response.pause({
    length: 1,
  });
  response.play({ digits: 9 }); // Try pressing 9 again since it doesn't always work after the first attempt

  console.log("Buzzed!");
  return response.toString();
};
