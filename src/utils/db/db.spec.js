const db = require("./db");
const { ref } = require("../firebase");
const { pressBuzz } = require("../phone/phone");

jest.mock("../phone/phone.js");

jest.mock("../firebase", () => {
  const set = jest.fn();
  const push = jest.fn(() => ({
    set,
  }));
  const mockRef = {
    push,
    child: jest.fn().mockReturnValue({
      push,
      once: jest.fn(),
      orderByChild: jest.fn().mockReturnValue({
        startAt: jest.fn().mockReturnValue({ once: jest.fn() }),
      }),
      update: jest.fn(),
    }),
  };

  return {
    admin: { database: { ServerValue: { TIMESTAMP: "" } } },
    ref: mockRef,
  };
});

describe("DB", () => {
  describe("addUser", () => {
    test("valid", () => {
      const params = {
        firstName: "Rohit",
        lastName: "Rajendran",
        phoneNumber: "123-456-7890",
      };

      db.addUser(params);

      expect(ref.child).toHaveBeenCalledWith("users");
      expect(ref.child().push().set).toHaveBeenCalledWith(params);
    });
  });

  describe("getUsers", () => {
    test("valid", async () => {
      const expected = ["user"];

      ref
        .child()
        .once.mockReturnValue({ val: jest.fn().mockReturnValue(expected) });

      const actual = await db.getUsers();

      expect(ref.child).toHaveBeenCalledWith("users");
      expect(ref.child().once).toHaveBeenCalledWith("value");
      expect(actual).toBe(expected);
    });
  });

  describe("addRequest", () => {
    test("found request and is active", async () => {
      ref
        .child()
        .orderByChild()
        .startAt()
        .once.mockReturnValue({
          hasChildren: jest.fn().mockReturnValue(true),
          val: jest.fn().mockReturnValue({
            id: { forceDisable: false, numBuzzes: 1, maxBuzzes: 5 },
          }),
        });

      const actual = await db.findActiveAccessRequest();

      expect(ref.child).toHaveBeenCalledWith("accessRequests");
      expect(ref.child().orderByChild).toHaveBeenCalledWith("toTimestamp");
      expect(ref.child().orderByChild().startAt().once).toHaveBeenCalledWith(
        "value"
      );
      expect(actual).toStrictEqual({
        forceDisable: false,
        numBuzzes: 1,
        maxBuzzes: 5,
        id: "id",
      });
    });

    test("found request and is not active because of force disable", async () => {
      ref
        .child()
        .orderByChild()
        .startAt()
        .once.mockReturnValue({
          hasChildren: jest.fn().mockReturnValue(true),
          val: jest.fn().mockReturnValue({
            id: { forceDisable: true, numBuzzes: 1, maxBuzzes: 5 },
          }),
        });

      const actual = await db.findActiveAccessRequest();

      expect(ref.child).toHaveBeenCalledWith("accessRequests");
      expect(ref.child().orderByChild).toHaveBeenCalledWith("toTimestamp");
      expect(ref.child().orderByChild().startAt().once).toHaveBeenCalledWith(
        "value"
      );
      expect(actual).toBeNull();
    });

    test("found request and is not active because of no more remaining buzzess", async () => {
      ref
        .child()
        .orderByChild()
        .startAt()
        .once.mockReturnValue({
          hasChildren: jest.fn().mockReturnValue(true),
          val: jest.fn().mockReturnValue({
            id: { forceDisable: false, numBuzzes: 6, maxBuzzes: 5 },
          }),
        });

      const actual = await db.findActiveAccessRequest();

      expect(ref.child).toHaveBeenCalledWith("accessRequests");
      expect(ref.child().orderByChild).toHaveBeenCalledWith("toTimestamp");
      expect(ref.child().orderByChild().startAt().once).toHaveBeenCalledWith(
        "value"
      );
      expect(actual).toBeNull();
    });

    test("found request and is not active because of no more remaining buzzess", async () => {
      ref
        .child()
        .orderByChild()
        .startAt()
        .once.mockReturnValue({
          hasChildren: jest.fn().mockReturnValue(false),
        });

      const actual = await db.findActiveAccessRequest();

      expect(ref.child).toHaveBeenCalledWith("accessRequests");
      expect(ref.child().orderByChild).toHaveBeenCalledWith("toTimestamp");
      expect(ref.child().orderByChild().startAt().once).toHaveBeenCalledWith(
        "value"
      );
      expect(actual).toBeNull();
    });
  });

  describe("buzz", () => {
    test("valid", async () => {
      pressBuzz.mockReturnValue(true);
      ref.child().once.mockReturnValue({
        val: jest.fn().mockReturnValue([{ phoneNumber: "123-456-7890" }]),
      });

      const actual = await db.buzz({ id: "id", numBuzzes: 0 });

      expect(ref.child).toHaveBeenCalledWith("accessRequests");
      expect(ref.child().update).toHaveBeenCalledWith({ "id/numBuzzes": 1 });
      expect(pressBuzz).toHaveBeenCalledWith(["123-456-7890"]);
      expect(actual).toBeTruthy();
    });
  });
});
