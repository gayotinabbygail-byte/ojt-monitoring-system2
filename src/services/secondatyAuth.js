import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCr5NnLwjaiCNa8rMyP1-c3KbBeru_AFdE",
  authDomain: "jang-pms.firebaseapp.com",
  projectId: "jang-pms",
  storageBucket: "jang-pms.firebasestorage.app",
  messagingSenderId: "133962668117",
  appId: "1:133962668117:web:8506cddbe06950a9155cdc",
};

// INITIALIZE SECONDARY FIREBASE APP
const secondaryApp =
  getApps().find((app) => app.name === "SecondaryApp") ||
  initializeApp(firebaseConfig, "SecondaryApp");

// SECONDARY AUTH
export const secondaryAuth = getAuth(secondaryApp);