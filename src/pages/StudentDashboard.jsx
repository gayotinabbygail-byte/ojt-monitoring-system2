import { LogOut } from "lucide-react";
import { logout } from "../services/authService";

function StudentDashboard() {
    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Unable to log out:", error);
        }
    };

    return (
        <div style={{ minHeight: "100vh", padding: "32px", background: "#f6f8fb", color: "#172033" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", maxWidth: "1100px", margin: "0 auto" }}>
                <div>
                    <h1>Student Dashboard</h1>
                    <p>Welcome, Student!</p>
                </div>
                <button
                    type="button"
                    onClick={handleLogout}
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "11px 15px", border: "0", borderRadius: "8px", background: "#2868c7", color: "#fff", fontWeight: 800, cursor: "pointer" }}
                >
                    <LogOut size={16} />
                    Logout
                </button>
            </div>
        </div>
    );
}

export default StudentDashboard;
