import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContextDefinition";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        let unsubscribe;

        const initializeAuth = async () => {
            const [{ onAuthStateChanged }, { auth }, { getUserData }] = await Promise.all([
                import("firebase/auth"),
                import("../services/firebase"),
                import("../services/userService"),
            ]);

            if (!active) {
                return;
            }

            unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                try {
                    if (!currentUser) {
                        setUser(null);
                        return;
                    }

                    const userData = await getUserData(currentUser.uid);

                    setUser({
                        uid: currentUser.uid,
                        email: currentUser.email,
                        ...(userData || {})
                    });
                } catch (error) {
                    console.error("Unable to load the authenticated user profile:", error);
                    setUser(null);
                } finally {
                    setLoading(false);
                }
            });
        };

        initializeAuth().catch((error) => {
            console.error("Unable to initialize authentication:", error);
            setLoading(false);
        });

        return () => {
            active = false;
            unsubscribe?.();
        };
    }, []);


    return (
        <AuthContext.Provider value={{ user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

