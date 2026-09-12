import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileBarChart,
  FileText,
  ListChecks,
  MoreHorizontal,
  Printer,
  Search,
  XCircle,
} from "lucide-react";
import { useAttendance } from "../context/useAttendance";
import "../styles/attendance-reports.css";

const recentReports = [
  { name: "September Attendance Summary", period: "Sep 01 - Sep 12, 2026", company: "All companies", date: "Sep 12, 2026", by: "Admin User", status: "Completed" },
  { name: "Isabela Tech Weekly Report", period: "Sep 05 - Sep 11, 2026", company: "Isabela Tech Solutions", date: "Sep 11, 2026", by: "Patricia Lim", status: "Completed" },
  { name: "Monthly Coordinator Review", period: "August 2026", company: "All companies", date: "Sep 01, 2026", by: "Admin User", status: "Processing" },
  { name: "Provincial Capitol Attendance", period: "Aug 18 - Aug 30, 2026", company: "Provincial Capitol", date: "Aug 30, 2026", by: "Ramon Villanueva", status: "Pending" },
  { name: "July Attendance Archive", period: "July 2026", company: "All companies", date: "Aug 01, 2026", by: "Admin User", status: "Failed" },
];

const reportStatusClass = { Completed: "completed", Pending: "pending", Processing: "processing", Failed: "failed" };
const attendanceStatusClass = { Present: "present", Absent: "absent", Late: "late", Excused: "excused", Incomplete: "excused" };

const trendData = [
  { label: "Mon", present: 82, absent: 10, late: 8 },
  { label: "Tue", present: 88, absent: 6, late: 6 },
  { label: "Wed", present: 76, absent: 14, late: 10 },
  { label: "Thu", present: 91, absent: 4, late: 5 },
  { label: "Fri", present: 84, absent: 9, late: 7 },
  { label: "Sat", present: 68, absent: 19, late: 13 },
];

