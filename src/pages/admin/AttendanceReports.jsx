import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Download,
  Eye,
  FileBarChart,
  Printer,
  Search,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import "../../styles/attendance-reports-management.css";

const statuses = ["Present", "Late", "Absent", "Excused"];
const today = () => new Date().toISOString().slice(0, 10);

function field(record, keys, fallback = "") {
  return (
    keys
      .map((key) => record[key])
      .find((value) => value !== undefined && value !== null && value !== "") ??
    fallback
  );
}

function normalizeStatus(status) {
  return status === "Incomplete" ? "Excused" : status || "Excused";
}

function normalizeRecord(record, students) {
  const studentId = field(record, ["studentId", "studentID"], "");
  const student = students.find(
    (item) =>
      field(item, ["studentId", "studentID", "idNumber", "id"], "") ===
      studentId,
  );
  return {
    ...record,
    date: field(record, ["date"], ""),
    studentId,
    studentName: field(
      record,
      ["studentName", "student"],
      field(student, ["name", "fullName", "studentName"], "Unnamed student"),
    ),
    course: field(
      record,
      ["course", "program", "courseProgram"],
      field(student, ["course", "program", "courseProgram"], "Not specified"),
    ),
    company: field(
      record,
      ["company", "partnerCompany"],
      field(
        student,
        ["company", "partnerCompany", "companyName"],
        "Not assigned",
      ),
    ),
    timeIn: field(record, ["timeIn"], ""),
    timeOut: field(record, ["timeOut"], ""),
    totalHours: Number(field(record, ["totalHours", "hours"], 0)),
    status: normalizeStatus(record.status),
    remarks: field(record, ["remarks", "note"], ""),
  };
}

function inRange(date, range, start, end) {
  if (!date || range === "All dates") return true;
  if (range === "Custom")
    return (!start || date >= start) && (!end || date <= end);
  const current = new Date(`${today()}T00:00:00`);
  const target = new Date(`${date}T00:00:00`);
  if (range === "Daily") return date === today();
  if (range === "Weekly") {
    const first = new Date(current);
    first.setDate(current.getDate() - current.getDay());
    const last = new Date(first);
    last.setDate(first.getDate() + 6);
    return target >= first && target <= last;
  }
  if (range === "Monthly")
    return (
      target.getFullYear() === current.getFullYear() &&
      target.getMonth() === current.getMonth()
    );
  return true;
}

