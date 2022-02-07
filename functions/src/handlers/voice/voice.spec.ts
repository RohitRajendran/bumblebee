import { Request, Response } from "firebase-functions/v1";
import { buzz, findActiveAccessRequest, getUsers } from "../../utils/db/db";
import config from "../../utils/envConfig";
import { forwardCall } from "../../utils/phone/phone";
import * as voice from "./voice";

jest.mock("../../utils/phone/phone");
jest.mock("../../utils/db/db");
jest.mock("../../utils/firebase", () => ({}));

describe("Voice handler", () => {
  test("phone call from buzzer with active request", async () => {
    (findActiveAccessRequest as jest.Mock).mockReturnValue("activeRequestId");
    (buzz as jest.Mock).mockReturnValue(true);
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;
    const req = { body: `?From=${config.BUZZER_NUMBER}` } as Request;

    await voice.handler(req, res);

    expect(findActiveAccessRequest).toBeCalledTimes(1);
    expect(buzz).toBeCalledWith("activeRequestId");
    expect(res.send).toBeCalledWith("true");
  });

  test("phone call from buzzer without active request", async () => {
    (findActiveAccessRequest as jest.Mock).mockReturnValue(null);
    (getUsers as jest.Mock).mockReturnValue([{ phoneNumber: "123-456-7890" }]);
    (forwardCall as jest.Mock).mockReturnValue(true);

    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;
    const req = { body: `?From=${config.BUZZER_NUMBER}` } as Request;

    await voice.handler(req, res);

    expect(findActiveAccessRequest).toBeCalledTimes(1);
    expect(buzz).not.toBeCalled();
    expect(res.send).toBeCalledWith("true");
  });

  test("phone call from buzzer without active request", async () => {
    (getUsers as jest.Mock).mockReturnValue([{ phoneNumber: "123-456-7890" }]);
    (forwardCall as jest.Mock).mockReturnValue(true);

    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;
    const req = { body: `?From=nope` } as Request;

    await voice.handler(req, res);

    expect(findActiveAccessRequest).not.toBeCalled();
    expect(buzz).not.toBeCalled();
    expect(res.send).toBeCalledWith("true");
  });
});
