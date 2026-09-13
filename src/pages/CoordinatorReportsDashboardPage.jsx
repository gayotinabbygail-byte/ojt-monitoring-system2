import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Users,
} from "lucide-react";
import { useAuth } from "../context/useAuth";
import { db } from "../services/firebase";
import "../styles/coordinatordashboard.css";

const sources = ["students", "applications", "attendance", "partnerCompanies"];

function valueOf(record, keys, fallback = "") {
  return keys
    .map((key) => record[key])
    .find((value) => value !== undefined && value !== null && value !== "") ?? fallback;
}

function CoordinatorReportsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(Object.fromEntries(sources.map((source) => [source, []])));
  const [loading, setLoading] = useState(true);
  const [failedSources, setFailedSources] = useState([]);

  useEffect(() => {
    const ready = new Set();
    const subscriptions = sources.map((source) => onSnapshot(
      collection(db, source),
      (snapshot) => {
        setData((current) => ({
          ...current,
          [source]: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
        }));
        setFailedSources((current) => current.filter((item) => item !== source));
        ready.add(source);
        if (ready.size === sources.length) setLoading(false);
      },
      (error) => {
        console.error(`Unable to load coordinator reports ${source}:`, error);
        setFailedSources((current) => current.includes(source) ? current : [...current, source]);
        ready.add(source);
        if (ready.size === sources.length) setLoading(false);
      },
    ));

    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  }, []);

  const students = data.students;
  const applications = data.applications;
  const attendance = data.attendance;
  const pendingApplications = applications.filter((item) => String(item.status || "").toLowerCase() === "pending");
  const attendanceIssues = attendance.filter((item) => ["absent", "late", "incomplete"].includes(String(item.status || "").toLowerCase()));
  const completedStudents = students.filter((item) => String(item.status || "").toLowerCase() === "completed");
  const ongoingStudents = students.filter((item) => String(item.status || "").toLowerCase() === "ongoing");
  const recentApplications = useMemo(() => applications.slice(-5).reverse(), [applications]);

  const stats = [
    ["Assigned Students", students.length, Users, "students"],
    ["Pending Applications", pendingApplications.length, FileText, "application"],
    ["Attendance Issues", attendanceIssues.length, AlertTriangle, "attendancereports"],
    ["Partner Companies", data.partnerCompanies.length, Building2, "partnercompanies"],
  ];

  if (loading) {
    return <main className="coordinator-dashboard coordinator-dashboard-state">Loading reports dashboard...</main>;
  }

  return (
    <main className="coordinator-dashboard">
      <header className="coordinator-dashboard-header">
        <div>
          <p className="dashboard-eyebrow">OJT coordination reports</p>
          <h1>Reports Dashboard</h1>
          <p>Welcome back, {user?.firstName || user?.email || "Coordinator"}. Monitor placement progress and follow-up work.</p>
        </div>
        <button type="button" className="coordinator-primary-action" onClick={() => navigate("/coordinator/ojtreports")}>
          <BarChart3 size={16} /> Open OJT reports
        </button>
      </header>

      {failedSources.length > 0 && (
        <div className="coordinator-dashboard-error" role="alert">
          Unable to load: {failedSources.join(", ")}. Check Firestore permissions.
        </div>
      )}

      <section className="coordinator-stats" aria-label="Reports summary">
        {stats.map(([label, value, Icon, path]) => (
          <button type="button" className="coordinator-stat" key={label} onClick={() => navigate(`/coordinator/${path}`)}>
            <Icon size={20} />
            <span>{label}</span>
            <strong>{value}</strong>
            <ArrowRight size={16} />
          </button>
        ))}
      </section>

      <section className="coordinator-dashboard-grid">
        <article className="coordinator-panel">
          <div className="coordinator-panel-heading">
            <h2>Placement progress</h2>
            <button type="button" onClick={() => navigate("/coordinator/students")}>View students <ArrowRight size={15} /></button>
          </div>
          <div className="coordinator-report-progress">
            <div><strong>{ongoingStudents.length}</strong><span>Currently on OJT</span></div>
            <div><strong>{completedStudents.length}</strong><span>Completed OJT</span></div>
            <div><strong>{Math.max(0, students.length - ongoingStudents.length - completedStudents.length)}</strong><span>Not yet assigned</span></div>
          </div>
        </article>

        <article className="coordinator-panel">
          <div className="coordinator-panel-heading">
            <h2>Attendance summary</h2>
            <button type="button" onClick={() => navigate("/coordinator/attendancereports")}>Review <ArrowRight size={15} /></button>
          </div>
          {attendanceIssues.length === 0 ? (
            <p className="coordinator-empty"><CheckCircle2 size={18} /> No attendance issues.</p>
          ) : (
            <div className="coordinator-attention"><strong>{attendanceIssues.length}</strong><span>records need review</span><p>Late, absent, or incomplete attendance entries are waiting for your attention.</p></div>
          )}
        </article>
      </section>

      <section className="coordinator-panel coordinator-report-list-panel">
        <div className="coordinator-panel-heading">
          <h2>Recent applications</h2>
          <button type="button" onClick={() => navigate("/coordinator/application")}>View all <ArrowRight size={15} /></button>
        </div>
        {recentApplications.length === 0 ? (
          <p className="coordinator-empty">No applications found.</p>
        ) : (
          <div className="coordinator-list">
            {recentApplications.map((item) => (
              <div className="coordinator-list-item" key={item.id}>
                <div>
                  <strong>{valueOf(item, ["studentName", "student", "name"], "Unnamed student")}</strong>
                  <span>{valueOf(item, ["company", "partnerCompany", "companyName"], "Company not assigned")}</span>
                </div>
                <span className="coordinator-status">{valueOf(item, ["status"], "Pending")}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="coordinator-panel coordinator-quick-actions">
        <h2>Quick actions</h2>
        <div>
          <button type="button" onClick={() => navigate("/coordinator/students")}><Users size={15} /> View students</button>
          <button type="button" onClick={() => navigate("/coordinator/application")}><FileText size={15} /> Review applications</button>
          <button type="button" onClick={() => navigate("/coordinator/attendance")}><ClipboardCheck size={15} /> Record attendance</button>
          <button type="button" onClick={() => navigate("/coordinator/ojtreports")}><BarChart3 size={15} /> View OJT reports</button>
        </div>
      </section>
    </main>
  );
}

export default CoordinatorReportsDashboard;