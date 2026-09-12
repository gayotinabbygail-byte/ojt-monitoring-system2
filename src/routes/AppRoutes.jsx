import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import Dashboard from "../pages/Dashboard";
import StudentDashboard from "../pages/StudentDashboard";
import RoleRoute from "../services/RoleRoute";
import AdminLayout from "../layouts/AdminLayout";
import Positions from "../pages/Positions";
import AdminPlaceholder from "../pages/AdminPlaceholder";
import Application from "../pages/Application";
import Students from "../pages/Students";
import PartnerCompanies from "../pages/PartnerCompanies";
import OJTCoordinators from "../pages/OJTCoordinators";
import OJTHours from "../pages/OJTHours";
import Evaluation from "../pages/Evaluation";
import Attendance from "../pages/Attendance";
import OJTReports from "../pages/OJTReports";
import AttendanceReports from "../pages/AttendanceReports";
import Settings from "../pages/Settings";
import Users from "../pages/Users";

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
            <Route path="application" element={<Application />} />
            <Route path="students" element={<Students />} />
            <Route path="partnercompanies" element={<Positions />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="ojtreports" element={<OJTReports />} />
            <Route path="attendancereports" element={<AttendanceReports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="users" element={<Users />} />
            {placeholderRoutes.map(([path, title]) => (
              <Route key={path} path={path} element={<AdminPlaceholder title={title} />} />
            ))}
        </Route>

        <Route
          path="/coordinator"
          element={
            <RoleRoute allowedRole="coordinator">
              <AdminLayout />
            </RoleRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="application" element={<Application />} />
          <Route path="students" element={<Students />} />
          <Route path="partnercompanies" element={<PartnerCompanies />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="ojtreports" element={<OJTReports />} />
          <Route path="attendancereports" element={<AttendanceReports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="users" element={<Users />} />
          <Route path="ojtcoordinators" element={<OJTCoordinators />} />
          <Route path="ojthours" element={<OJTHours />} />
          <Route path="evaluation" element={<Evaluation />} />
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
