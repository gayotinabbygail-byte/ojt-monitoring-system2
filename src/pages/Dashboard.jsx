import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardClock,
  UserRoundCog,
  Users,
} from "lucide-react";
import { db } from "../services/firebase";
import { useAuth } from "../context/useAuth";
import "../styles/admin-dashboard.css";

const collectionNames = ["students", "attendance", "users"];

function valueOf(record, keys, fallback = "") {
  return (
    keys
      .map((key) => record?.[key])
      .find((value) => value !== undefined && value !== null && value !== "") ??
    fallback
  );
}

function getStudentHours(student, attendance) {
  const keys = [
    valueOf(student, ["studentId", "studentID", "idNumber", "id"]),
    student.id,
    valueOf(student, ["name", "fullName", "studentName"]),
    `${student.firstName || ""} ${student.lastName || ""}`.trim(),
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());

  return attendance.reduce((sum, record) => {
    const attendanceKey = String(
      valueOf(record, ["studentId", "studentID", "student", "studentName"], ""),
    )
      .trim()
      .toLowerCase();
    if (!attendanceKey || !keys.includes(attendanceKey)) return sum;

    const storedHours = Number(record.totalHours ?? record.hours ?? 0);
    if (Number.isFinite(storedHours) && storedHours > 0) return sum + storedHours;
    if (!record.timeIn || !record.timeOut) return sum;
    const [inHour, inMinute] = String(record.timeIn).split(":").map(Number);
    const [outHour, outMinute] = String(record.timeOut).split(":").map(Number);
    const duration =
      (outHour * 60 + outMinute - (inHour * 60 + inMinute)) / 60;
    return Number.isFinite(duration) && duration > 0 ? sum + duration : sum;
  }, 0);
}

function getOjtStatus(student, hours) {
  const status = String(
    valueOf(student, ["ojtStatus", "status", "placementStatus"], ""),
  ).toLowerCase();
  const required = Number(
    valueOf(student, ["requiredHours", "totalRequiredHours", "ojtRequiredHours"], 500),
  );
  if (required > 0 && hours >= required) return "Completed";
  if (
    status.includes("complete") &&
    !status.includes("incomplete") &&
    !status.includes("not complete")
  ) {
    return "Completed";
  }
  if (
    status.includes("ongoing") ||
    status.includes("deployed") ||
    status.includes("progress") ||
    status.includes("active")
  ) {
    return "Ongoing";
  }
  return "Pending";
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ students: [], users: [] });
  const [ready, setReady] = useState({});
  const [sourceErrors, setSourceErrors] = useState({});

  useEffect(() => {
    let active = true;
    const unsubscribers = collectionNames.map((name) => {
      const source =
        name === "users"
          ? query(
              collection(db, name),
              where("role", "==", "coordinator"),
            )
          : collection(db, name);

      return onSnapshot(
        source,
        (snapshot) => {
          if (!active) return;
          setData((current) => ({
            ...current,
            [name]: snapshot.docs.map((document) => ({
              id: document.id,
              ...document.data(),
            })),
          }));
          setReady((current) => ({ ...current, [name]: true }));
          setSourceErrors((current) => {
            const next = { ...current };
            delete next[name];
            return next;
          });
        },
        (error) => {
          console.error(`Unable to load dashboard ${name}:`, error);
          if (!active) return;
          setReady((current) => ({ ...current, [name]: true }));
          setSourceErrors((current) => ({
            ...current,
            [name]: "Data could not be loaded.",
          }));
        },
      );
    });

    return () => {
      active = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  const students = useMemo(
    () =>
      data.students.map((student) => {
        const hours = getStudentHours(student, data.attendance);
        return { ...student, status: getOjtStatus(student, hours) };
      }),
    [data.attendance, data.students],
  );
  const coordinators = data.users.filter((item) => item.role === "coordinator");
  const stats = [
    ["Total Students", students.length, "All student records", Users, "blue", "students"],
    ["OJT Coordinators", coordinators.length, "Active user profiles", UserRoundCog, "amber", "ojtcoordinators"],
    ["Students Currently on OJT", students.filter((item) => item.status === "Ongoing").length, "Ongoing placements", ClipboardClock, "blue", "students"],
    ["Completed OJT", students.filter((item) => item.status === "Completed").length, "Required hours reached", CheckCircle2, "teal", "students"],
  ];
  const loading = collectionNames.some((name) => !ready[name]);
  const go = (path) => navigate(`/admin/${path}`);

  if (user?.role !== "admin") {
    return (
      <div className="admin-dashboard dashboard-state" role="alert">
        Admin access is required to view this dashboard.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-dashboard dashboard-state" role="status">
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <section className="dashboard-intro">
        <div>
          <p className="dashboard-eyebrow">LCCI · OJT MONITORING SYSTEM</p>
          <h1>Admin Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, {user?.firstName || user?.email || "Admin"}! Here is your latest placement overview.
          </p>
        </div>
        <div className="dashboard-date-button">
          <CalendarDays size={16} />
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </section>

      {Object.keys(sourceErrors).length > 0 && (
        <div className="dashboard-error" role="alert">
          Dashboard data could not be loaded for: {Object.keys(sourceErrors).join(", ")}.
          Check the Firestore permissions and network connection.
        </div>
      )}

      <section className="dashboard-stats" aria-label="OJT summary">
        {stats.map(([label, value, detail, Icon, tone, path]) => (
          <button
            type="button"
            className="dashboard-stat"
            key={label}
            onClick={() => go(path)}
            aria-label={`${label}: ${sourceErrors[label === "OJT Coordinators" ? "users" : "students"] || (label.includes("OJT") && sourceErrors.attendance) ? "unavailable" : value}. Open ${path}`}
          >
            <div className={`stat-icon stat-icon-${tone}`}>
              <Icon size={19} />
            </div>
            <div className="stat-copy">
              <p>{label}</p>
              <strong>
                {sourceErrors[label === "OJT Coordinators" ? "users" : "students"] ||
                (label !== "OJT Coordinators" && sourceErrors.attendance)
                  ? "—"
                  : value}
              </strong>
              <span>{detail}</span>
            </div>
            <ArrowUpRight className="stat-arrow" size={17} />
          </button>
        ))}
      </section>
    </div>
  );
}

export default Dashboard;
