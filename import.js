import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// Inicializar Firebase Admin con tu service account key
initializeApp({
  credential: applicationDefault()
});

const db = getFirestore();

async function main() {
  // Leer el JSON local
  const data = JSON.parse(fs.readFileSync('./apertura-2025.json', 'utf8'));

  // Recorrer la estructura y guardar en Firestore
  const primera_division = data.primera_division;
  for (const year in primera_division) {
    const yearData = primera_division[year];
    for (const torneo in yearData) {
      const torneoData = yearData[torneo];

      // Creamos o reemplazamos el doc en: primera_division/2025
      const docRef = db.collection("primera_division").doc(year);
      await docRef.set({
        [torneo]: torneoData
      });

      console.log(`✅ Datos cargados en: primera_division/${year}/${torneo}`);
    }
  }

  console.log("🎉 Importación completa.");
}

main().catch(err => console.error("🚨 Error:", err));