function AttendanceReports() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("All dates");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [studentFilter, setStudentFilter] = useState("All students");
  const [companyFilter, setCompanyFilter] = useState("All companies");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let studentsReady = false;
    let attendanceReady = false;
    const finish = () => {
      if (studentsReady && attendanceReady) setLoading(false);
    };
    const unsubscribeStudents = onSnapshot(
      collection(db, "students"),
      (snapshot) => {
        setStudents(
          snapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
        );
        studentsReady = true;
        finish();
      },
      (snapshotError) => {
        console.error(
          "Unable to load students for attendance reports:",
          snapshotError,
        );
        setError("Unable to load attendance reports.");
        studentsReady = true;
        finish();
      },
    );
    const unsubscribeAttendance = onSnapshot(
      collection(db, "attendance"),
      (snapshot) => {
        setRecords(
          snapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
        );
        attendanceReady = true;
        finish();
      },
      (snapshotError) => {
        console.error("Unable to load attendance reports:", snapshotError);
        setError("Unable to load attendance reports.");
        attendanceReady = true;
        finish();
      },
    );
    return () => {
      unsubscribeStudents();
      unsubscribeAttendance();
    };
  }, []);

  const rows = useMemo(
    () => records.map((record) => normalizeRecord(record, students)),
    [records, students],
  );
  const studentsList = useMemo(
    () => ["All students", ...new Set(rows.map((row) => row.studentName))],
    [rows],
  );
  const companies = useMemo(
    () => ["All companies", ...new Set(rows.map((row) => row.company))],
    [rows],
  );
  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const query = search.trim().toLowerCase();
        return (
          (!query ||
            `${row.studentName} ${row.studentId}`
              .toLowerCase()
              .includes(query)) &&
          inRange(row.date, dateRange, startDate, endDate) &&
          (studentFilter === "All students" ||
            row.studentName === studentFilter) &&
          (companyFilter === "All companies" ||
            row.company === companyFilter) &&
          (statusFilter === "All statuses" || row.status === statusFilter)
        );
      }),
    [
      companyFilter,
      dateRange,
      endDate,
      rows,
      search,
      startDate,
      statusFilter,
      studentFilter,
    ],
  );

  const summary = useMemo(
    () => ({
      students: new Set(rows.map((row) => row.studentId || row.studentName))
        .size,
      present: rows.filter((row) => row.status === "Present").length,
      absent: rows.filter((row) => row.status === "Absent").length,
      late: rows.filter((row) => row.status === "Late").length,
      total: rows.length,
    }),
    [rows],
  );

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  };
  const clearFilters = () => {
    setSearch("");
    setDateRange("All dates");
    setStartDate("");
    setEndDate("");
    setStudentFilter("All students");
    setCompanyFilter("All companies");
    setStatusFilter("All statuses");
  };
  const studentDetails = (row) => {
    const studentRows = rows.filter(
      (item) =>
        item.studentId === row.studentId ||
        item.studentName === row.studentName,
    );
    const present = studentRows.filter(
      (item) => item.status === "Present",
    ).length;
    return {
      ...row,
      studentRows,
      present,
      absent: studentRows.filter((item) => item.status === "Absent").length,
      late: studentRows.filter((item) => item.status === "Late").length,
      totalHours: studentRows.reduce((sum, item) => sum + item.totalHours, 0),
      percentage: studentRows.length
        ? Math.round((present / studentRows.length) * 100)
        : 0,
    };
  };
  const printReport = (targetRows = filteredRows, student = null) => {
    if (!targetRows.length) {
      showNotice("There are no attendance records to report.");
      return;
    }
    const summaryRows = {
      present: targetRows.filter((row) => row.status === "Present").length,
      late: targetRows.filter((row) => row.status === "Late").length,
      absent: targetRows.filter((row) => row.status === "Absent").length,
      hours: targetRows.reduce((sum, row) => sum + row.totalHours, 0),
    };
    const percentage = targetRows.length
      ? Math.round((summaryRows.present / targetRows.length) * 100)
      : 0;
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      setError("Allow pop-ups to print the attendance report.");
      return;
    }
    const title = student
      ? `${student.studentName} Attendance Report`
      : "Attendance Report";
    const rowsMarkup = targetRows
      .map(
        (row) =>
          `<tr><td>${row.date || "—"}</td><td>${row.studentName}</td><td>${row.studentId || "—"}</td><td>${row.timeIn || "—"}</td><td>${row.timeOut || "—"}</td><td>${row.totalHours}</td><td>${row.status}</td><td>${row.remarks || "—"}</td></tr>`,
      )
      .join("");
    printWindow.document.write(
      `<html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;color:#172033;padding:30px}h1{color:#2868c7}table{width:100%;border-collapse:collapse;font-size:11px}th,td{padding:7px;border:1px solid #dbe3ed;text-align:left}th{background:#f3f8ff}.summary{margin:20px 0;display:flex;gap:20px}button{padding:10px 16px;background:#2868c7;color:#fff;border:0;border-radius:5px}@media print{button{display:none}}</style></head><body><button onclick="window.print()">${student ? "Print / Save PDF" : "Print / Save PDF"}</button><h1>La Consolacion College Isabela</h1><h2>OJT Monitoring System</h2><h2>Attendance Report</h2><p><strong>Student:</strong> ${student?.studentName || "All students"}</p><div class="summary"><span>Present: ${summaryRows.present}</span><span>Late: ${summaryRows.late}</span><span>Absent: ${summaryRows.absent}</span><span>Total Hours: ${summaryRows.hours}</span><span>Attendance: ${percentage}%</span></div><table><thead><tr><th>Date</th><th>Student Name</th><th>Student ID</th><th>Time In</th><th>Time Out</th><th>Total Hours</th><th>Status</th><th>Remarks</th></tr></thead><tbody>${rowsMarkup}</tbody></table></body></html>`,
    );
    printWindow.document.close();
  };
  const exportCsv = () => {
    if (!filteredRows.length) {
      showNotice("There are no attendance records to export.");
      return;
    }
    const csvRows = [
      [
        "Date",
        "Student Name",
        "Student ID",
        "Partner Company",
        "Time In",
        "Time Out",
        "Total Hours",
        "Status",
        "Remarks",
      ],
      ...filteredRows.map((row) => [
        row.date,
        row.studentName,
        row.studentId,
        row.company,
        row.timeIn,
        row.timeOut,
        row.totalHours,
        row.status,
        row.remarks,
      ]),
    ];
    const csv = csvRows
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    link.download = "attendance-report.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    showNotice("Attendance report exported.");
  };

  return (
    <main className="attendance-reports-management">
      <header className="attendance-reports-management-header">
        <div>
          <p>OJT monitoring · reporting center</p>
          <h1>Attendance Reports</h1>
          <span>
            Analyze attendance records and generate coordinator-ready reports.
          </span>
        </div>
        <div className="attendance-reports-actions">
          <button
            type="button"
            className="attendance-reports-secondary"
            onClick={exportCsv}
          >
            <Download size={15} /> Export Report
          </button>
          <button
            type="button"
            className="attendance-reports-primary"
            onClick={() => printReport()}
          >
            <FileBarChart size={16} /> Generate Attendance Report
          </button>
        </div>
      </header>
      <section className="attendance-reports-summary">
        <article>
          <Users size={19} />
          <div>
            <small>Total Students</small>
            <strong>{summary.students}</strong>
          </div>
        </article>
        <article>
          <CheckCircle2 size={19} />
          <div>
            <small>Present</small>
            <strong>{summary.present}</strong>
          </div>
        </article>
        <article>
          <XCircle size={19} />
          <div>
            <small>Absent</small>
            <strong>{summary.absent}</strong>
          </div>
        </article>
        <article>
          <CalendarDays size={19} />
          <div>
            <small>Late</small>
            <strong>{summary.late}</strong>
          </div>
        </article>
        <article>
          <FileBarChart size={19} />
          <div>
            <small>Total Attendance Records</small>
            <strong>{summary.total}</strong>
          </div>
        </article>
      </section>
      <section className="attendance-reports-panel">
        <div className="attendance-reports-section-heading">
          <div>
            <p>Report builder</p>
            <h2>Attendance Report Filters</h2>
          </div>
          <button
            type="button"
            className="attendance-reports-clear"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
        <div className="attendance-reports-filters">
          <label className="attendance-reports-search">
            <span>Search student</span>
            <div>
              <Search size={15} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name or Student ID"
              />
            </div>
          </label>
          <label>
            <span>Date range</span>
            <select
              value={dateRange}
              onChange={(event) => setDateRange(event.target.value)}
            >
              <option>All dates</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Custom</option>
            </select>
          </label>
          {dateRange === "Custom" && (
            <>
              <label>
                <span>From</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </label>
              <label>
                <span>To</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </label>
            </>
          )}
          <label>
            <span>Student</span>
            <select
              value={studentFilter}
              onChange={(event) => setStudentFilter(event.target.value)}
            >
              {studentsList.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Partner company</span>
            <select
              value={companyFilter}
              onChange={(event) => setCompanyFilter(event.target.value)}
            >
              {companies.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Attendance status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All statuses</option>
              {statuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="attendance-reports-filter-actions">
          <button
            type="button"
            className="attendance-reports-primary"
            onClick={() => printReport()}
          >
            <Printer size={15} /> Print Report
          </button>
          <button
            type="button"
            className="attendance-reports-secondary"
            onClick={exportCsv}
          >
            <Download size={15} /> Download / Export
          </button>
        </div>
      </section>
      <section className="attendance-reports-panel attendance-reports-table-panel">
        <div className="attendance-reports-section-heading">
          <div>
            <p>Filtered records</p>
            <h2>Attendance Report Table</h2>
          </div>
          <span>{filteredRows.length} records</span>
        </div>
        {error && (
          <div className="attendance-reports-error" role="alert">
            Unable to load attendance reports.
          </div>
        )}
        {loading ? (
          <div className="attendance-reports-empty">
            Loading attendance reports...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="attendance-reports-empty">
            No attendance records found.
          </div>
        ) : (
          <div className="attendance-reports-table-wrap">
            <table className="attendance-reports-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Partner Company</th>
                  <th>Time In</th>
                  <th>Time Out</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date || "—"}</td>
                    <td>
                      <strong>{row.studentName}</strong>
                      <small>{row.course}</small>
                    </td>
                    <td>{row.studentId || "—"}</td>
                    <td>{row.company}</td>
                    <td>{row.timeIn || "—"}</td>
                    <td>{row.timeOut || "—"}</td>
                    <td>{row.totalHours}</td>
                    <td>
                      <span
                        className={`attendance-report-status ${row.status.toLowerCase()}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td>{row.remarks || "—"}</td>
                    <td>
                      <button
                        type="button"
                        className="attendance-reports-view"
                        title="View details"
                        onClick={() => setSelected(studentDetails(row))}
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {selected && (
        <div
          className="attendance-reports-backdrop"
          role="presentation"
          onClick={(event) =>
            event.target === event.currentTarget && setSelected(null)
          }
        >
          <section
            className="attendance-reports-modal"
            role="dialog"
            aria-modal="true"
          >
            <header>
              <div>
                <p>Student attendance details</p>
                <h2>{selected.studentName}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </header>
            <div className="attendance-reports-details">
              <div>
                <small>Student ID</small>
                <strong>{selected.studentId || "—"}</strong>
              </div>
              <div>
                <small>Course / Program</small>
                <strong>{selected.course}</strong>
              </div>
              <div>
                <small>Partner Company</small>
                <strong>{selected.company}</strong>
              </div>
              <div>
                <small>Total Attendance Days</small>
                <strong>{selected.studentRows.length}</strong>
              </div>
              <div>
                <small>Present Days</small>
                <strong>{selected.present}</strong>
              </div>
              <div>
                <small>Late Days</small>
                <strong>{selected.late}</strong>
              </div>
              <div>
                <small>Absent Days</small>
                <strong>{selected.absent}</strong>
              </div>
              <div>
                <small>Total OJT Hours</small>
                <strong>{selected.totalHours}</strong>
              </div>
              <div className="attendance-reports-percentage">
                <small>Attendance Percentage</small>
                <strong>{selected.percentage}%</strong>
              </div>
            </div>
            <footer>
              <button
                type="button"
                className="attendance-reports-secondary"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="attendance-reports-primary"
                onClick={() => printReport(selected.studentRows, selected)}
              >
                <Printer size={15} /> Generate Report
              </button>
            </footer>
          </section>
        </div>
      )}
      {notice && (
        <div className="attendance-reports-notice" role="status">
          {notice}
        </div>
      )}
    </main>
  );
}

export default AttendanceReports;
