import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { AttendanceProvider } from "./context/AttendanceContext";

function App() {
    return (
        <AuthProvider>
            <AttendanceProvider>
                <AppRoutes />
            </AttendanceProvider>
        </AuthProvider>
    );
}

export default App;
