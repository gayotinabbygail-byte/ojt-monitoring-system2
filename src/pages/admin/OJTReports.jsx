import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Download,
  Edit3,
  Eye,
  FileText,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import "../../styles/ojt-reports-management.css";

const statuses = ["Ongoing", "Completed", "Pending"];

function valueOf(record, keys, fallback = "") {
  return keys.map((key) => record[key]).find((value) => value !== undefined && value !== null && value !== "") ?? fallback;
}

function dateValue(value) {
  if (!value) return "";
  if (typeof value.toDate === "function") return value.toDate().toISOString().slice(0, 10);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function normalizeStatus(student, hours, required) {
  const status = String(valueOf(student, ["ojtStatus", "status", "placementStatus"], "")).toLowerCase();
  if (status.includes("complete") || (required > 0 && hours >= required)) return "Completed";
  if (status.includes("pending") || status.includes("not started")) return "Pending";
  return "Ongoing";
}

function normalizeReport(student, attendance) {
  const studentId = valueOf(student, ["studentId", "studentID", "idNumber", "id"], "");
  const attendanceRows = attendance.filter((record) => valueOf(record, ["studentId", "studentID", "student"], "") === studentId);
  const hours = Number(valueOf(student, ["completedHours", "ojtHours", "hoursCompleted", "hours"], attendanceRows.reduce((sum, record) => sum + Number(record.totalHours ?? record.hours ?? 0), 0)));
  const required = Number(valueOf(student, ["requiredHours", "totalRequiredHours", "ojtRequiredHours"], 500));
  const name = valueOf(student, ["name", "fullName", "studentName"], `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Unnamed student");
  return {
    id: student.id,
    studentId,
    student: name,
    course: valueOf(student, ["course", "program", "courseProgram"], "Not specified"),
    company: valueOf(student, ["company", "partnerCompany", "companyName"], "Not assigned"),
    startDate: dateValue(valueOf(student, ["startDate", "ojtStartDate", "deploymentDate"])),
    endDate: dateValue(valueOf(student, ["endDate", "ojtEndDate", "completionDate"])),
    hours,
    required,
    status: normalizeStatus(student, hours, required),
    evaluation: valueOf(student, ["evaluationStatus", "evaluation"], "Not recorded"),
    studentRecord: student,
    attendanceRows,
  };
}

function formatDate(value) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
}

function OJTReports() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [company, setCompany] = useState("All companies");
  const [year, setYear] = useState("All years");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ startDate: "", endDate: "", requiredHours: 500, status: "Ongoing", evaluationStatus: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let studentsReady = false;
    let attendanceReady = false;
    const finish = () => { if (studentsReady && attendanceReady) setLoading(false); };
    const unsubscribeStudents = onSnapshot(collection(db, "students"), (snapshot) => {
      setStudents(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      studentsReady = true;
      finish();
    }, (snapshotError) => {
      console.error("Unable to load OJT students:", snapshotError);
      setError("OJT student reports could not be loaded. Check your Firestore permissions.");
      studentsReady = true;
      finish();
    });
    const unsubscribeAttendance = onSnapshot(collection(db, "attendance"), (snapshot) => {
      setAttendance(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      attendanceReady = true;
      finish();
    }, (snapshotError) => {
      console.error("Unable to load attendance for OJT reports:", snapshotError);
      setError("Attendance totals could not be loaded. Check your Firestore permissions.");
      attendanceReady = true;
      finish();
    });
    return () => { unsubscribeStudents(); unsubscribeAttendance(); };
  }, []);

  const reports = useMemo(() => students.map((student) => normalizeReport(student, attendance)), [attendance, students]);
  const companies = useMemo(() => ["All companies", ...new Set(reports.map((report) => report.company).filter(Boolean))], [reports]);
  const years = useMemo(() => ["All years", ...new Set(reports.flatMap((report) => [report.startDate, report.endDate].filter(Boolean).map((value) => value.slice(0, 4))))], [reports]);
  const filteredReports = useMemo(() => reports.filter((report) => {
    const query = search.trim().toLowerCase();
    return (!query || `${report.student} ${report.studentId} ${report.company}`.toLowerCase().includes(query))
      && (status === "All statuses" || report.status === status)
      && (company === "All companies" || report.company === company)
      && (year === "All years" || report.startDate.startsWith(year) || report.endDate.startsWith(year));
  }), [company, reports, search, status, year]);
  const summary = useMemo(() => ({
    total: reports.length,
    active: reports.filter((report) => report.status === "Ongoing").length,
    completed: reports.filter((report) => report.status === "Completed").length,
    hours: reports.reduce((sum, report) => sum + report.hours, 0),
    pending: reports.filter((report) => report.status === "Pending").length,
  }), [reports]);

  const showNotice = (message) => { setNotice(message); window.setTimeout(() => setNotice(""), 3000); };
  const clearFilters = () => { setSearch(""); setStatus("All statuses"); setCompany("All companies"); setYear("All years"); };
  const openEdit = (report) => {
    setEditing(report);
    setEditForm({ startDate: report.startDate, endDate: report.endDate, requiredHours: report.required, status: report.status, evaluationStatus: report.evaluation });
  };
  const saveEdit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, "students", editing.id), {
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        requiredHours: Number(editForm.requiredHours),
        ojtStatus: editForm.status,
        evaluationStatus: editForm.evaluationStatus,
      });
      setEditing(null);
      showNotice("OJT report updated successfully.");
    } catch (saveError) {
      console.error("Unable to update OJT report:", saveError);
      setError("OJT report could not be updated.");
    } finally {
      setSaving(false);
    }
  };
  const deleteReport = async (report) => {
    if (!window.confirm(`Delete the student record for ${report.student}? This removes the source record used by this report.`)) return;
    try {
      await deleteDoc(doc(db, "students", report.id));
      showNotice("OJT report deleted successfully.");
      if (selected?.id === report.id) setSelected(null);
    } catch (deleteError) {
      console.error("Unable to delete OJT report:", deleteError);
      setError("OJT report could not be deleted.");
    }
  };
  const printReport = (report) => {
    const attendanceSummary = `${report.attendanceRows.filter((row) => row.status === "Present").length} present, ${report.attendanceRows.filter((row) => row.status === "Late").length} late, ${report.attendanceRows.filter((row) => row.status === "Absent").length} absent`;
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) { setError("Allow pop-ups to generate a printable report."); return; }
    printWindow.document.write(`<html><head><title>OJT Report - ${report.student}</title><style>body{font-family:Arial,sans-serif;color:#172033;padding:40px;line-height:1.5}h1{color:#2868c7}h2{border-bottom:1px solid #ddd;padding-bottom:8px}dl{display:grid;grid-template-columns:180px 1fr;gap:8px}dt{font-weight:bold}button{padding:10px 16px;background:#2868c7;color:white;border:0;border-radius:5px}@media print{button{display:none}}</style></head><body><button onclick="window.print()">Print / Save PDF</button><h1>La Consolacion College Isabela</h1><h2>OJT Monitoring System</h2><p><strong>Student:</strong> ${report.student}</p><dl><dt>Student ID</dt><dd>${report.studentId || "—"}</dd><dt>Course / Program</dt><dd>${report.course}</dd><dt>Partner Company</dt><dd>${report.company}</dd><dt>OJT Dates</dt><dd>${formatDate(report.startDate)} - ${formatDate(report.endDate)}</dd><dt>Total OJT Hours</dt><dd>${report.hours} / ${report.required} hours</dd><dt>Attendance Summary</dt><dd>${attendanceSummary}</dd><dt>Evaluation Status</dt><dd>${report.evaluation}</dd><dt>Completion Status</dt><dd>${report.status}</dd></dl></body></html>`);
    printWindow.document.close();
  };

  return (
    <main className="ojt-reports-management">
      <header className="ojt-reports-management-header"><div><p className="ojt-reports-eyebrow">LCCI · OJT MONITORING SYSTEM</p><h1>OJT Reports</h1><p>Monitor placement progress, hours, attendance, and completion status.</p></div><button type="button" className="ojt-reports-primary" onClick={() => reports[0] && printReport(reports[0])}><Download size={16} /> Generate Report</button></header>
      <section className="ojt-reports-summary">
        <article><Users size={18} /><div><small>Total OJT Students</small><strong>{summary.total}</strong></div></article>
        <article><CheckCircle2 size={18} /><div><small>Active OJT Students</small><strong>{summary.active}</strong></div></article>
        <article><CheckCircle2 size={18} /><div><small>Completed OJT</small><strong>{summary.completed}</strong></div></article>
        <article><FileText size={18} /><div><small>Total OJT Hours</small><strong>{summary.hours.toLocaleString()}</strong></div></article>
        <article><CalendarDays size={18} /><div><small>Pending Reports</small><strong>{summary.pending}</strong></div></article>
      </section>
      <section className="ojt-reports-management-panel">
        <div className="ojt-reports-toolbar"><label className="ojt-reports-search"><Search size={16} /><span className="sr-only">Search student</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student name" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status"><option>All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select><select value={company} onChange={(event) => setCompany(event.target.value)} aria-label="Filter by company">{companies.map((item) => <option key={item}>{item}</option>)}</select><select value={year} onChange={(event) => setYear(event.target.value)} aria-label="Filter by year">{years.map((item) => <option key={item}>{item}</option>)}</select><button type="button" className="ojt-reports-clear" onClick={clearFilters}>Clear filters</button></div>
        {error && <div className="ojt-reports-error" role="alert">{error}</div>}
        {loading ? <div className="ojt-reports-empty">Loading OJT reports...</div> : filteredReports.length === 0 ? <div className="ojt-reports-empty"><strong>No OJT reports found.</strong><span>Reports will appear when student records are available.</span></div> : <div className="ojt-reports-table-wrap"><table className="ojt-reports-table"><thead><tr><th>Student Name</th><th>Student ID</th><th>Course / Program</th><th>Partner Company</th><th>OJT Hours</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filteredReports.map((report) => <tr key={report.id}><td><strong>{report.student}</strong></td><td>{report.studentId || "—"}</td><td>{report.course}</td><td>{report.company}</td><td>{report.hours} / {report.required}</td><td>{formatDate(report.startDate)}</td><td>{formatDate(report.endDate)}</td><td><span className={`ojt-report-status ${report.status.toLowerCase()}`}>{report.status}</span></td><td><div className="ojt-reports-actions"><button type="button" title="View report" onClick={() => setSelected(report)}><Eye size={15} /></button><button type="button" title="Edit report" onClick={() => openEdit(report)}><Edit3 size={15} /></button><button type="button" title="Delete report" onClick={() => deleteReport(report)}><Trash2 size={15} /></button><button type="button" title="Generate report" onClick={() => printReport(report)}><Download size={15} /></button></div></td></tr>)}</tbody></table></div>}
        {!loading && filteredReports.length > 0 && <footer>Showing {filteredReports.length} of {reports.length} reports</footer>}
      </section>
      {selected && <div className="ojt-reports-backdrop" role="presentation" onClick={(event) => event.target === event.currentTarget && setSelected(null)}><section className="ojt-reports-modal" role="dialog" aria-modal="true"><header><div><p>OJT report details</p><h2>{selected.student}</h2></div><button type="button" onClick={() => setSelected(null)} aria-label="Close"><X size={18} /></button></header><div className="ojt-reports-details"><div><small>Student information</small><strong>{selected.studentId || "—"} · {selected.course}</strong></div><div><small>Company information</small><strong>{selected.company}</strong></div><div><small>OJT schedule</small><strong>{formatDate(selected.startDate)} - {formatDate(selected.endDate)}</strong></div><div><small>Total required hours</small><strong>{selected.required} hours</strong></div><div><small>Completed hours</small><strong>{selected.hours} hours</strong></div><div><small>Remaining hours</small><strong>{Math.max(0, selected.required - selected.hours)} hours</strong></div><div><small>Attendance summary</small><strong>{selected.attendanceRows.filter((row) => row.status === "Present").length} present · {selected.attendanceRows.filter((row) => row.status === "Late").length} late · {selected.attendanceRows.filter((row) => row.status === "Absent").length} absent</strong></div><div><small>Evaluation status</small><strong>{selected.evaluation}</strong></div><div className="ojt-reports-detail-wide"><small>Overall OJT status</small><strong>{selected.status}</strong></div></div><footer><button type="button" className="ojt-reports-secondary" onClick={() => setSelected(null)}>Close</button><button type="button" className="ojt-reports-primary" onClick={() => printReport(selected)}><Download size={15} /> Generate Report</button></footer></section></div>}
      {editing && <div className="ojt-reports-backdrop" role="presentation"><section className="ojt-reports-modal" role="dialog" aria-modal="true"><header><div><p>Report management</p><h2>Edit OJT Report</h2></div><button type="button" onClick={() => setEditing(null)} aria-label="Close"><X size={18} /></button></header><form onSubmit={saveEdit} className="ojt-reports-edit-form"><label>Start Date<input type="date" value={editForm.startDate} onChange={(event) => setEditForm({ ...editForm, startDate: event.target.value })} /></label><label>End Date<input type="date" value={editForm.endDate} onChange={(event) => setEditForm({ ...editForm, endDate: event.target.value })} /></label><label>Required Hours<input type="number" min="0" value={editForm.requiredHours} onChange={(event) => setEditForm({ ...editForm, requiredHours: event.target.value })} /></label><label>Status<select value={editForm.status} onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><label className="ojt-reports-detail-wide">Evaluation Status<input value={editForm.evaluationStatus} onChange={(event) => setEditForm({ ...editForm, evaluationStatus: event.target.value })} /></label><footer><button type="button" className="ojt-reports-secondary" onClick={() => setEditing(null)}>Cancel</button><button type="submit" className="ojt-reports-primary" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button></footer></form></section></div>}
      {notice && <div className="ojt-reports-notice" role="status">{notice}</div>}
    </main>
  );
}

export default OJTReports;
