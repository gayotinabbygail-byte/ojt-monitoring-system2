import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoleRoute from "../services/RoleRoute";
import AdminLayout from "../layouts/AdminLayout";

const Login = lazy(() => import("../pages/login"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const StudentDashboard = lazy(() => import("../pages/StudentDashboard"));
const Application = lazy(() => import("../pages/admin/Application"));
const Students = lazy(() => import("../pages/admin/Students"));
const Positions = lazy(() => import("../pages/Positions"));
const Attendance = lazy(() => import("../pages/admin/Attendance"));
const OjtHours = lazy(() => import("../pages/admin/OjtHours"));
const Evaluation = lazy(() => import("../pages/admin/Evaluation"));
const OjtReports = lazy(() => import("../pages/admin/OjtReports"));
const AttendanceReports = lazy(() => import("../pages/admin/AttendanceReport"));
const Users = lazy(() => import("../pages/admin/Users"));
const Settings = lazy(() => import("../pages/admin/Setting"));
const OjtCoordinators = lazy(() => import("../pages/admin/OjtCoordinators"));
const CoordinatorsDashboard = lazy(() => import("../pages/CoordinatorDasboard"));

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<p>Loading...</p>}>
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
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
