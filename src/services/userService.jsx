import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const getUserData = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    }

    return null;
};

export const createUserProfile = async (uid, profile) => {
    await setDoc(doc(db, "users", uid), profile);
};
