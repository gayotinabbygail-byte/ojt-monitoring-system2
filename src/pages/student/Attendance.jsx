import { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Clock3, Search, TimerReset } from "lucide-react";
import "../../styles/student-portal.css";

const attendanceSeed = [
  { date: "2026-09-18", timeIn: "08:10 AM", timeOut: "05:15 PM", totalHours: "8h 05m", status: "Present" },
  { date: "2026-09-17", timeIn: "08:28 AM", timeOut: "05:05 PM", totalHours: "7h 37m", status: "Late" },
  { date: "2026-09-16", timeIn: "08:00 AM", timeOut: "05:00 PM", totalHours: "9h 00m", status: "Present" },
  { date: "2026-09-15", timeIn: "08:20 AM", timeOut: "04:50 PM", totalHours: "7h 30m", status: "Late" },
  { date: "2026-09-12", timeIn: "08:10 AM", timeOut: "05:10 PM", totalHours: "8h 00m", status: "Present" },
  { date: "2026-09-11", timeIn: "08:00 AM", timeOut: "05:00 PM", totalHours: "9h 00m", status: "Present" },
  { date: "2026-09-10", timeIn: "---", timeOut: "---", totalHours: "0h 00m", status: "Absent" },
  { date: "2026-09-09", timeIn: "08:05 AM", timeOut: "05:15 PM", totalHours: "8h 10m", status: "Present" },
];

const formatDateLabel = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function Attendance() {
  const [search, setSearch] = useState("");
  const [timeInStatus, setTimeInStatus] = useState(false);
  const [timeOutStatus, setTimeOutStatus] = useState(false);

  const filteredRecords = useMemo(() => {
    if (!search.trim()) return attendanceSeed;
    return attendanceSeed.filter((record) =>
      record.date.includes(search.trim()) || record.status.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [search]);

  const presentCount = attendanceSeed.filter((item) => item.status === "Present").length;
  const lateCount = attendanceSeed.filter((item) => item.status === "Late").length;
  const absentCount = attendanceSeed.filter((item) => item.status === "Absent").length;
  const todayHours = "8h 05m";
  const accumulatedHours = "320h 00m";

  const handleTimeIn = () => setTimeInStatus((current) => !current);
  const handleTimeOut = () => setTimeOutStatus((current) => !current);

  return (
    <div className="student-portal-page">
      <header className="student-page-header">
        <div>
          <p className="student-meta">Daily attendance</p>
          <h1>Attendance & DTR</h1>
        </div>
        <div className="student-header-actions">
          <button type="button" className="student-button secondary" onClick={handleTimeIn}>
            <Clock3 size={15} />
            {timeInStatus ? "Timed In" : "Time In"}
          </button>
          <button type="button" className="student-button primary" onClick={handleTimeOut}>
            <TimerReset size={15} />
            {timeOutStatus ? "Timed Out" : "Time Out"}
          </button>
        </div>
      </header>

      <section className="student-overview-grid">
        <div className="student-card student-stat-card">
          <p className="student-stat-label">Current date</p>
          <div className="student-stat-value">
            <strong>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong>
            <span className="student-stat-trend positive">Today</span>
          </div>
        </div>
        <div className="student-card student-stat-card">
          <p className="student-stat-label">Time In</p>
          <div className="student-stat-value">
            <strong>{timeInStatus ? "08:10 AM" : "Not yet"}</strong>
            <span className="student-stat-trend neutral">Status</span>
          </div>
        </div>
        <div className="student-card student-stat-card">
          <p className="student-stat-label">Time Out</p>
          <div className="student-stat-value">
            <strong>{timeOutStatus ? "05:15 PM" : "Pending"}</strong>
            <span className="student-stat-trend neutral">Status</span>
          </div>
        </div>
        <div className="student-card student-stat-card">
          <p className="student-stat-label">Today's hours</p>
          <div className="student-stat-value">
            <strong>{todayHours}</strong>
            <span className="student-stat-trend positive">On track</span>
          </div>
        </div>
      </section>

      <section className="student-grid-two">
        <div className="student-card student-panel">
          <div className="student-panel-header">
            <div>
              <p className="student-panel-subtitle">Today</p>
              <h2 className="student-panel-title">Attendance Status</h2>
            </div>
            <CheckCircle2 size={18} color="#208d67" />
          </div>

          <div className="student-warning-box">
            <span>{timeInStatus && timeOutStatus ? "Your attendance was successfully recorded today." : "Please log your attendance before leaving the workplace."}</span>
          </div>

          <div className="student-summary-grid" style={{ marginTop: "18px" }}>
            <div className="student-card student-stat-card">
              <p className="student-stat-label">Total today</p>
              <div className="student-stat-value">
                <strong>{todayHours}</strong>
              </div>
            </div>
            <div className="student-card student-stat-card">
              <p className="student-stat-label">Accumulated</p>
              <div className="student-stat-value">
                <strong>{accumulatedHours}</strong>
              </div>
            </div>
            <div className="student-card student-stat-card">
              <p className="student-stat-label">Status</p>
              <div className="student-stat-value">
                <strong>{timeInStatus ? "Present" : "Pending"}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="student-card student-panel">
          <div className="student-panel-header">
            <div>
              <p className="student-panel-subtitle">Summary</p>
              <h2 className="student-panel-title">Monthly Attendance</h2>
            </div>
            <CalendarClock size={18} color="#2868c7" />
          </div>

          <div className="student-metric-list">
            <div className="student-metric-item">
              <strong>{presentCount}</strong>
              <span className="student-meta">Present</span>
            </div>
            <div className="student-metric-item">
              <strong>{absentCount}</strong>
              <span className="student-meta">Absent</span>
            </div>
            <div className="student-metric-item">
              <strong>{lateCount}</strong>
              <span className="student-meta">Late</span>
            </div>
          </div>
        </div>
      </section>

      <section className="student-card student-panel" style={{ marginTop: "18px" }}>
        <div className="student-panel-header">
          <div>
            <p className="student-panel-subtitle">History</p>
            <h2 className="student-panel-title">Attendance Records</h2>
          </div>
          <div className="student-field" style={{ minWidth: "220px" }}>
            <label htmlFor="attendanceSearch" style={{ display: "none" }}>Search</label>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "10px", color: "#718096" }} />
              <input
                id="attendanceSearch"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by date or status"
                style={{ paddingLeft: "32px" }}
              />
            </div>
          </div>
        </div>

        <table className="student-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Total Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <div className="student-empty-state">No attendance records match your search.</div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.date}>
                  <td>{formatDateLabel(record.date)}</td>
                  <td>{record.timeIn}</td>
                  <td>{record.timeOut}</td>
                  <td>{record.totalHours}</td>
                  <td>
                    <span className={
                      record.status === "Present"
                        ? "status-badge active"
                        : record.status === "Late"
                          ? "status-badge pending"
                          : "status-badge absent"
                    }>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Attendance;
