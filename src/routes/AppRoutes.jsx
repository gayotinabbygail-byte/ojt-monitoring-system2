import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";
import StudentDashboard from "../pages/StudentDashboard";
import RoleRoute from "./RoleRoute";
import AdminLayout from "../layouts/AdminLayout";
import Application from "../pages/admin/Application";
import Students from "../pages/admin/Students";
import PartnerCompanies from "../pages/admin/PartnerCompanies";
import OjtCoordinator from "../pages/admin/OjtCoordinator";
import Attendance from "../pages/admin/Attendance";
import OjtHours from "../pages/admin/OjtHours";
import Evaluation from "../pages/admin/Evaluation";
import OjtReports from "../pages/admin/OjtReports";
import AttendanceReports from "../pages/admin/AttendanceReport";
import Users from "../pages/admin/Users";
import Settings from "../pages/admin/Setting";

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
            <Route path="partnercompanies" element={<PartnerCompanies />} />
            <Route path="ojtcoordinator" element={<OjtCoordinator />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="ojthours" element={<OjtHours />} />
            <Route path="evaluation" element={<Evaluation />} />
            <Route path="ojtreports" element={<OjtReports />} />
            <Route path="attendancereports" element={<AttendanceReports />} />
            <Route path="users" element={<Users />} />
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
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
