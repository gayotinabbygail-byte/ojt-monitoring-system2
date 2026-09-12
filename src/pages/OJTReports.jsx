import { useMemo, useState } from "react";
import { ArrowUpRight, BarChart3, CalendarDays, CheckCircle2, Download, FileText, Search, Users } from "lucide-react";
import "../styles/ojt-reports.css";

const reports = [
  { id: "STU-2023-0184", student: "Maria Santos", course: "BS Information Technology", company: "Isabela Tech Solutions", hours: 350, required: 500, status: "On track", lastUpdate: "Sep 12, 2026" },
  { id: "STU-2023-0091", student: "Juan Dela Cruz", course: "BS Business Administration", company: "LCCI Cooperative", hours: 500, required: 500, status: "Completed", lastUpdate: "Sep 11, 2026" },
  { id: "STU-2023-0068", student: "Angela Reyes", course: "BS Accountancy", company: "F. Manalo Accounting", hours: 198, required: 500, status: "Needs attention", lastUpdate: "Sep 10, 2026" },
  { id: "STU-2023-0212", student: "Sofia Garcia", course: "BS Information Technology", company: "North Valley Digital", hours: 412, required: 500, status: "On track", lastUpdate: "Sep 12, 2026" },
  { id: "STU-2023-0039", student: "Paolo Navarro", course: "BS Hospitality Management", company: "Villa Isabela Hotel", hours: 264, required: 500, status: "On track", lastUpdate: "Sep 09, 2026" },
  { id: "STU-2023-0117", student: "Bea Villanueva", course: "BS Business Administration", company: "Provincial Capitol", hours: 76, required: 500, status: "Needs attention", lastUpdate: "Sep 08, 2026" },
];

const statusClass = { "On track": "on-track", Completed: "completed", "Needs attention": "attention" };

function OJTReports() {
  const [period, setPeriod] = useState("September 2026");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [notice, setNotice] = useState("");

  const filteredReports = useMemo(() => reports.filter((report) => {
    const query = search.toLowerCase().trim();
    return (!query || `${report.student} ${report.id} ${report.company}`.toLowerCase().includes(query))
      && (status === "All statuses" || report.status === status);
  }), [search, status]);

  const totalHours = reports.reduce((sum, report) => sum + report.hours, 0);
  const completion = Math.round((totalHours / reports.reduce((sum, report) => sum + report.required, 0)) * 100);
  const showNotice = (message) => { setNotice(message); window.setTimeout(() => setNotice(""), 2400); };

  return (
    <main className="reports-page">
      <header className="reports-header"><div><p className="reports-eyebrow">OJT insights</p><h1>OJT Reports</h1><p>See placement progress, identify students who need support, and prepare your monitoring summary.</p></div><button type="button" className="reports-export" onClick={() => showNotice("OJT monitoring report export is ready to connect.")}><Download size={16} /> Export report</button></header>

      <section className="reports-context" aria-label="Report context"><div className="reports-context-icon"><CalendarDays size={20} /></div><div><span>Reporting period</span><strong>{period} monitoring snapshot</strong></div><label><span>Period</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option>September 2026</option><option>August 2026</option><option>July 2026</option></select></label><div className="context-updated"><span>Last updated</span><strong>Today, 9:30 AM</strong></div></section>

      <section className="reports-summary" aria-label="OJT report summary"><article><span className="report-stat-icon blue"><Users size={19} /></span><div><span>Active students</span><strong>248</strong><small>12 added this month</small></div></article><article><span className="report-stat-icon green"><CheckCircle2 size={19} /></span><div><span>Students on track</span><strong>181</strong><small>73% of active placements</small></div></article><article><span className="report-stat-icon amber"><BarChart3 size={19} /></span><div><span>Average completion</span><strong>{completion}%</strong><small>{totalHours.toLocaleString()} hours logged</small></div></article><article><span className="report-stat-icon coral"><FileText size={19} /></span><div><span>Reports needing review</span><strong>21</strong><small>Across 8 partner companies</small></div></article></section>

      <section className="reports-overview"><article className="report-panel progress-panel"><div className="report-panel-heading"><div><p>Placement health</p><h2>Program progress</h2></div><ArrowUpRight size={18} /></div><div className="program-progress"><div className="report-ring"><strong>73%</strong><span>on track</span></div><div className="program-bars"><div><span><b>Information Technology</b><em>82%</em></span><i><u style={{ width: "82%" }} /></i></div><div><span><b>Business Administration</b><em>76%</em></span><i><u style={{ width: "76%" }} /></i></div><div><span><b>Accountancy</b><em>61%</em></span><i><u style={{ width: "61%" }} /></i></div><div><span><b>Hospitality Management</b><em>58%</em></span><i><u style={{ width: "58%" }} /></i></div></div></div></article><article className="report-panel coverage-panel"><div className="report-panel-heading"><div><p>Placement network</p><h2>Partner coverage</h2></div><ArrowUpRight size={18} /></div><div className="coverage-list"><div><span className="coverage-dot blue" /><div><strong>42 partner companies</strong><small>Across 6 academic programs</small></div><b>100%</b></div><div><span className="coverage-dot green" /><div><strong>36 active placements</strong><small>Students currently reporting</small></div><b>86%</b></div><div><span className="coverage-dot amber" /><div><strong>8 companies need follow-up</strong><small>Missing recent monitoring updates</small></div><b>19%</b></div></div><button type="button" className="report-link" onClick={() => showNotice("Partner coverage details are ready to connect.")}>View coverage details <ArrowUpRight size={14} /></button></article></section>

      <section className="report-panel reports-table-panel"><div className="reports-toolbar"><div><p>Student monitoring</p><h2>Placement progress report</h2></div><div className="reports-filters"><label className="reports-search"><Search size={16} /><span className="sr-only">Search student reports</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student or company" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter report status"><option>All statuses</option><option>On track</option><option>Completed</option><option>Needs attention</option></select></div></div><div className="reports-table-wrap"><table className="reports-table"><thead><tr><th>Student</th><th>Partner company</th><th>Progress</th><th>Last update</th><th>Status</th></tr></thead><tbody>{filteredReports.map((report) => { const percent = Math.round((report.hours / report.required) * 100); return <tr key={report.id}><td><strong>{report.student}</strong><span>{report.id} · {report.course}</span></td><td>{report.company}</td><td><div className="report-progress"><span>{report.hours} / {report.required} hrs <b>{percent}%</b></span><i><u className={statusClass[report.status]} style={{ width: `${percent}%` }} /></i></div></td><td>{report.lastUpdate}</td><td><span className={`report-status ${statusClass[report.status]}`}>{report.status}</span></td></tr>; })}</tbody></table>{filteredReports.length === 0 && <div className="reports-empty">No student reports match your filters.</div>}</div><footer className="reports-table-footer">Showing {filteredReports.length} of {reports.length} student reports</footer></section>
      {notice && <div className="reports-notice">{notice}</div>}
    </main>
  );
}

export default OJTReports;