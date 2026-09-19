import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        await logout();
      } catch (error) {
        console.error("Unable to log out:", error);
      } finally {
        navigate("/", { replace: true });
      }
    };

    performLogout();
  }, [navigate]);

  return null;
}

export default Logout;
