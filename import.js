import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
if (!credentialsBase64) {
  throw new Error("🚨 GOOGLE_CREDENTIALS_BASE64 no está definido en el entorno.");
}

const credentialsJson = Buffer.from(credentialsBase64, "base64").toString("utf8");
const serviceAccount = JSON.parse(credentialsJson);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function main() {
  const data = JSON.parse(fs.readFileSync("./apertura-2025.json", "utf8"));

  const reserva = data.reserva; // ← corregido a tu JSON actual
  for (const year in reserva) {
    const yearData = reserva[year];
    const docRef = db.collection("reserva").doc(year);

    await docRef.set(yearData);

    console.log(`✅ Subido reserva/${year} con campos: ${Object.keys(yearData).join(", ")}`);
  }

  console.log("🎉 Importación completa.");
}

main().catch(err => console.error("🚨 Error:", err));
