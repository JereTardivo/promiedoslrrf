import { getApps, initializeApp, cert, App, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let app: App;

if (!getApps().length) {
  const credentialsJson = Buffer.from(
    process.env.GOOGLE_CREDENTIALS_BASE64!,
    "base64"
  ).toString("utf8");

  const serviceAccount = JSON.parse(credentialsJson);

  app = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  app = getApp();
}

export const firestore = getFirestore(app);
