import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  MapPin,
  Plus,
  Upload,
  UserCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import "../../styles/student-portal.css";

const studentProfile = {
  name: "Juan Dela Cruz",
  studentId: "2024-00123",
  program: "BS Information Technology",
  yearLevel: "4th Year",
  company: "ABC Technologies Inc.",
  companySupervisor: "Maria Santos",
  facultyCoordinator: "Prof. John Reyes",
  office: "Software Development Unit",
  startDate: "2025-06-03",
  expectedEndDate: "2025-12-15",
  requiredHours: 486,
  completedHours: 320,
  remainingHours: 166,
  attendance: {
    present: 18,
    absences: 2,
    late: 4,
    today: "On time",
  },
};

const attendanceHistory = [
  { date: "Sep 18, 2026", timeIn: "08:10 AM", timeOut: "05:15 PM", total: "8h 05m", status: "Present" },
  { date: "Sep 17, 2026", timeIn: "08:28 AM", timeOut: "05:05 PM", total: "7h 37m", status: "Late" },
  { date: "Sep 16, 2026", timeIn: "08:00 AM", timeOut: "05:00 PM", total: "9h 00m", status: "Present" },
  { date: "Sep 15, 2026", timeIn: "08:20 AM", timeOut: "04:50 PM", total: "7h 30m", status: "Late" },
];

const recentReports = [
  { title: "Weekly Accomplishment Report #6", submitted: "Sep 18, 2026", status: "Approved" },
  { title: "Weekly Accomplishment Report #5", submitted: "Sep 11, 2026", status: "Pending" },
  { title: "Midterm OJT Reflection", submitted: "Sep 07, 2026", status: "Reviewed" },
];

const recentDocuments = [
  { name: "Daily Time Record", date: "Sep 18, 2026", status: "Submitted" },
  { name: "Endorsement Letter", date: "Sep 12, 2026", status: "Approved" },
  { name: "Weekly Report PDF", date: "Sep 10, 2026", status: "Pending Review" },
];

const notifications = [
  { title: "Report due soon", detail: "Weekly report due this Friday at 5:00 PM", type: "info" },
  { title: "Supervisor reminder", detail: "Please update your daily attendance before 9:00 AM", type: "warning" },
  { title: "Documents verified", detail: "Your medical certificate has been approved.", type: "success" },
];

