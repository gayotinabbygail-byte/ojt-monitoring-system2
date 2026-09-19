import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import Dashboard from "../pages/Dashboard";
import RoleRoute from "../services/RoleRoute";
import AdminLayout from "../layouts/AdminLayout";
import Application from "../pages/admin/Application";
import StudentDashboardPage from "../pages/student/StudentsDashboard";
import StudentAttendancePage from "../pages/student/Attendance";
import StudentProfilePage from "../pages/student/Profile";
import StudentReportsPage from "../pages/student/StudentReports";
import StudentDocumentsPage from "../pages/student/StudentsDocuments";
import StudentProgressPage from "../pages/student/StudentsProgress";
import StudentSettingsPage from "../pages/student/Settings";
import StudentLogoutPage from "../pages/student/Logout";
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
import CoordinatorDashboard from "../pages/coordinator/CoordinatorDashboard";
import CoordinatorApplication from "../pages/coordinator/Application";
import CoordinatorAttendance from "../pages/coordinator/Attendance";
import CoordinatorStudents from "../pages/coordinator/students";
import CoordinatorEvaluation from "../pages/coordinator/Evaluation";
import CoordinatorHours from "../pages/coordinator/OjtHours";
import CoordinatorReports from "../pages/coordinator/OjtReports";
import CoordinatorCompanies from "../pages/coordinator/PartnerCompanies";
import CoordinatorSettings from "../pages/coordinator/Settings";
import CoordinatorPlaceholder from "../pages/coordinator/CoordinatorPlaceholder";
import StudentDashboardLayout from "../layouts/StudentsLayout";
import SupervisorLayout from "../layouts/SupervisorLayout";
import SupervisorDashboard from "../pages/supervisor/Dashboard";
import SupervisorStudents from "../pages/supervisor/Trainess";
import SupervisorAttendance from "../pages/supervisor/Attendance";
import SupervisorHours from "../pages/supervisor/OJTHours";
import SupervisorEvaluation from "../pages/supervisor/Evaluation";
import SupervisorReports from "../pages/supervisor/Reports";
import SupervisorRequirements from "../pages/supervisor/Requirements";
import SupervisorSettings from "../pages/supervisor/Settings";
import SupervisorDailyLogs from "../pages/supervisor/DailyLogs";
import SupervisorLogout from "../pages/supervisor/Logout";

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
          <Route path="reports-dashboard" element={<CoordinatorReports />} />
          <Route path="application" element={<CoordinatorApplication />} />
          <Route path="students" element={<CoordinatorStudents />} />
          <Route path="partnercompanies" element={<CoordinatorCompanies />} />
          <Route path="attendance" element={<CoordinatorAttendance />} />
          <Route path="ojtreports" element={<CoordinatorReports />} />
          <Route path="attendancereports" element={<CoordinatorReports />} />
          <Route path="ojthours" element={<CoordinatorHours />} />
          <Route path="evaluation" element={<CoordinatorEvaluation />} />
          <Route path="settings" element={<CoordinatorSettings />} />
          <Route path="ojtcoordinators" element={<CoordinatorPlaceholder title="OJT Coordinators" />} />
          {placeholderRoutes.filter(([path]) => !["ojtcoordinators", "ojthours", "evaluation"].includes(path)).map(([path, title]) => (
            <Route key={path} path={path} element={<CoordinatorPlaceholder title={title} />} />
          ))}
        </Route>

        <Route
          path="/Student"
          element={
            <RoleRoute allowedRole="student">
              <StudentDashboardLayout />
            </RoleRoute>
          }
        >
          <Route index element={<StudentDashboardPage />} />
          <Route path="profile" element={<StudentProfilePage />} />
          <Route path="application" element={<Application />} />
          <Route path="attendance" element={<StudentAttendancePage />} />
          <Route path="ojthours" element={<OJTHours />} />
          <Route path="evaluation" element={<Evaluation />} />
          <Route path="ojtreports" element={<StudentReportsPage />} />
          <Route path="documents" element={<StudentDocumentsPage />} />
          <Route path="progress" element={<StudentProgressPage />} />
          <Route path="settings" element={<StudentSettingsPage />} />
          <Route path="logout" element={<StudentLogoutPage />} />
        </Route>

        <Route
          path="/supervisor"
          element={
            <RoleRoute allowedRole="supervisor">
              <SupervisorLayout />
            </RoleRoute>
          }
        >
          <Route index element={<SupervisorDashboard />} />
          <Route path="students" element={<SupervisorStudents />} />
          <Route path="applications" element={<Application />} />
          <Route path="partnercompanies" element={<PartnerCompanies />} />
          <Route path="ojtcoordinators" element={<OJTCoordinators />} />
          <Route path="attendance" element={<SupervisorAttendance />} />
          <Route path="ojthours" element={<SupervisorHours />} />
          <Route path="evaluations" element={<SupervisorEvaluation />} />
          <Route path="reports" element={<SupervisorReports />} />
          <Route path="attendancereports" element={<AttendanceReports />} />
          <Route path="requirements" element={<SupervisorRequirements />} />
          <Route path="dailylogs" element={<SupervisorDailyLogs />} />
          <Route path="settings" element={<SupervisorSettings />} />
          <Route path="logout" element={<SupervisorLogout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
