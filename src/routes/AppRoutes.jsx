import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import Dashboard from "../pages/Dashboard";
import StudentDashboard from "../pages/StudentDashboard";
import RoleRoute from "../services/RoleRoute";
import AdminLayout from "../layouts/AdminLayout";
import Candidates from "../pages/Candidates";
import Positions from "../pages/Positions";
import AdminPlaceholder from "../pages/AdminPlaceholder";
import Application from "../pages/Application";
import Students from "../pages/Students";
import PartnerCompanies from "../pages/PartnerCompanies";
import OJTCoordinators from "../pages/OJTCoordinators";
import OJTHours from "../pages/OJTHours";

const placeholderRoutes = [
  ["ojtcoordinators", "OJT Coordinators"],
  ["attendance", "Attendance"],
  ["ojthours", "OJT Hours"],
  ["evaluation", "Evaluations"],
  ["ojtreports", "OJT Reports"],
  ["attendancereports", "Attendance Reports"],
  ["users", "Users"],
  ["settings", "Settings"],
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
            <Route path="students" element={<Candidates />} />
            <Route path="partnercompanies" element={<Positions />} />
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
          <Route path="ojtcoordinators" element={<OJTCoordinators />} />
          <Route path="ojthours" element={<OJTHours />} />
          {placeholderRoutes.filter(([path]) => !["ojtcoordinators", "ojthours"].includes(path)).map(([path, title]) => (
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