function StudentsDashboard() {
  const progressPercent = Math.round((studentProfile.completedHours / studentProfile.requiredHours) * 100);

  const summaryStats = useMemo(
    () => [
      { label: "OJT Status", value: "Active", trend: "positive" },
      { label: "Completed Hours", value: `${studentProfile.completedHours}h`, trend: "positive" },
      { label: "Attendance", value: `${Math.round((studentProfile.attendance.present / 22) * 100)}%`, trend: "neutral" },
      { label: "Remaining", value: `${studentProfile.remainingHours}h`, trend: "neutral" },
    ],
    []
  );

  const [isTimeIn, setIsTimeIn] = useState(false);
  const [isTimeOut, setIsTimeOut] = useState(false);

  const handleTimeIn = () => {
    setIsTimeIn(true);
    setIsTimeOut(false);
  };

  const handleTimeOut = () => {
    setIsTimeOut(true);
  };

  return (
    <div className="student-portal-page">
      <header className="student-page-header">
        <div>
          <p className="student-meta">Student portal</p>
          <h1>Welcome back, {studentProfile.name.split(" ")[0]}!</h1>
          <p>Track your OJT progress, attendance, and required submissions.</p>
        </div>
        <div className="student-header-actions">
          <button type="button" className="student-button secondary" onClick={handleTimeIn}>
            <Clock3 size={15} />
            {isTimeIn ? "Clocked In" : "Time In"}
          </button>
          <button type="button" className="student-button primary" onClick={handleTimeOut}>
            <CheckCircle2 size={15} />
            {isTimeOut ? "Clocked Out" : "Time Out"}
          </button>
        </div>
      </header>

      <section className="student-overview-grid">
        {summaryStats.map((item) => (
          <div className="student-card student-stat-card" key={item.label}>
            <p className="student-stat-label">{item.label}</p>
            <div className="student-stat-value">
              <strong>{item.value}</strong>
              <span className={`student-stat-trend ${item.trend}`}>{item.trend === "positive" ? "Good" : "Current"}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="student-profile-hero">
        <div className="student-card student-profile-summary">
          <div className="student-avatar">JD</div>
          <div>
            <div className="student-pills" style={{ marginBottom: "8px" }}>
              <span className="status-badge active">Active OJT</span>
            </div>
            <h2>{studentProfile.name}</h2>
            <p>{studentProfile.studentId} • {studentProfile.program}</p>
            <p>{studentProfile.yearLevel}</p>
          </div>
        </div>

        <div className="student-card student-panel">
          <div className="student-panel-header">
            <div>
              <p className="student-panel-subtitle">Placement details</p>
              <h2 className="student-panel-title">OJT Information</h2>
            </div>
            <MapPin size={18} color="#2868c7" />
          </div>

          <div className="student-metric-list">
            <div className="student-metric-item">
              <strong>{studentProfile.company}</strong>
              <span className="student-meta">Company</span>
            </div>
            <div className="student-metric-item">
              <strong>{studentProfile.companySupervisor}</strong>
              <span className="student-meta">Supervisor</span>
            </div>
            <div className="student-metric-item">
              <strong>{studentProfile.facultyCoordinator}</strong>
              <span className="student-meta">Faculty Coordinator</span>
            </div>
          </div>
        </div>
      </section>

      <section className="student-grid-two">
        <div className="student-card student-panel">
          <div className="student-panel-header">
            <div>
              <p className="student-panel-subtitle">Progress overview</p>
              <h2 className="student-panel-title">Required OJT Hours</h2>
            </div>
            <CalendarClock size={18} color="#2868c7" />
          </div>

          <div className="progress-wrap">
            <div className="progress-label">
              <span>Completed hours</span>
              <strong>{progressPercent}%</strong>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="student-summary-grid" style={{ marginTop: "18px" }}>
            <div className="student-card student-stat-card">
              <p className="student-stat-label">Required</p>
              <div className="student-stat-value">
                <strong>{studentProfile.requiredHours}</strong>
              </div>
            </div>
            <div className="student-card student-stat-card">
              <p className="student-stat-label">Completed</p>
              <div className="student-stat-value">
                <strong>{studentProfile.completedHours}</strong>
              </div>
            </div>
            <div className="student-card student-stat-card">
              <p className="student-stat-label">Remaining</p>
              <div className="student-stat-value">
                <strong>{studentProfile.remainingHours}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="student-card student-panel">
          <div className="student-panel-header">
            <div>
              <p className="student-panel-subtitle">Attendance summary</p>
              <h2 className="student-panel-title">Daily Monitoring</h2>
            </div>
            <Bell size={18} color="#2868c7" />
          </div>

          <div className="student-metric-list">
            <div className="student-metric-item">
              <strong>{studentProfile.attendance.present}</strong>
              <span className="student-meta">Present days</span>
            </div>
            <div className="student-metric-item">
              <strong>{studentProfile.attendance.absences}</strong>
              <span className="student-meta">Absences</span>
            </div>
            <div className="student-metric-item">
              <strong>{studentProfile.attendance.late}</strong>
              <span className="student-meta">Late arrivals</span>
            </div>
          </div>
        </div>
      </section>

      <section className="student-grid-two" style={{ marginTop: "18px" }}>
        <div className="student-card student-panel">
          <div className="student-panel-header">
            <div>
              <p className="student-panel-subtitle">Recent entries</p>
              <h2 className="student-panel-title">Recent Attendance Records</h2>
            </div>
            <ArrowRight size={18} color="#2868c7" />
          </div>

          <table className="student-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>In</th>
                <th>Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.map((record) => (
                <tr key={record.date}>
                  <td>{record.date}</td>
                  <td>{record.timeIn}</td>
                  <td>{record.timeOut}</td>
                  <td>
                    <span className={
                      record.status === "Present" ? "status-badge active" : "status-badge pending"
                    }>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="student-card student-panel">
          <div className="student-panel-header">
            <div>
              <p className="student-panel-subtitle">Submitted work</p>
              <h2 className="student-panel-title">Recent Reports</h2>
            </div>
            <FileText size={18} color="#2868c7" />
          </div>

          <ul className="student-notification-list">
            {recentReports.map((report) => (
              <li key={report.title}>
                <div className="student-notification-item">
                  <strong>{report.title}</strong>
                  <span>{report.submitted}</span>
                </div>
                <span className={
                  report.status === "Approved"
                    ? "status-badge active"
                    : report.status === "Pending"
                      ? "status-badge pending"
                      : "status-badge completed"
                }>
                  {report.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="student-grid-two" style={{ marginTop: "18px" }}>
        <div className="student-card student-panel">
          <div className="student-panel-header">
            <div>
              <p className="student-panel-subtitle">Files</p>
              <h2 className="student-panel-title">Recent Documents</h2>
            </div>
            <FolderOpen size={18} color="#2868c7" />
          </div>

          <ul className="student-notification-list">
            {recentDocuments.map((doc) => (
              <li key={doc.name}>
                <div className="student-notification-item">
                  <strong>{doc.name}</strong>
                  <span>{doc.date}</span>
                </div>
                <span className={
                  doc.status === "Submitted" || doc.status === "Approved"
                    ? "status-badge active"
                    : doc.status === "Pending Review"
                      ? "status-badge pending"
                      : "status-badge completed"
                }>
                  {doc.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="student-card student-panel">
          <div className="student-panel-header">
            <div>
              <p className="student-panel-subtitle">Announcements</p>
              <h2 className="student-panel-title">Notifications</h2>
            </div>
            <AlertCircle size={18} color="#2868c7" />
          </div>

          <ul className="student-notification-list">
            {notifications.map((notify) => (
              <li key={notify.title}>
                <div className="student-notification-item">
                  <strong>{notify.title}</strong>
                  <span>{notify.detail}</span>
                </div>
                <span className={
                  notify.type === "warning" ? "status-badge pending" : notify.type === "success" ? "status-badge active" : "status-badge completed"
                }>
                  {notify.type}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="student-panel student-card" style={{ marginTop: "18px" }}>
        <div className="student-panel-header">
          <div>
            <p className="student-panel-subtitle">Quick actions</p>
            <h2 className="student-panel-title">Manage your OJT tasks</h2>
          </div>
        </div>

        <div className="student-header-actions">
          <button type="button" className="student-button primary" onClick={handleTimeIn}>
            <Clock3 size={15} /> Time In
          </button>
          <button type="button" className="student-button secondary" onClick={handleTimeOut}>
            <CheckCircle2 size={15} /> Time Out
          </button>
          <button type="button" className="student-button">
            <FileText size={15} /> Submit Report
          </button>
          <button type="button" className="student-button">
            <Upload size={15} /> Upload Document
          </button>
          <button type="button" className="student-button">
            <UserCheck size={15} /> View Progress
          </button>
          <button type="button" className="student-button danger">
            <Plus size={15} /> Add Note
          </button>
        </div>
      </section>
    </div>
  );
}

export default StudentsDashboard;
