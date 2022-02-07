import { initializeApp, database } from "firebase-admin";

initializeApp();

const db = database();
const ref = db.ref();

export { ref };
