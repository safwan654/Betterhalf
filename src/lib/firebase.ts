import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA9QmuYJP1cKDLydQP9oajMk33JVwJt0q8",
  authDomain: "betterhalf-89554.firebaseapp.com",
  databaseURL: "https://betterhalf-89554-default-rtdb.firebaseio.com",
  projectId: "betterhalf-89554",
  storageBucket: "betterhalf-89554.firebasestorage.app",
  messagingSenderId: "270776255422",
  appId: "1:270776255422:web:0d473c22868808d537efef"
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { app, db };
