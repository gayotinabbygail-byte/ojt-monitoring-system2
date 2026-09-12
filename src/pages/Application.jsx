import { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Eye,
  FileText,
  Filter,
  Pencil,
  Plus,
  Search,
  X,
  XCircle,
} from "lucide-react";
import "../styles/application.css";

const applications = [
  { id: "APP-2026-0042", name: "Maria Santos", studentId: "2023-IT-0184", course: "BS Information Technology", company: "Isabela Tech Solutions", date: "Sep 11, 2026", status: "Pending", email: "maria.santos@lccian.edu.ph", phone: "0917 555 0184", documents: ["Resume.pdf", "Endorsement Letter.pdf"] },
  { id: "APP-2026-0041", name: "Juan Dela Cruz", studentId: "2023-BA-0091", course: "BS Business Administration", company: "LCCI Cooperative", date: "Sep 10, 2026", status: "Approved", email: "juan.delacruz@lccian.edu.ph", phone: "0917 555 0091", documents: ["Resume.pdf", "Medical Certificate.pdf"] },
  { id: "APP-2026-0040", name: "Angela Reyes", studentId: "2023-ACC-0068", course: "BS Accountancy", company: "F. Manalo Accounting", date: "Sep 09, 2026", status: "Under Review", email: "angela.reyes@lccian.edu.ph", phone: "0917 555 0068", documents: ["Resume.pdf", "Transcript of Records.pdf"] },
  { id: "APP-2026-0039", name: "Carlo Mendoza", studentId: "2023-EDU-0143", course: "Bachelor of Elementary Education", company: "Isabela Central School", date: "Sep 08, 2026", status: "Rejected", email: "carlo.mendoza@lccian.edu.ph", phone: "0917 555 0143", documents: ["Resume.pdf"] },
  { id: "APP-2026-0038", name: "Sofia Garcia", studentId: "2023-IT-0212", course: "BS Information Technology", company: "North Valley Digital", date: "Sep 07, 2026", status: "Approved", email: "sofia.garcia@lccian.edu.ph", phone: "0917 555 0212", documents: ["Resume.pdf", "Endorsement Letter.pdf"] },
  { id: "APP-2026-0037", name: "Paolo Navarro", studentId: "2023-HM-0039", course: "BS Hospitality Management", company: "Villa Isabela Hotel", date: "Sep 06, 2026", status: "Pending", email: "paolo.navarro@lccian.edu.ph", phone: "0917 555 0039", documents: ["Resume.pdf", "Medical Certificate.pdf"] },
  { id: "APP-2026-0036", name: "Bea Villanueva", studentId: "2023-BA-0117", course: "BS Business Administration", company: "Provincial Capitol", date: "Sep 05, 2026", status: "Under Review", email: "bea.villanueva@lccian.edu.ph", phone: "0917 555 0117", documents: ["Resume.pdf", "Transcript of Records.pdf"] },
  { id: "APP-2026-0035", name: "Nico Alvarez", studentId: "2023-IT-0151", course: "BS Information Technology", company: "Pixel North Studio", date: "Sep 04, 2026", status: "Approved", email: "nico.alvarez@lccian.edu.ph", phone: "0917 555 0151", documents: ["Resume.pdf", "Endorsement Letter.pdf"] },
  { id: "APP-2026-0034", name: "Lara Domingo", studentId: "2023-EDU-0088", course: "Bachelor of Secondary Education", company: "LCCI Integrated School", date: "Sep 03, 2026", status: "Pending", email: "lara.domingo@lccian.edu.ph", phone: "0917 555 0088", documents: ["Resume.pdf"] },
  { id: "APP-2026-0033", name: "Miguel Flores", studentId: "2023-ACC-0044", course: "BS Accountancy", company: "Cabreros & Co.", date: "Sep 02, 2026", status: "Rejected", email: "miguel.flores@lccian.edu.ph", phone: "0917 555 0044", documents: ["Resume.pdf", "Transcript of Records.pdf"] },
  { id: "APP-2026-0032", name: "Ella Ramos", studentId: "2023-HM-0102", course: "BS Hospitality Management", company: "Casa Del Rio", date: "Sep 01, 2026", status: "Pending", email: "ella.ramos@lccian.edu.ph", phone: "0917 555 0102", documents: ["Resume.pdf"] },
];

const avatarClasses = ["avatar-blue", "avatar-green", "avatar-purple", "avatar-orange", "avatar-teal", "avatar-slate"];
const statusClasses = { Pending: "status-pending", Approved: "status-approved", Rejected: "status-declined", "Under Review": "status-for-revision" };