function AttendanceReports() {
  const { records } = useAttendance();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("September 1 - 12, 2026");
  const [company, setCompany] = useState("All companies");
  const [course, setCourse] = useState("All courses");
  const [status, setStatus] = useState("All statuses");
  const [month, setMonth] = useState("September 2026");
  const [reportPage, setReportPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [notice, setNotice] = useState("");
  const pageSize = 4;

  const companies = [...new Set(records.map((record) => record.company))];
  const courses = ["BS Information Technology", "BS Business Administration", "BS Accountancy", "BS Hospitality Management"];
  const reportRows = records.map((record) => ({
    ...record,
    course: courses[records.indexOf(record) % courses.length],
    status: record.status === "Incomplete" ? "Excused" : record.status,
  }));

  const filteredRows = useMemo(() => reportRows.filter((record) => {
    const query = search.toLowerCase().trim();
    return (!query || `${record.student} ${record.studentId}`.toLowerCase().includes(query))
      && (company === "All companies" || record.company === company)
      && (course === "All courses" || record.course === course)
      && (status === "All statuses" || record.status === status);
  }), [company, course, reportRows, search, status]);

  const visibleRows = filteredRows.slice((reportPage - 1) * pageSize, reportPage * pageSize);
  const reportPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleHistory = recentReports.slice((historyPage - 1) * pageSize, historyPage * pageSize);
  const historyPages = Math.max(1, Math.ceil(recentReports.length / pageSize));
  const summary = records.reduce((result, record) => {
    const normalized = record.status === "Incomplete" ? "Excused" : record.status;
    result[normalized] = (result[normalized] || 0) + 1;
    return result;
  }, { Present: 0, Absent: 0, Late: 0, Excused: 0 });
  const attendancePercentage = records.length ? Math.round((summary.Present / records.length) * 100) : 0;

  const showNotice = (message) => { setNotice(message); window.setTimeout(() => setNotice(""), 2400); };
  const resetReportPage = (setter, value) => { setter(value); setReportPage(1); };

  return (
    <main className="attendance-reports-page">
      <header className="attendance-reports-header">
        <div><p className="attendance-reports-eyebrow">OJT monitoring · reporting center</p><h1>Attendance Reports</h1><p>View, analyze, generate, and manage OJT student attendance reports.</p></div>
        <div className="attendance-report-actions"><button type="button" className="report-secondary-button" onClick={() => showNotice("Report export is ready to connect.")}><Download size={15} /> Export Report</button><button type="button" className="report-primary-button" onClick={() => showNotice("Attendance report generated successfully.")}><FileBarChart size={16} /> Generate Attendance Report</button></div>
      </header>

      <section className="attendance-report-summary" aria-label="Attendance report summary"><article><span className="report-summary-icon blue"><CalendarDays size={19} /></span><div><span>Total Attendance Records</span><strong>{records.length}</strong><small>Across current dataset</small></div></article><article><span className="report-summary-icon green"><CheckCircle2 size={19} /></span><div><span>Present Students</span><strong>{summary.Present}</strong><small>{attendancePercentage}% attendance rate</small></div></article><article><span className="report-summary-icon red"><XCircle size={19} /></span><div><span>Absent Students</span><strong>{summary.Absent}</strong><small>Requires follow-up</small></div></article><article><span className="report-summary-icon amber"><Clock3 size={19} /></span><div><span>Late Students</span><strong>{summary.Late}</strong><small>Review punctuality trends</small></div></article></section>

      <section className="attendance-report-panel report-filters-panel"><div className="report-section-heading"><div><p className="report-kicker">Report builder</p><h2>Attendance Report Filters</h2></div><span className="filter-context"><CalendarDays size={14} /> {month}</span></div><div className="report-filters-grid"><label className="report-search-field"><span>Search student</span><div><Search size={15} /><input value={search} onChange={(event) => resetReportPage(setSearch, event.target.value)} placeholder="Name or Student ID" /></div></label><label><span>Date range</span><select value={dateRange} onChange={(event) => setDateRange(event.target.value)}><option>September 1 - 12, 2026</option><option>August 1 - 31, 2026</option><option>July 1 - 31, 2026</option></select></label><label><span>Partner company</span><select value={company} onChange={(event) => resetReportPage(setCompany, event.target.value)}><option>All companies</option>{companies.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Course or program</span><select value={course} onChange={(event) => resetReportPage(setCourse, event.target.value)}><option>All courses</option>{courses.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Attendance status</span><select value={status} onChange={(event) => resetReportPage(setStatus, event.target.value)}><option>All statuses</option><option>Present</option><option>Absent</option><option>Late</option><option>Excused</option></select></label><label><span>Month</span><select value={month} onChange={(event) => setMonth(event.target.value)}><option>September 2026</option><option>August 2026</option><option>July 2026</option></select></label></div><div className="filter-actions"><button type="button" className="report-primary-button" onClick={() => showNotice(`Report generated for ${month}.`)}><FileBarChart size={16} /> Generate Attendance Report</button><button type="button" className="report-secondary-button" onClick={() => showNotice("PDF download is ready to connect.")}><Download size={15} /> Download PDF</button><button type="button" className="report-secondary-button" onClick={() => showNotice("Print dialog is ready to connect.")}><Printer size={15} /> Print Report</button></div></section>

      <section className="attendance-report-panel overview-panel"><div className="report-section-heading"><div><p className="report-kicker">Current snapshot</p><h2>Attendance Overview</h2></div><span className="overview-period">Daily trend · {month}</span></div><div className="overview-stats"><div><span className="overview-stat-label"><CheckCircle2 size={14} /> Total Present</span><strong>{summary.Present}</strong><small className="positive">+8.4% from last period</small></div><div><span className="overview-stat-label"><XCircle size={14} /> Total Absent</span><strong>{summary.Absent}</strong><small>Needs coordinator review</small></div><div><span className="overview-stat-label"><Clock3 size={14} /> Total Late</span><strong>{summary.Late}</strong><small>Monitor punctuality</small></div><div><span className="overview-stat-label"><ListChecks size={14} /> Attendance Percentage</span><strong>{attendancePercentage}%</strong><small className="positive">Within target range</small></div></div><div className="attendance-chart" aria-label="Daily attendance trend chart"><div className="chart-axis"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div className="chart-grid">{trendData.map((day) => <div className="chart-column" key={day.label}><div className="chart-bars"><i className="chart-present" style={{ height: `${day.present}%` }} title={`${day.present}% present`} /><i className="chart-late" style={{ height: `${day.late}%` }} title={`${day.late}% late`} /><i className="chart-absent" style={{ height: `${day.absent}%` }} title={`${day.absent}% absent`} /></div><span>{day.label}</span></div>)}</div></div><div className="chart-legend"><span><i className="chart-present" /> Present</span><span><i className="chart-late" /> Late</span><span><i className="chart-absent" /> Absent</span></div></section>

      <section className="attendance-report-panel report-table-panel"><div className="report-section-heading"><div><p className="report-kicker">Filtered records</p><h2>Detailed Attendance Report</h2></div><span className="table-count">{filteredRows.length} records</span></div><div className="report-table-wrap"><table className="report-table"><thead><tr><th>Student Name</th><th>Student ID</th><th>Course</th><th>Partner Company</th><th>Date</th><th>Time In</th><th>Time Out</th><th>Total Hours</th><th>Status</th><th>Action</th></tr></thead><tbody>{visibleRows.map((record) => <tr key={record.id}><td><strong>{record.student}</strong></td><td>{record.studentId}</td><td>{record.course}</td><td>{record.company}</td><td>{record.date}</td><td>{record.timeIn}</td><td>{record.timeOut}</td><td>{record.hours} hrs</td><td><span className={`report-status-badge ${attendanceStatusClass[record.status]}`}>{record.status}</span></td><td><button type="button" className="table-action-button" title="Attendance actions" aria-label={`Actions for ${record.student}`} onClick={() => showNotice(`Actions for ${record.student} are ready to connect.`)}><MoreHorizontal size={16} /></button></td></tr>)}</tbody></table>{visibleRows.length === 0 && <div className="report-empty">No attendance records match the selected filters.</div>}</div><ReportPagination page={reportPage} totalPages={reportPages} onPrevious={() => setReportPage((current) => current - 1)} onNext={() => setReportPage((current) => current + 1)} label={`Showing ${visibleRows.length} of ${filteredRows.length} records`} /></section>

      <section className="attendance-report-panel report-table-panel"><div className="report-section-heading"><div><p className="report-kicker">Report history</p><h2>Recent Attendance Reports</h2></div><button type="button" className="report-secondary-button compact" onClick={() => showNotice("Report archive is ready to connect.")}><FileText size={14} /> View archive</button></div><div className="report-table-wrap"><table className="report-table recent-report-table"><thead><tr><th>Report Name</th><th>Report Period</th><th>Partner Company</th><th>Generated Date</th><th>Generated By</th><th>Status</th><th>Action</th></tr></thead><tbody>{visibleHistory.map((report) => <tr key={report.name}><td><strong>{report.name}</strong></td><td>{report.period}</td><td>{report.company}</td><td>{report.date}</td><td>{report.by}</td><td><span className={`report-status-badge ${reportStatusClass[report.status]}`}>{report.status}</span></td><td><button type="button" className="table-action-button" title="Report actions" aria-label={`Actions for ${report.name}`} onClick={() => showNotice(`${report.name} actions are ready to connect.`)}><MoreHorizontal size={16} /></button></td></tr>)}</tbody></table></div><ReportPagination page={historyPage} totalPages={historyPages} onPrevious={() => setHistoryPage((current) => current - 1)} onNext={() => setHistoryPage((current) => current + 1)} label={`Showing ${visibleHistory.length} of ${recentReports.length} reports`} /></section>
      {notice && <div className="attendance-reports-notice">{notice}</div>}
    </main>
  );
}

function ReportPagination({ page, totalPages, onPrevious, onNext, label }) {
  return <footer className="report-pagination"><span>{label}</span><div><button type="button" aria-label="Previous page" disabled={page === 1} onClick={onPrevious}>Previous</button><strong>Page {page} of {totalPages}</strong><button type="button" aria-label="Next page" disabled={page === totalPages} onClick={onNext}>Next</button></div></footer>;
}

export default AttendanceReports;