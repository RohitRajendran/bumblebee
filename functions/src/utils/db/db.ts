import { database } from "firebase-admin";
import { logger } from "firebase-functions";
import { ref } from "../firebase";
import { pressBuzz } from "../phone/phone";

/**
 * Creates a user with first name, last name, and phone number
 * @param props - props
 * @param props.firstName - first name of user
 * @param props.lastName - last name of user
 * @param props.phoneNumber - phone number of user, used to allow messages and make calls
 */
export const addUser = async ({
  firstName,
  lastName,
  phoneNumber,
}: {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}): Promise<void> => {
  const usersRef = ref.child("users");

  await usersRef.push().set({
    firstName,
    lastName,
    phoneNumber,
  });
};

/**
 * Gets all users
 * @returns users
 */
export const getUsers = async (): Promise<
  {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }[]
> => {
  logger.info("Getting users");

  const snapshot = await ref.child("users").once("value");

  const users: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }[] = snapshot.val();

  return users;
};

/**
 * Records a request to auto buzz
 * @param props - props
 * @param props.fromPhoneNumber - phone number that initated the request
 * @param props.toTimestamp - expiration timestamp for request
 * @param props.maxBuzzess - the number of auto buzzes that should be allowed
 */
export const addRequest = async ({
  fromPhoneNumber,
  toTimestamp,
  maxBuzzes = 1,
}: {
  fromPhoneNumber: string;
  toTimestamp: Date;
  maxBuzzes?: number;
}): Promise<void> => {
  const snapshot = await ref
    .child("users")
    .orderByChild("phoneNumber")
    .equalTo(fromPhoneNumber)
    .once("value");
  logger.info(JSON.stringify(snapshot.val()));
  if (snapshot.numChildren() === 1) {
    Object.keys(snapshot.val()).forEach((key) => {
      logger.info(`Adding request from ${key}`);
      const accessRequestsRef = ref.child("accessRequests");

      const request = {
        userId: key,
        numBuzzes: 0,
        maxBuzzes,
        toTimestamp: toTimestamp.getTime(),
        createdTimestamp: database.ServerValue.TIMESTAMP,
        forceDisable: false,
      };

      accessRequestsRef.push().set(request);
    });
  }
};

/**
 * Checks DB for active requests
 * @returns active request info
 */
export const findActiveAccessRequest = async (): Promise<{
  id: string;
  numBuzzes: number;
} | null> => {
  logger.info(`Searching for active requests`);
  const snapshot = await ref
    .child("accessRequests")
    .orderByChild("toTimestamp")
    .startAt(new Date().getTime())
    .once("value");

  if (snapshot.hasChildren()) {
    const requests = snapshot.val();
    logger.info(JSON.stringify(requests));
    const activeRequestId = Object.keys(requests).find((key) => {
      const { forceDisable, numBuzzes, maxBuzzes } = requests[key];
      return !forceDisable && numBuzzes < maxBuzzes;
    });

    logger.info(
      activeRequestId
        ? `Found active request: ${activeRequestId}`
        : "No active requests found"
    );

    return activeRequestId
      ? { ...requests[activeRequestId], id: activeRequestId }
      : null;
  }

  logger.info("No active requests found");
  return null;
};

/**
 * Buzzes in guest and sends confirmation texts
 * @param activeRequest - Active request id and number of buzzes so far
 */
export const buzz = async (activeRequest: {
  id: string;
  numBuzzes: number;
}): Promise<string> => {
  logger.info("Buzzing!");

  const accessRequestsRef = ref.child("accessRequests");
  await accessRequestsRef.update({
    [`${activeRequest.id}/numBuzzes`]: activeRequest.numBuzzes + 1,
  });

  const users = await getUsers();
  const forwardNumbers = Object.values(users).map(
    ({ phoneNumber }) => phoneNumber
  );

  return pressBuzz(forwardNumbers);
};

/**
 * Cancels the given active request
 * @param activeRequest - id of activeRequest
 */
export const cancelActiveAccessRequest = async (activeRequest: {
  id: string;
}): Promise<void> => {
  logger.info("Cancelling!");

  const accessRequestsRef = ref.child("accessRequests");
  await accessRequestsRef.update({
    [`${activeRequest.id}/forceDisable`]: true,
  });
};
