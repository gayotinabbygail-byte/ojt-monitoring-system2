import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import "../styles/coordinatordashboard.css";

import {
  getAssignedStudents,
  getApplications,
  getAttendanceRecords,
} from "../services/coordinatorService";

function CoordinatorsDashboard() {
  const { user } = useAuth();

  // Dashboard data
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Load Firebase data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const studentsData = await getAssignedStudents();
        const applicationsData = await getApplications();
        const attendanceData = await getAttendanceRecords();

        setStudents(studentsData);
        setApplications(applicationsData);
        setAttendance(attendanceData);
      } catch (error) {
        console.error("Error loading coordinator dashboard:", error);
        setErrorMessage("Unable to load dashboard data. Check your Firestore permissions and try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Pending applications
  const pendingApplications = applications.filter(
    (application) => application.status?.toLowerCase() === "pending"
  );

  // Attendance issues
  const attendanceIssues = attendance.filter(
    (record) => ["absent", "late"].includes(record.status?.toLowerCase())
  );

  // Completed OJT Hours
  const completedOJTHours = students.reduce(
    (total, student) => total + Number(student.completedHours || 0),
    0
  );

  if (loading) {
    return (
      <section className="coordinator-dashboard">
        <p>Loading dashboard...</p>
      </section>
    );
  }

  return (
    <section className="coordinator-dashboard">
      <header className="coordinator-dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Coordinator workspace</p>

          <h1>Coordinator Dashboard</h1>

          <p>
            Welcome back, {user?.firstName || user?.email}.
          </p>
        </div>
      </header>

      {errorMessage && <p role="alert">{errorMessage}</p>}

      <div className="coordinator-stats">

        {/* Assigned Students */}
        <article>
          <span>Assigned Students</span>
          <strong>{students.length}</strong>
        </article>

        {/* Pending Applications */}
        <article>
          <span>Pending Applications</span>
          <strong>{pendingApplications.length}</strong>
        </article>

        {/* Attendance Issues */}
        <article>
          <span>Attendance Issues</span>
          <strong>{attendanceIssues.length}</strong>
        </article>

        {/* Completed OJT Hours */}
        <article>
          <span>Completed OJT Hours</span>
          <strong>{completedOJTHours}</strong>
        </article>

      </div>

      {/* Recent Activity */}
      <section className="coordinator-panel">
        <h2>Recent Activity</h2>

        {attendance.length === 0 ? (
          <p>No recent activity yet.</p>
        ) : (
          attendance.slice(0, 5).map((record) => (
            <p key={record.id}>
              {record.studentName || "Student"} —{" "}
              {record.status || "Attendance updated"}
            </p>
          ))
        )}
      </section>
    </section>
  );
}

export default CoordinatorsDashboard;
