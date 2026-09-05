import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";
import StudentDashboard from "../pages/StudentDashboard";
import RoleRoute from "../services/RoleRoute";
import AdminLayout from "../layouts/AdminLayout";
import Application from "../pages/admin/Application";
import Students from "../pages/admin/Students";
import PartnerCompanies from "../pages/admin/PartnerCompanies";
import OjtCoordinators from "../pages/admin/OjtCoordinators";
import Attendance from "../pages/admin/Attendance";
import OjtHours from "../pages/admin/OjtHours";
import Evaluation from "../pages/admin/Evaluation";
import OjtReports from "../pages/admin/OjtReports";
import AttendanceReports from "../pages/admin/AttendanceReport";
import Users from "../pages/admin/Users";
import Settings from "../pages/admin/Setting";
import ApplicationForm from "../pages/ApplicationForm";
import Attendance from "../pages/admin/Coordinator/Attendance";
import AttendanceReports from "../pages/admin/Coordinator/AttendanceReport";
import CoordinatorsDashboard from "../pages/admin/Coordinator/CoordinatorsDashboard";
import Evaluation from "../pages/admin/Coordinator/Evaluation";
import OjCoordinators from "../pages/admin/Coordinator/OJTCoordinators";
import OjtHours from "../pages/admin/Coordinator/OJTHours";
import OjtReports from "../pages/admin/Coordinator/OJTReports";
import Students from "../pages/admin/Coordinator/Students";
import Settings from "../pages/admin/Coordinator/Settings";

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
            <Route path="ojtcoordinators" element={<OjtCoordinators/>} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="ojthours" element={<OjtHours />} />
            <Route path="evaluation" element={<Evaluation />} />
            <Route path="ojtreports" element={<OjtReports />} />
            <Route path="attendancereports" element={<AttendanceReports />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
            <Route path="applicationform" element={<ApplicationForm />} />
            <Route path="attendance" element={<Attendance />} /> 
            <Route path="attendancereports" element={<AttendanceReports />} />
            <Route path="coordinatorsdashboard" element={<CoordinatorsDashboard />} />
            <Route path="evaluation" element={<Evaluation />} /> 
            <Route path="ojtcoordinators" element={<OjCoordinators />} />
            <Route path="ojthours" element={<OjtHours />} />
            <Route path="ojtreports" element={<OjtReports />} />
            <Route path="students" element={<Students />} />
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
