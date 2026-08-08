// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlt1RdXDLsJH6mTKf7PLQP9eZsm1xZnJE",
  authDomain: "voting-system-826df.firebaseapp.com",
  projectId: "voting-system-826df",
  storageBucket: "voting-system-826df.firebasestorage.app",
  messagingSenderId: "597424238025",
  appId: "1:597424238025:web:658d78465c77714c7f0c18"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

