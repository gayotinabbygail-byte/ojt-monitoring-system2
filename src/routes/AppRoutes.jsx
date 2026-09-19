import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import Dashboard from "../pages/Dashboard";
import StudentDashboard from "../pages/StudentDashboard";
import RoleRoute from "../services/RoleRoute";
import AdminLayout from "../layouts/AdminLayout";
import AdminPlaceholder from "../pages/admin/AdminPlaceholder";
import Application from "../pages/admin/Application";
import Students from "../pages/admin/Students";
import PartnerCompanies from "../pages/admin/PartnerCompanies";
import OJTCoordinators from "../pages/admin/OJTCoordinators";
import OJTHours from "../pages/admin/OJTHours";
import Evaluation from "../pages/admin/Evaluation";
import Attendance from "../pages/admin/Attendance";
import OJTReports from "../pages/admin/OJTReports";
import AttendanceReports from "../pages/admin/AttendanceReports";
import AdminReportsDashboard from "../pages/admin/AdminReportsDashboard";
import Users from "../pages/admin/Users";
import Settings from "../pages/admin/Settings";
import CoordinatorDashboard from "../pages/CoordinatorDasboard";
import CoordinatorReportsDashboard from "../pages/CoordinatorReportsDashboardPage";

const placeholderRoutes = [
  ["ojtcoordinators", "OJT Coordinators"],
  ["ojthours", "OJT Hours"],
  ["evaluation", "Evaluations"],
];

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
            <Route index element={<Dashboard />} />
            <Route path="reports-dashboard" element={<AdminReportsDashboard />} />
            <Route path="application" element={<Application />} />
            <Route path="students" element={<Students />} />
            <Route path="partnercompanies" element={<PartnerCompanies />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="ojtreports" element={<OJTReports />} />
            <Route path="attendancereports" element={<AttendanceReports />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
            <Route path="ojtcoordinators" element={<OJTCoordinators />} />
            <Route path="ojthours" element={<OJTHours />} />
            <Route path="evaluation" element={<Evaluation />} />
        </Route>

        <Route
          path="/coordinator"
          element={
            <RoleRoute allowedRole="coordinator">
              <AdminLayout />
            </RoleRoute>
          }
        >
          <Route index element={<CoordinatorDashboard />} />
          <Route path="reports-dashboard" element={<CoordinatorReportsDashboard />} />
          <Route path="application" element={<Application />} />
          <Route path="students" element={<Students />} />
          <Route path="partnercompanies" element={<PartnerCompanies />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="ojtreports" element={<OJTReports />} />
          <Route path="attendancereports" element={<AttendanceReports />} />
          <Route path="ojtcoordinators" element={<OJTCoordinators />} />
          <Route path="ojthours" element={<OJTHours />} />
          <Route path="evaluation" element={<Evaluation />} />
          <Route path="settings" element={<Settings />} />
          {placeholderRoutes.filter(([path]) => !["ojtcoordinators", "ojthours", "evaluation"].includes(path)).map(([path, title]) => (
            <Route key={path} path={path} element={<AdminPlaceholder title={title} />} />
          ))}
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
