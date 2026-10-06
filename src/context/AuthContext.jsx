import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { getUserData } from "../services/userService";
import { AuthContext } from "./AuthContextDefinition";

function readStoredUser() {
  try {
    const rawUser = localStorage.getItem("ojt-demo-user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    console.warn("Unable to read the saved demo session:", error);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncStoredUser = () => {
      const stored = readStoredUser();
      if (stored && !auth.currentUser) {
        setUser(stored);
      }
    };

    syncStoredUser();

    const handleAuthChange = () => {
      const stored = readStoredUser();
      setUser(stored);
      setLoading(false);
    };

    window.addEventListener("ojt-auth-change", handleAuthChange);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          setUser(readStoredUser());
          return;
        }

        const userData = await getUserData(currentUser.uid);

        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          ...(userData || {}),
        });
      } catch (error) {
        console.error("Unable to load the authenticated user profile:", error);
        setUser(readStoredUser());
      } finally {
        setLoading(false);
      }
    });

    return () => {
      window.removeEventListener("ojt-auth-change", handleAuthChange);
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

