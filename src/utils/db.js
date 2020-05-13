const admin = require("firebase-admin");
const { pressBuzz } = require("./phone");

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  }),
  databaseURL: process.env.FIREBASE_URL,
});
const db = admin.database();
const ref = db.ref();

module.exports.addUser = ({ firstName, lastName, phoneNumber }) => {
  const usersRef = ref.child("users");

  usersRef.push().set({
    firstName,
    lastName,
    phoneNumber,
  });
};

module.exports.getUsers = async () => {
  console.log("Getting users");

  const snapshot = await ref.child("users").once("value");

  return snapshot.val();
};

module.exports.addRequest = async ({
  fromPhoneNumber,
  toTimestamp,
  maxBuzzes = 1,
}) => {
  const snapshot = await ref
    .child("users")
    .orderByChild("phoneNumber")
    .equalTo(fromPhoneNumber)
    .once("value");

  if (snapshot.numChildren() === 1) {
    Object.keys(snapshot.val()).forEach((key) => {
      console.log(`Adding request from ${key}`);
      const accessRequestsRef = ref.child("accessRequests");

      const request = {
        userId: key,
        numBuzzes: 0,
        maxBuzzes,
        toTimestamp: toTimestamp.getTime(),
        createdTimestamp: admin.database.ServerValue.TIMESTAMP,
        forceDisable: false,
      };

      accessRequestsRef.push().set(request);
    });
  }
};

module.exports.findActiveAccessRequest = async () => {
  console.log(`Searching for active requests`);
  const snapshot = await ref
    .child("accessRequests")
    .orderByChild("toTimestamp")
    .startAt(new Date().getTime())
    .once("value");

  if (snapshot.hasChildren()) {
    const requests = snapshot.val();

    const activeRequestId = Object.keys(requests).find((key) => {
      const { forceDisable, numBuzzes, maxBuzzes } = requests[key];
      return !forceDisable && numBuzzes < maxBuzzes;
    });

    console.log(
      activeRequestId
        ? `Found active request: ${activeRequestId}`
        : "No active requests found"
    );

    return activeRequestId
      ? { ...requests[activeRequestId], id: activeRequestId }
      : null;
  }

  console.log("No active requests found");
  return null;
};

module.exports.buzz = async (activeRequest) => {
  console.log("Buzzing!");

  const accessRequestsRef = ref.child("accessRequests");
  await accessRequestsRef.update({
    [`${activeRequest.id}/numBuzzes`]: activeRequest.numBuzzes + 1,
  });

  const users = await this.getUsers();
  const forwardNumbers = Object.values(users).map(
    ({ phoneNumber }) => phoneNumber
  );

  return pressBuzz(forwardNumbers);
};