function Application() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [courseFilter, setCourseFilter] = useState("All courses");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [notice, setNotice] = useState("");
  const pageSize = 10;

  const courses = [...new Set(applications.map((application) => application.course))];
  const filteredApplications = useMemo(() => applications.filter((application) => {
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch = !query || `${application.name} ${application.id}`.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "All statuses" || application.status === statusFilter;
    const matchesCourse = courseFilter === "All courses" || application.course === courseFilter;
    const matchesDate = !dateFilter || application.date.includes(dateFilter);
    return matchesSearch && matchesStatus && matchesCourse && matchesDate;
  }), [courseFilter, dateFilter, searchTerm, statusFilter]);

  const visibleApplications = filteredApplications.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));
  const counts = applications.reduce((summary, application) => {
    summary[application.status] += 1;
    return summary;
  }, { Pending: 0, Approved: 0, Rejected: 0, "Under Review": 0 });

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const updateFilter = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const updateStatus = (application, status) => {
    setSelectedApplication({ ...application, status });
    showNotice(`${application.name}'s application is marked ${status.toLowerCase()}.`);
  };

  return (
    <main className="application-page">
      <style>{`.application-page *{box-sizing:border-box}.application-page{padding-bottom:28px}.application-header h1{letter-spacing:-.02em}.application-primary{display:inline-flex;align-items:center;gap:8px;padding:12px 16px;border:0;border-radius:8px;background:#2868c7;color:#fff;font:800 13px 'Trebuchet MS','Segoe UI',sans-serif;cursor:pointer;white-space:nowrap}.application-primary:hover{background:#1f58ad}.application-summary-card{border-radius:10px}.application-panel{overflow:hidden;border-radius:10px}.application-controls{flex-wrap:wrap}.application-date{min-width:145px!important}.application-action-group{display:flex;gap:5px}.application-table{min-width:1080px}.application-status{align-items:center;gap:5px}.application-status:before{width:6px;height:6px;border-radius:50%;background:currentColor;content:""}.application-modal-backdrop{position:fixed;inset:0;z-index:20;display:grid;place-items:center;padding:20px;background:#17203366}.application-modal{width:min(680px,100%);max-height:calc(100vh - 40px);overflow:auto;border-radius:12px;background:#fff;box-shadow:0 20px 60px #17203340}.application-modal-header{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;padding:22px 24px;border-bottom:1px solid #edf0f4}.application-modal-header h2{margin:0 0 5px;color:#172033;font-size:20px}.application-modal-header p{margin:0;color:#8995a7;font-size:12px}.application-modal-close{display:grid;place-items:center;width:32px;height:32px;border:0;border-radius:7px;background:#f4f6f9;color:#69788e;cursor:pointer}.application-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:22px 24px}.application-detail{padding:13px;border:1px solid #edf0f4;border-radius:8px}.application-detail.full{grid-column:1/-1}.application-detail label{display:block;margin-bottom:6px;color:#8995a7;font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}.application-detail strong,.application-detail p{margin:0;color:#344258;font-size:13px;line-height:1.5}.application-document-list{display:flex;flex-wrap:wrap;gap:8px}.application-document{display:inline-flex;align-items:center;gap:6px;padding:7px 9px;border-radius:6px;background:#eef4ff;color:#2868c7;font-size:11px;font-weight:700}.application-notice{position:fixed;right:24px;bottom:24px;z-index:25;padding:13px 16px;border:1px solid #c8e7db;border-radius:8px;background:#f0fbf6;color:#176b57;box-shadow:0 10px 28px #18263f22;font-size:13px}@media(max-width:650px){.application-detail-grid{grid-template-columns:1fr;padding:18px}.application-detail.full{grid-column:auto}.application-modal-header{padding:18px}.application-notice{right:14px;bottom:14px;left:14px}}`}</style>

      <header className="application-header">
        <div><p className="application-eyebrow">OJT management</p><h1>OJT Applications</h1><p className="application-subtitle">Manage and review student OJT applications</p></div>
        <button type="button" className="application-primary" onClick={() => showNotice("The new application form is ready to connect.")}><Plus size={17} /> New Application</button>
      </header>

      <section className="application-summary" aria-label="Application summary">
        <article className="application-summary-card"><span className="summary-icon summary-blue"><ClipboardList size={18} /></span><div><strong>{applications.length}</strong><span>Total Applications</span></div></article>
        <article className="application-summary-card"><span className="summary-icon summary-amber"><CircleAlert size={18} /></span><div><strong>{counts.Pending}</strong><span>Pending Applications</span></div></article>
        <article className="application-summary-card"><span className="summary-icon summary-green"><CheckCircle2 size={18} /></span><div><strong>{counts.Approved}</strong><span>Approved Applications</span></div></article>
        <article className="application-summary-card"><span className="summary-icon summary-slate"><XCircle size={18} /></span><div><strong>{counts.Rejected}</strong><span>Rejected Applications</span></div></article>
      </section>

      <section className="application-panel">
        <div className="application-toolbar">
          <label className="application-search"><Search size={17} /><span className="sr-only">Search applications</span><input placeholder="Search student name or application ID..." value={searchTerm} onChange={(event) => updateFilter(setSearchTerm, event.target.value)} /></label>
          <div className="application-controls">
            <label className="application-select"><span className="sr-only">Application Status</span><select value={statusFilter} onChange={(event) => updateFilter(setStatusFilter, event.target.value)}><option>All statuses</option><option>Pending</option><option>Approved</option><option>Rejected</option><option>Under Review</option></select></label>
            <label className="application-select"><span className="sr-only">Course</span><select value={courseFilter} onChange={(event) => updateFilter(setCourseFilter, event.target.value)}><option>All courses</option>{courses.map((course) => <option key={course}>{course}</option>)}</select></label>
            <label className="application-select application-date"><span className="sr-only">Date filter</span><input type="date" aria-label="Filter by date" value={dateFilter} onChange={(event) => updateFilter(setDateFilter, event.target.value)} /></label>
            <button type="button" className="filter-button" title="Clear filters" aria-label="Clear filters" onClick={() => { setSearchTerm(""); setStatusFilter("All statuses"); setCourseFilter("All courses"); setDateFilter(""); setPage(1); }}><Filter size={16} /></button>
          </div>
        </div>

        <div className="application-table-wrap"><table className="application-table"><thead><tr><th>Application ID</th><th>Student Name</th><th>Course</th><th>Preferred Company</th><th>Date Submitted</th><th>Application Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
          {visibleApplications.map((application, index) => <tr key={application.id}><td><strong className="company-cell">{application.id}</strong></td><td><div className="student-cell"><span className={`student-avatar ${avatarClasses[index % avatarClasses.length]}`}>{application.name.split(" ").map((part) => part[0]).join("")}</span><div><strong>{application.name}</strong><span>{application.studentId}</span></div></div></td><td>{application.course}</td><td className="company-cell">{application.company}</td><td className="date-cell">{application.date}</td><td><span className={`application-status ${statusClasses[application.status]}`}>{application.status}</span></td><td><div className="application-action-group"><button type="button" className="application-action" title="View application" aria-label={`View ${application.name}'s application`} onClick={() => setSelectedApplication(application)}><Eye size={15} /></button><button type="button" className="application-action" title="Approve application" aria-label={`Approve ${application.name}'s application`} onClick={() => updateStatus(application, "Approved")}><Check size={15} /></button><button type="button" className="application-action" title="Reject application" aria-label={`Reject ${application.name}'s application`} onClick={() => updateStatus(application, "Rejected")}><X size={15} /></button><button type="button" className="application-action" title="Edit application" aria-label={`Edit ${application.name}'s application`} onClick={() => showNotice(`Editing ${application.id} is ready to connect.`)}><Pencil size={15} /></button></div></td></tr>)}
        </tbody></table>{visibleApplications.length === 0 && <div className="empty-applications"><Search size={24} /><strong>No applications found</strong><span>Try changing your search or filters.</span></div>}</div>
        <footer className="application-footer"><span>Showing {filteredApplications.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredApplications.length)} of {filteredApplications.length} applications</span><div className="partner-pagination"><button type="button" className="partner-page-button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={16} /></button><span className="footer-link">Page {page} of {totalPages}</span><button type="button" className="partner-page-button" aria-label="Next page" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}><ChevronRight size={16} /></button></div></footer>
      </section>

      {selectedApplication && <div className="application-modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSelectedApplication(null); }}><section className="application-modal" role="dialog" aria-modal="true" aria-labelledby="application-modal-title"><header className="application-modal-header"><div><h2 id="application-modal-title">{selectedApplication.name}</h2><p>{selectedApplication.id} · {selectedApplication.studentId}</p></div><button type="button" className="application-modal-close" aria-label="Close application details" onClick={() => setSelectedApplication(null)}><X size={17} /></button></header><div className="application-detail-grid"><div className="application-detail"><label>Course</label><strong>{selectedApplication.course}</strong></div><div className="application-detail"><label>Application status</label><span className={`application-status ${statusClasses[selectedApplication.status]}`}>{selectedApplication.status}</span></div><div className="application-detail"><label>Contact information</label><p>{selectedApplication.email}<br />{selectedApplication.phone}</p></div><div className="application-detail"><label>Preferred partner company</label><strong>{selectedApplication.company}</strong></div><div className="application-detail"><label>Application date</label><strong>{selectedApplication.date}</strong></div><div className="application-detail full"><label>Uploaded requirements</label><div className="application-document-list">{selectedApplication.documents.map((document) => <span className="application-document" key={document}><FileText size={14} />{document}</span>)}</div></div></div></section></div>}
      {notice && <div className="application-notice">{notice}</div>}
    </main>
  );
}

export default Application;
