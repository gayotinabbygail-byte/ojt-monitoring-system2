import { useMemo, useState } from "react";
import { AlertCircle, CalendarDays, CheckCircle2, Clock3, Download, Eye, Search, UserX, X } from "lucide-react";
import { useAttendance } from "../context/useAttendance";
import "../styles/attendance.css";

const statusClass = { Present: "present", Late: "late", Absent: "absent", Incomplete: "incomplete" };

function Attendance() {
  const { records, loading, error, retry, updateRecord } = useAttendance();
  const [date, setDate] = useState("2026-09-12");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");

  const visibleRecords = useMemo(() => records.filter((record) => {
    const query = search.toLowerCase().trim();
    return record.date === date && (!query || `${record.student} ${record.studentId} ${record.company}`.toLowerCase().includes(query)) && (status === "All statuses" || record.status === status);
  }), [date, records, search, status]);

  const summary = useMemo(() => visibleRecords.reduce((result, record) => {
    result[record.status] = (result[record.status] || 0) + 1;
    return result;
  }, { Present: 0, Late: 0, Absent: 0, Incomplete: 0 }), [visibleRecords]);

  const showNotice = (message) => { setNotice(message); window.setTimeout(() => setNotice(""), 2400); };

  const verifyRecord = async (record) => {
    try {
      await updateRecord(record.id, { status: "Present", note: "Verified by coordinator" });
      setSelected(null);
      showNotice(`${record.student}'s record was verified.`);
    } catch (updateError) {
      console.error("Unable to verify attendance record:", updateError);
      showNotice("Attendance record could not be updated.");
    }
  };

  return (
    <main className="attendance-page">
      <header className="attendance-header"><div><p className="attendance-eyebrow">Daily monitoring</p><h1>Attendance</h1><p>Review student time logs, flag exceptions, and keep placement hours accurate.</p></div><button type="button" className="attendance-export" onClick={() => showNotice("Attendance report export is ready to connect.")}><Download size={16} /> Export report</button></header>
      <section className="attendance-context" aria-label="Attendance context"><div className="context-icon"><CalendarDays size={20} /></div><div><span>Viewing attendance for</span><strong>{new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</strong></div><label className="context-date"><span>Date</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label></section>
      <section className="attendance-summary" aria-label="Attendance summary"><article><span className="summary-icon green"><CheckCircle2 size={18} /></span><div><span>Present</span><strong>{summary.Present}</strong></div></article><article><span className="summary-icon amber"><Clock3 size={18} /></span><div><span>Late</span><strong>{summary.Late}</strong></div></article><article><span className="summary-icon red"><UserX size={18} /></span><div><span>Absent</span><strong>{summary.Absent}</strong></div></article><article><span className="summary-icon blue"><AlertCircle size={18} /></span><div><span>Needs review</span><strong>{summary.Incomplete}</strong></div></article></section>
      {error ? <section className="attendance-panel"><div className="attendance-empty" role="alert"><strong>{error}</strong><button type="button" className="attendance-export" onClick={retry}>Retry</button></div></section> : loading ? <section className="attendance-panel"><div className="attendance-empty">Loading attendance records...</div></section> : <section className="attendance-panel"><div className="attendance-toolbar"><label className="attendance-search"><Search size={17} /><span className="sr-only">Search attendance</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student, ID, or company" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter attendance status"><option>All statuses</option><option>Present</option><option>Late</option><option>Absent</option><option>Incomplete</option></select></div><div className="attendance-table-wrap"><table className="attendance-table"><thead><tr><th>Student</th><th>Partner company</th><th>Time in</th><th>Time out</th><th>Hours</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visibleRecords.map((record) => <tr key={record.id}><td><strong>{record.student}</strong><span>{record.studentId}</span></td><td>{record.company}</td><td>{record.timeIn}</td><td>{record.timeOut}</td><td>{record.hours} hrs</td><td><span className={`attendance-status ${statusClass[record.status]}`}>{record.status}</span></td><td><button type="button" className="attendance-view" onClick={() => setSelected(record)} aria-label={`View ${record.student} attendance`} title="View attendance"><Eye size={16} /></button></td></tr>)}</tbody></table>{visibleRecords.length === 0 && <div className="attendance-empty">No attendance records match this date and filter.</div>}</div><footer className="attendance-footer">Showing {visibleRecords.length} student records for the selected date</footer></section>}
      {selected && <div className="attendance-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className="attendance-modal" role="dialog" aria-modal="true" aria-labelledby="attendance-modal-title"><header><div><p className="attendance-eyebrow">Attendance record</p><h2 id="attendance-modal-title">{selected.student}</h2><span>{selected.studentId} · {selected.company}</span></div><button type="button" onClick={() => setSelected(null)} aria-label="Close attendance details"><X size={18} /></button></header><div className="attendance-detail-grid"><div><span>Time in</span><strong>{selected.timeIn}</strong></div><div><span>Time out</span><strong>{selected.timeOut}</strong></div><div><span>Logged hours</span><strong>{selected.hours} hours</strong></div><div><span>Note</span><strong>{selected.note}</strong></div></div><div className="attendance-modal-actions"><button type="button" onClick={() => verifyRecord(selected)}>Mark verified</button><button type="button" className="secondary" onClick={() => setSelected(null)}>Close</button></div></section></div>}
      {notice && <div className="attendance-notice">{notice}</div>}
    </main>
  );
}

export default Attendance;