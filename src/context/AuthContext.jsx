import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { getUserData } from "../services/userService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {

        if (currentUser) {
            const userData = await getUserData(currentUser.uid);

            setUser({
                uid: currentUser.uid,
                email: currentUser.email,
                ...userData
            });

        } else {
            setUser(null);
        }

        setLoading(false);
    });

    return unsubscribe;
}, []);


    return (
        <AuthContext.Provider value={{ user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
