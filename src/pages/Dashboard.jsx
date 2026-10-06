import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight, CalendarDays, CheckCircle2,
  ClipboardClock, UserRoundCog, Users,
} from "lucide-react";
import { db } from "../services/firebase";
import { useAuth } from "../context/useAuth";
import "../styles/admin-dashboard.css";

const sources = ["students", "users"];

function valueOf(record, keys, fallback = "") {
  return keys.map((key) => record[key]).find((value) => value !== undefined && value !== null && value !== "") ?? fallback;
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
  const coordinators = data.users.filter((item) => item.role === "coordinator");
  const stats = [
    ["Total Students", students.length, "All student records", Users, "blue"],
    ["OJT Coordinators", coordinators.length, "Active user profiles", UserRoundCog, "amber"],
    ["Students Currently on OJT", students.filter((item) => item.status === "Ongoing").length, "Ongoing placements", ClipboardClock, "blue"],
    ["Completed OJT", students.filter((item) => item.status === "Completed").length, "Required hours reached", CheckCircle2, "teal"],
  ];
  const statPaths = {
    "Total Students": "students",
    "OJT Coordinators": "ojtcoordinators",
    "Students Currently on OJT": "students",
    "Completed OJT": "students",
  };

  const go = (path) => navigate(path);
  const basePath = user?.role === "coordinator" ? "/coordinator" : "/admin";
  if (loading) return <div className="admin-dashboard dashboard-state">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <section className="dashboard-intro">
        <div><p className="dashboard-eyebrow">LCCI · OJT MONITORING SYSTEM</p><h1>{user?.role === "coordinator" ? "Coordinator Dashboard" : "Admin Dashboard"}</h1><p className="dashboard-subtitle">Welcome back, {user?.firstName || user?.email || "User"}! Here is your latest placement overview.</p></div>
        <button type="button" className="dashboard-date-button"><CalendarDays size={16} />{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</button>
      </section>
      {failedSources.length > 0 && <div className="dashboard-error" role="alert">Unable to load: {failedSources.join(", ")}. Check the Firestore permissions for these collections.</div>}
      <section className="dashboard-stats" aria-label="OJT summary">{stats.map(([label, value, detail, Icon, tone]) => <button type="button" className="dashboard-stat" key={label} onClick={() => go(`${basePath}/${statPaths[label]}`)}><div className={`stat-icon stat-icon-${tone}`}><Icon size={19} /></div><div className="stat-copy"><p>{label}</p><strong>{value}</strong><span>{detail}</span></div><ArrowUpRight className="stat-arrow" size={17} /></button>)}</section>
    </div>
  );
}

export default Dashboard;
