import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div>
            <h1>Dashboard</h1>

            <p>Welcome, {user?.email}</p>

            <button onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}

export default Dashboard;
