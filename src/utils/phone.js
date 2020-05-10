const twilio = require("twilio");

module.exports.forwardCall = (forwardNumbers) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;

  const response = new VoiceResponse();
  forwardNumbers.map((num) => response.dial(num));

  return response.toString();
};

module.exports.pressBuzz = async (forwardNumbers) => {
  const client = twilio(
    process.env.twilioAccountSid,
    process.env.twilioAuthToken
  );

  console.log("Sending buzzed in SMS");
  await Promise.all(
    forwardNumbers.map(async (number) => {
      client.messages.create({
        body: "Buzzing in! 🐝",
        from: process.env.twilioNumber,
        to: number,
      });
    })
  );

  const VoiceResponse = twilio.twiml.VoiceResponse;

  const response = new VoiceResponse();
  response.play({ digits: 9 });

  console.log("Buzzed!");
  return response.toString();
};
