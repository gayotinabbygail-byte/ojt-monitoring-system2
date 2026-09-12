import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import AdminDashboard from "../pages/admin/AdminDashboard";
import StudentDashboard from "../pages/StudentDashboard";
import RoleRoute from "../services/RoleRoute";
import AdminLayout from "../layouts/AdminLayout";
import Application from "../pages/admin/Application";
import Students from "../pages/admin/Students";
import Positions from "../pages/Positions";
import Attendance from "../pages/admin/Attendance";
import OjtHours from "../pages/admin/OjtHours";
import Evaluation from "../pages/admin/Evaluation";
import OjtReports from "../pages/admin/OjtReports";
import AttendanceReports from "../pages/admin/AttendanceReport";
import Users from "../pages/admin/Users";
import Settings from "../pages/admin/Setting";
import OjtCoordinators from "../pages/admin/OjtCoordinators";
import CoordinatorsDashboard from "../pages/CoordinatorDasboard";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRole="admin">
              <AdminLayout/>
            </RoleRoute>
          }
        >
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="application" element={<Application />} />
            <Route path="partnercompanies" element={<Positions />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="ojthours" element={<OjtHours />} />
            <Route path="evaluation" element={<Evaluation />} />
            <Route path="ojtreports" element={<OjtReports />} />
            <Route path="attendancereports" element={<AttendanceReports />} />
            <Route path="users" element={<Users />} />
            <Route path="ojtcoordinators" element={<OjtCoordinators />} />
            <Route path="settings" element={<Settings />} />
        </Route>

        <Route
          path="/Student"
          element={
            <RoleRoute allowedRole="student">
              <StudentDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/coordinator"
          element={
            <RoleRoute allowedRole="coordinator">
              <CoordinatorsDashboard />
            </RoleRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
