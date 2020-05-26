const voice = require("./voice");
const {
  findActiveAccessRequest,
  buzz,
  getUsers,
} = require("../../utils/db/db");
const { forwardCall } = require("../../utils/phone/phone");

jest.mock("../../utils/phone/phone");
jest.mock("../../utils/db/db");
jest.mock("../../utils/firebase", () => ({}));

describe("Voice handler", () => {
  test("phone call from buzzer with active request", async () => {
    findActiveAccessRequest.mockReturnValue("activeRequestId");
    buzz.mockReturnValue(true);
    const context = { done: jest.fn() };
    const req = { body: `?From=${process.env.BUZZER_NUMBER}` };

    await voice.handler(context, req);

    expect(findActiveAccessRequest).toBeCalledTimes(1);
    expect(buzz).toBeCalledWith("activeRequestId");
    expect(context.done).toBeCalledTimes(1);
    expect(context.res).toStrictEqual({
      headers: {
        "content-type": "text/xml",
      },
      body: true,
    });
  });

  test("phone call from buzzer without active request", async () => {
    findActiveAccessRequest.mockReturnValue(null);
    getUsers.mockReturnValue([{ phoneNumber: "123-456-7890" }]);
    forwardCall.mockReturnValue(true);

    const context = { done: jest.fn() };
    const req = { body: `?From=${process.env.BUZZER_NUMBER}` };

    await voice.handler(context, req);

    expect(findActiveAccessRequest).toBeCalledTimes(1);
    expect(buzz).not.toBeCalled();
    expect(context.done).toBeCalledTimes(1);
    expect(context.res).toStrictEqual({
      headers: {
        "content-type": "text/xml",
      },
      body: true,
    });
  });

  test("phone call from buzzer without active request", async () => {
    getUsers.mockReturnValue([{ phoneNumber: "123-456-7890" }]);
    forwardCall.mockReturnValue(true);

    const context = { done: jest.fn() };
    const req = { body: `?From=nope` };

    await voice.handler(context, req);

    expect(findActiveAccessRequest).not.toBeCalled();
    expect(buzz).not.toBeCalled();
    expect(context.done).toBeCalledTimes(1);
    expect(context.res).toStrictEqual({
      headers: {
        "content-type": "text/xml",
      },
      body: true,
    });
  });
});
