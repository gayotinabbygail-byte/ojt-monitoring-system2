import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Activity, ArrowUpRight, BarChart3, Building2, CalendarDays, CheckCircle2,
  ClipboardClock, Clock3, FileCheck2, FileText, UserRoundCog, Users,
} from "lucide-react";
import { db } from "../services/firebase";
import { useAuth } from "../context/useAuth";
import "../styles/admin-dashboard.css";

const sources = ["students", "applications", "attendance", "partnerCompanies", "evaluations", "users"];

function valueOf(record, keys, fallback = "") {
  return keys.map((key) => record[key]).find((value) => value !== undefined && value !== null && value !== "") ?? fallback;
}

function dateValue(record) {
  const value = valueOf(record, ["createdAt", "dateApplied", "applicationDate", "date", "updatedAt"]);
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatTime(value) {
  if (!value) return "Recently";
  const elapsed = Math.max(0, Date.now() - value);
  if (elapsed < 60 * 60 * 1000) return `${Math.max(1, Math.floor(elapsed / 60000))} min ago`;
  if (elapsed < 24 * 60 * 60 * 1000) return `${Math.floor(elapsed / 3600000)} hr ago`;
  return new Date(value).toLocaleDateString();
}

function normalizeStudent(record) {
  const completed = Number(valueOf(record, ["completedHours", "ojtHours", "hoursCompleted", "hours"], 0));
  const required = Number(valueOf(record, ["requiredHours", "totalRequiredHours", "ojtRequiredHours"], 500));
  const rawStatus = String(valueOf(record, ["ojtStatus", "status", "placementStatus"], "")).toLowerCase();
  const status = rawStatus.includes("complete") || (required > 0 && completed >= required) ? "Completed"
    : rawStatus.includes("pending") || rawStatus.includes("not started") ? "Pending" : "Ongoing";
  return { ...record, id: record.id, name: valueOf(record, ["name", "fullName", "studentName"], `${record.firstName || ""} ${record.lastName || ""}`.trim() || "Unnamed student"), company: valueOf(record, ["company", "partnerCompany", "companyName"], ""), completed, required, status };
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(Object.fromEntries(sources.map((source) => [source, []])));
  const [loading, setLoading] = useState(true);
  const [failedSources, setFailedSources] = useState([]);

  useEffect(() => {
    const activeSources = user?.role === "admin" ? sources : sources.filter((source) => source !== "users");
    const ready = new Set();
    const unsubscribers = activeSources.map((source) => onSnapshot(collection(db, source), (snapshot) => {
      setData((current) => ({ ...current, [source]: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) }));
      setFailedSources((current) => current.filter((item) => item !== source));
      ready.add(source);
      if (ready.size === activeSources.length) setLoading(false);
    }, (snapshotError) => {
      console.error(`Unable to load dashboard ${source}:`, snapshotError);
      ready.add(source);
      setFailedSources((current) => current.includes(source) ? current : [...current, source]);
      if (ready.size === activeSources.length) setLoading(false);
    }));
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [user?.role]);

  const students = useMemo(() => data.students.map(normalizeStudent), [data.students]);
  const attendance = data.attendance;
  const applications = data.applications;
  const companies = data.partnerCompanies;
  const evaluations = data.evaluations;
  const coordinators = data.users.filter((item) => item.role === "coordinator");
  const pendingApplications = applications.filter((item) => String(item.status || "").toLowerCase() === "pending");
  const attendanceIssues = attendance.filter((item) => ["absent", "late", "incomplete"].includes(String(item.status || "").toLowerCase()));
  const totalHours = attendance.reduce((sum, item) => sum + Number(valueOf(item, ["totalHours", "hours"], 0)), 0);
  const completedHours = students.reduce((sum, student) => sum + student.completed, 0);

  const stats = [
    ["Total Students", students.length, "All student records", Users, "blue"],
    ["Pending Applications", pendingApplications.length, "Needs review", FileCheck2, "coral"],
    ["Partner Companies", companies.length, "Registered partners", Building2, "teal"],
    ["OJT Coordinators", coordinators.length, "Active user profiles", UserRoundCog, "amber"],
    ["Students Currently on OJT", students.filter((item) => item.status === "Ongoing").length, "Ongoing placements", ClipboardClock, "blue"],
    ["Completed OJT", students.filter((item) => item.status === "Completed").length, "Required hours reached", CheckCircle2, "teal"],
    ["Attendance Issues", attendanceIssues.length, "Late, absent, or incomplete", Clock3, "coral"],
    ["Total OJT Hours", totalHours, "Recorded attendance hours", BarChart3, "amber"],
  ];

  const recentApplications = useMemo(() => [...applications].sort((a, b) => dateValue(b) - dateValue(a)).slice(0, 5), [applications]);
  const recentAttendance = useMemo(() => [...attendance].sort((a, b) => dateValue(b) - dateValue(a)).slice(0, 5), [attendance]);
  const activities = useMemo(() => [
    ...applications.map((item) => ({ title: "Application submitted", detail: `${valueOf(item, ["studentName", "student", "name"], "Unnamed student")} · ${valueOf(item, ["company", "partnerCompany"], "Company not assigned")}`, time: dateValue(item), icon: FileCheck2 })),
    ...attendance.map((item) => ({ title: "Attendance recorded", detail: `${valueOf(item, ["studentName", "student"], "Unnamed student")} · ${valueOf(item, ["status"], "Recorded")}`, time: dateValue(item), icon: ClipboardClock })),
    ...evaluations.map((item) => ({ title: "Evaluation updated", detail: `${valueOf(item, ["studentName", "student", "name"], "Unnamed student")} · ${valueOf(item, ["status"], "Recorded")}`, time: dateValue(item), icon: CheckCircle2 })),
    ...students.map((item) => ({ title: "Student record added", detail: item.name, time: dateValue(item), icon: Users })),
  ].sort((a, b) => b.time - a.time).slice(0, 6), [applications, attendance, evaluations, students]);

  const go = (path) => navigate(path);
  const basePath = user?.role === "coordinator" ? "/coordinator" : "/admin";
  const reportStats = {
    total: students.length,
    pending: students.filter((item) => item.status === "Pending").length,
    completed: students.filter((item) => item.status === "Completed").length,
  };

  if (loading) return <div className="admin-dashboard dashboard-state">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <section className="dashboard-intro">
        <div><p className="dashboard-eyebrow">LCCI · OJT MONITORING SYSTEM</p><h1>{user?.role === "coordinator" ? "Coordinator Dashboard" : "Admin Dashboard"}</h1><p className="dashboard-subtitle">Welcome back, {user?.firstName || user?.email || "User"}! Here is your latest placement overview.</p></div>
        <button type="button" className="dashboard-date-button"><CalendarDays size={16} />{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</button>
      </section>
      {failedSources.length > 0 && <div className="dashboard-error" role="alert">Unable to load: {failedSources.join(", ")}. Check the Firestore permissions for these collections.</div>}
      <section className="dashboard-stats" aria-label="OJT summary">{stats.map(([label, value, detail, Icon, tone]) => <button type="button" className="dashboard-stat" key={label} onClick={() => go(`${basePath}/${label === "Total Students" ? "students" : label.includes("Application") ? "application" : label.includes("Attendance") ? "attendancereports" : label.includes("Company") ? "partnercompanies" : label.includes("Coordinator") ? "ojtcoordinators" : label.includes("Hours") ? "ojthours" : "ojtreports"}`)}><div className={`stat-icon stat-icon-${tone}`}><Icon size={19} /></div><div className="stat-copy"><p>{label}</p><strong>{value}</strong><span>{detail}</span></div><ArrowUpRight className="stat-arrow" size={17} /></button>)}</section>
      <section className="dashboard-grid">
        <article className="dashboard-panel"><div className="panel-heading"><div><p className="panel-kicker">Student overview</p><h2>Placement health</h2></div><Activity size={20} /></div><div className="progress-layout"><div className="progress-ring" style={{ "--progress": `${students.length ? Math.round((students.filter((item) => item.status === "Completed").length / students.length) * 100) : 0}%` }}><div><strong>{students.length ? Math.round((students.filter((item) => item.status === "Completed").length / students.length) * 100) : 0}%</strong><span>completed</span></div></div><div className="progress-legend"><div><span className="legend-dot legend-blue" /><p>Currently on OJT <strong>{students.filter((item) => item.status === "Ongoing").length}</strong></p></div><div><span className="legend-dot legend-teal" /><p>Completed OJT <strong>{students.filter((item) => item.status === "Completed").length}</strong></p></div><div><span className="legend-dot legend-muted" /><p>Not yet assigned <strong>{students.filter((item) => !item.company || item.status === "Pending").length}</strong></p></div></div></div><p className="progress-footnote"><Clock3 size={14} /> {completedHours} total OJT hours recorded from attendance</p></article>
        <article className="dashboard-panel"><div className="panel-heading"><div><p className="panel-kicker">Needs attention</p><h2>Attendance issues</h2></div><span className="attention-count">{attendanceIssues.length} records</span></div><div className="attention-list"><div className="attention-item"><div><strong>{attendance.filter((item) => String(item.status).toLowerCase() === "absent").length}</strong><p>Absent records</p></div><ArrowUpRight size={17} /></div><div className="attention-item"><div><strong>{attendance.filter((item) => String(item.status).toLowerCase() === "late").length}</strong><p>Late records</p></div><ArrowUpRight size={17} /></div><div className="attention-item"><div><strong>{pendingApplications.length}</strong><p>Pending applications</p></div><ArrowUpRight size={17} /></div></div></article>
      </section>
      <section className="dashboard-overview-grid">
        <DashboardList title="Recent applications" items={recentApplications} empty="No applications found." columns={["Student", "Company", "Status"]} render={(item) => [valueOf(item, ["studentName", "student", "name"], "Unnamed student"), valueOf(item, ["company", "partnerCompany"], "Not assigned"), valueOf(item, ["status"], "Pending")]} />
        <DashboardList title="Recent attendance" items={recentAttendance} empty="No attendance records found." columns={["Student", "Date", "Status"]} render={(item) => [valueOf(item, ["studentName", "student"], "Unnamed student"), valueOf(item, ["date"], "—"), valueOf(item, ["status"], "Absent")]} />
      </section>
      <section className="dashboard-insights" aria-label="OJT details">
        <Insight label="Pending evaluations" value={evaluations.filter((item) => String(item.status || "").toLowerCase() === "pending").length} />
        <Insight label="Completed evaluations" value={evaluations.filter((item) => String(item.status || "").toLowerCase() === "completed").length} />
        <Insight label="Total OJT reports" value={reportStats.total} />
        <Insight label="Pending reports" value={reportStats.pending} />
        <Insight label="Completed reports" value={reportStats.completed} />
        <Insight label="Remaining OJT hours" value={Math.max(0, students.reduce((sum, item) => sum + Math.max(0, item.required - item.completed), 0))} />
      </section>
      <section className="dashboard-panel dashboard-actions-panel"><div className="panel-heading"><div><p className="panel-kicker">Shortcuts</p><h2>Quick actions</h2></div></div><div className="dashboard-actions">{[["Add Student", "students"], ["Review Applications", "application"], ["Record Attendance", "attendance"], ["View OJT Hours", "ojthours"], ["Manage Evaluations", "evaluation"], ["Generate Reports", "ojtreports"]].map(([label, path]) => <button type="button" className="dashboard-action" key={path} onClick={() => go(`${basePath}/${path}`)}><FileText size={15} />{label}</button>)}</div></section>
      <section className="dashboard-panel activity-panel"><div className="panel-heading"><div><p className="panel-kicker">What&apos;s happening</p><h2>Recent Activities</h2></div><button type="button" className="text-button" onClick={() => go(`${basePath}/application`)}>View all</button></div><div className="activity-list">{activities.length ? activities.map(({ title, detail, time, icon: Icon }) => <div className="activity-item" key={`${title}-${detail}-${time}`}><div className="activity-icon"><Icon size={16} /></div><div className="activity-copy"><strong>{title}</strong><span>{detail}</span></div><time>{formatTime(time)}</time></div>) : <div className="dashboard-empty">No recent activity.</div>}</div></section>
    </div>
  );
}

function DashboardList({ title, items, empty, columns, render }) {
  return <article className="dashboard-panel dashboard-list-panel"><div className="panel-heading"><h2>{title}</h2></div>{items.length ? <div className="dashboard-list">{items.map((item) => <div className="dashboard-list-row" key={item.id}>{render(item).map((value, index) => <span key={`${item.id}-${columns[index]}`}><small>{columns[index]}</small><strong>{value}</strong></span>)}</div>)}</div> : <div className="dashboard-empty">{empty}</div>}</article>;
}

function Insight({ label, value }) {
  return <article className="dashboard-insight"><span>{label}</span><strong>{value}</strong></article>;
}

export default Dashboard;
