const firebaseConfig = {
  apiKey: "AIzaSyCoSDPqmefchNUjwIOG6q2OowAJUQIXbJw",
  authDomain: "ojt-monitoringsystem2.firebaseapp.com",
  projectId: "ojt-monitoringsystem2",
  storageBucket: "ojt-monitoringsystem2.firebasestorage.app",
  messagingSenderId: "260573620058",
  appId: "1:260573620058:web:758c048038690d0da67563",
  measurementId: "G-0DF8XPGBM4",
};

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

