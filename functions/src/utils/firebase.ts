import { App, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

// Initialize Firebase
const app: App = initializeApp();

const db = getDatabase(app);
const ref = db.ref();

export { ref };
