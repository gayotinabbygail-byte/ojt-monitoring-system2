import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

const DEMO_USERS = {
  "admin@lcci.edu.ph": {
    uid: "demo-admin",
    email: "admin@lcci.edu.ph",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    password: "admin123",
  },
  "coordinator@lcci.edu.ph": {
    uid: "demo-coordinator",
    email: "coordinator@lcci.edu.ph",
    firstName: "Lance",
    lastName: "Reyes",
    role: "coordinator",
    password: "coordinator123",
  },
  "student@lcci.edu.ph": {
    uid: "demo-student",
    email: "student@lcci.edu.ph",
    firstName: "Maria",
    lastName: "Santos",
    role: "student",
    password: "student123",
  },
  "supervisor@lcci.edu.ph": {
    uid: "demo-supervisor",
    email: "supervisor@lcci.edu.ph",
    firstName: "Rose",
    lastName: "De Leon",
    role: "supervisor",
    password: "supervisor123",
  },
};

const persistDemoUser = (user) => {
  if (!user) {
    localStorage.removeItem("ojt-demo-user");
    window.dispatchEvent(new Event("ojt-auth-change"));
    return;
  }

  localStorage.setItem("ojt-demo-user", JSON.stringify(user));
  window.dispatchEvent(new Event("ojt-auth-change"));
};

export const login = async (email, password) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const demoUser = DEMO_USERS[normalizedEmail];

  if (demoUser && password === demoUser.password) {
    const sessionUser = { ...demoUser, email: normalizedEmail };
    persistDemoUser(sessionUser);
    return { user: sessionUser };
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential;
  } catch (error) {
    if (demoUser && password !== demoUser.password) {
      throw { code: "auth/wrong-password", message: "The password is incorrect." };
    }

    throw error;
  }
};

export const createAccount = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  persistDemoUser(null);

  try {
    await signOut(auth);
  } catch (error) {
    console.warn("Unable to sign out from Firebase:", error);
  }
};
