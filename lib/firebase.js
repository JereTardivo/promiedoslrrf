// lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAdeCz2TM9QI6A5w5M7aH2ozp3E-JnVo-w",
  authDomain: "promiedoslrrf.firebaseapp.com",
  projectId: "promiedoslrrf",
  storageBucket: "promiedoslrrf.firebasestorage.app",
  messagingSenderId: "169926665610",
  appId: "1:169926665610:web:6e31d4315693ab8e055473",
  measurementId: "G-SP8VCXXPJ4"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };
