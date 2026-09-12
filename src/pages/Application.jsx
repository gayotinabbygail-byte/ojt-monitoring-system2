import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, CircleAlert, ClipboardList, Eye, Filter, Pencil, Plus, Search, Trash2, X, XCircle } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { createCollectionDocument, deleteCollectionDocument, formatDateValue, subscribeToCollection, updateCollectionDocument } from "../services/firestoreDataService";
import "../styles/application.css";

const statusClasses = { Pending: "status-pending", Approved: "status-approved", Rejected: "status-declined", "Under Review": "status-for-revision" };
const formDefaults = { name: "", studentId: "", course: "", company: "", email: "", phone: "" };

const normalizeStatus = (status) => {
  const value = String(status || "pending").toLowerCase();
  if (value === "approved") return "Approved";
  if (value === "rejected") return "Rejected";
  if (value === "under review" || value === "review") return "Under Review";
  return "Pending";
};

const normalizeApplication = (item) => ({
  ...item,
  name: item.name || item.studentName || `${item.firstName || ""} ${item.lastName || ""}`.trim() || "Unnamed student",
  studentId: item.studentId || item.studentID || "Not provided",
  course: item.course || item.program || "Not provided",
  company: item.company || item.partnerCompany || "Not assigned",
  date: formatDateValue(item.dateSubmitted || item.date || item.createdAt),
  status: normalizeStatus(item.status),
  documents: item.documents || [],
});

function Application() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [courseFilter, setCourseFilter] = useState("All courses");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(formDefaults);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const pageSize = 10;

  useEffect(() => {
    return subscribeToCollection("applications", [], (items) => {
      setApplications(items.map(normalizeApplication));
      setLoading(false);
    }, (snapshotError) => {
      console.error("Unable to load applications:", snapshotError);
      setError(snapshotError.code === "permission-denied" ? "You do not have permission to view applications." : "Applications could not be loaded.");
      setApplications([]);
      setLoading(false);
    });
  }, [retryKey]);

  const courses = [...new Set(applications.map((item) => item.course).filter(Boolean))];
  const filtered = useMemo(() => applications.filter((item) => {
    const query = searchTerm.toLowerCase().trim();
    return (!query || `${item.name} ${item.id} ${item.studentId}`.toLowerCase().includes(query))
      && (statusFilter === "All statuses" || item.status === statusFilter)
      && (courseFilter === "All courses" || item.course === courseFilter)
      && (!dateFilter || item.date === dateFilter);
  }), [applications, courseFilter, dateFilter, searchTerm, statusFilter]);
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const counts = applications.reduce((result, item) => ({ ...result, [item.status]: (result[item.status] || 0) + 1 }), {});
  const showNotice = (message) => { setNotice(message); window.setTimeout(() => setNotice(""), 2600); };
  const filter = (setter, value) => { setter(value); setPage(1); };
  const resetFilters = () => { setSearchTerm(""); setStatusFilter("All statuses"); setCourseFilter("All courses"); setDateFilter(""); setPage(1); };
  const openCreate = () => { setEditing(null); setForm(formDefaults); setFormOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ name: item.name, studentId: item.studentId, course: item.course, company: item.company, email: item.email || "", phone: item.phone || "" }); setFormOpen(true); };
  const save = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.studentId.trim()) { showNotice("Student name and ID are required."); return; }
    setSaving(true);
    try {
      const data = { studentName: form.name.trim(), studentId: form.studentId.trim(), course: form.course.trim(), company: form.company.trim(), email: form.email.trim(), phone: form.phone.trim(), status: editing?.status?.toLowerCase() || "pending", createdBy: user?.uid || null };
      if (editing) await updateCollectionDocument("applications", editing.id, data);
      else await createCollectionDocument("applications", data);
      setFormOpen(false);
      showNotice(editing ? "Application updated." : "Application created.");
    } catch (saveError) { console.error("Unable to save application:", saveError); showNotice("Application could not be saved."); } finally { setSaving(false); }
  };
  const setStatus = async (item, nextStatus) => {
    try { await updateCollectionDocument("applications", item.id, { status: nextStatus.toLowerCase() }); setSelected(null); showNotice(`${item.name}'s application is now ${nextStatus.toLowerCase()}.`); }
    catch (statusError) { console.error("Unable to update application:", statusError); showNotice("Application status could not be updated."); }
  };
  const remove = async (item) => {
    try { await deleteCollectionDocument("applications", item.id); setSelected(null); showNotice("Application deleted."); }
    catch (deleteError) { console.error("Unable to delete application:", deleteError); showNotice("Application could not be deleted."); }
  };

  return (
    <main className="application-page">
      <header className="application-header"><div><p className="application-eyebrow">OJT management</p><h1>OJT Applications</h1><p className="application-subtitle">Manage and review student OJT applications</p></div><button type="button" className="application-primary" onClick={openCreate}><Plus size={17} /> New Application</button></header>
      <section className="application-summary" aria-label="Application summary"><Summary icon={<ClipboardList size={18} />} tone="summary-blue" label="Total Applications" value={loading ? "..." : applications.length} /><Summary icon={<CircleAlert size={18} />} tone="summary-amber" label="Pending Applications" value={loading ? "..." : counts.Pending || 0} /><Summary icon={<CheckCircle2 size={18} />} tone="summary-green" label="Approved Applications" value={loading ? "..." : counts.Approved || 0} /><Summary icon={<XCircle size={18} />} tone="summary-slate" label="Rejected Applications" value={loading ? "..." : counts.Rejected || 0} /></section>
      <section className="application-panel"><div className="application-toolbar"><label className="application-search"><Search size={17} /><span className="sr-only">Search applications</span><input placeholder="Search student name or application ID..." value={searchTerm} onChange={(event) => filter(setSearchTerm, event.target.value)} /></label><div className="application-controls"><label className="application-select"><select aria-label="Application status" value={statusFilter} onChange={(event) => filter(setStatusFilter, event.target.value)}><option>All statuses</option><option>Pending</option><option>Approved</option><option>Rejected</option><option>Under Review</option></select></label><label className="application-select"><select aria-label="Course" value={courseFilter} onChange={(event) => filter(setCourseFilter, event.target.value)}><option>All courses</option>{courses.map((course) => <option key={course}>{course}</option>)}</select></label><label className="application-select application-date"><input type="date" aria-label="Filter by date" value={dateFilter} onChange={(event) => filter(setDateFilter, event.target.value)} /></label><button type="button" className="filter-button" title="Clear filters" aria-label="Clear filters" onClick={resetFilters}><Filter size={16} /></button></div></div>
        {error && <div className="empty-applications" role="alert"><CircleAlert size={24} /><strong>{error}</strong><button type="button" className="application-primary" onClick={() => { setLoading(true); setError(""); setRetryKey((key) => key + 1); }}>Retry</button></div>}
        {loading && !error && <div className="empty-applications"><ClipboardList size={24} /><strong>Loading applications...</strong><span>Listening for live updates.</span></div>}
        {!loading && !error && <div className="application-table-wrap"><table className="application-table"><thead><tr><th>Application ID</th><th>Student Name</th><th>Course</th><th>Preferred Company</th><th>Date Submitted</th><th>Application Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visible.map((item, index) => <tr key={item.id}><td><strong className="company-cell">{item.id}</strong></td><td><div className="student-cell"><span className={`student-avatar avatar-${index % 2 ? "green" : "blue"}`}>{item.name.split(" ").map((part) => part[0]).join("")}</span><div><strong>{item.name}</strong><span>{item.studentId}</span></div></div></td><td>{item.course}</td><td className="company-cell">{item.company}</td><td className="date-cell">{item.date || "Not provided"}</td><td><span className={`application-status ${statusClasses[item.status]}`}>{item.status}</span></td><td><div className="application-action-group"><button type="button" className="application-action" title="View application" onClick={() => setSelected(item)}><Eye size={15} /></button><button type="button" className="application-action" title="Approve application" onClick={() => setStatus(item, "Approved")}><Check size={15} /></button><button type="button" className="application-action" title="Reject application" onClick={() => setStatus(item, "Rejected")}><X size={15} /></button><button type="button" className="application-action" title="Edit application" onClick={() => openEdit(item)}><Pencil size={15} /></button><button type="button" className="application-action" title="Delete application" onClick={() => remove(item)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table>{visible.length === 0 && <div className="empty-applications"><Search size={24} /><strong>No applications found</strong><span>Try changing your search or filters.</span></div>}</div>}
        <footer className="application-footer"><span>Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} applications</span><div className="partner-pagination"><button type="button" className="partner-page-button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={16} /></button><span className="footer-link">Page {page} of {pages}</span><button type="button" className="partner-page-button" disabled={page === pages} onClick={() => setPage((value) => value + 1)}><ChevronRight size={16} /></button></div></footer>
      </section>
      {selected && <ApplicationDetails item={selected} onClose={() => setSelected(null)} onApprove={() => setStatus(selected, "Approved")} onReject={() => setStatus(selected, "Rejected")} />}
      {formOpen && <ApplicationForm form={form} setForm={setForm} editing={editing} saving={saving} onClose={() => setFormOpen(false)} onSubmit={save} />}
      {notice && <div className="application-notice">{notice}</div>}
    </main>
  );
}

function Summary({ icon, tone, label, value }) { return <article className="application-summary-card"><span className={`summary-icon ${tone}`}>{icon}</span><div><strong>{value}</strong><span>{label}</span></div></article>; }
function ApplicationDetails({ item, onClose, onApprove, onReject }) { return <div className="application-modal-backdrop" role="presentation" onClick={(event) => event.target === event.currentTarget && onClose()}><section className="application-modal" role="dialog" aria-modal="true"><header className="application-modal-header"><div><h2>{item.name}</h2><p>{item.id} · {item.studentId}</p></div><button type="button" className="application-modal-close" onClick={onClose}><X size={17} /></button></header><div className="application-detail-grid"><div className="application-detail"><label>Course</label><strong>{item.course}</strong></div><div className="application-detail"><label>Status</label><span className={`application-status ${statusClasses[item.status]}`}>{item.status}</span></div><div className="application-detail"><label>Contact</label><p>{item.email || "No email"}<br />{item.phone || "No phone"}</p></div><div className="application-detail"><label>Partner company</label><strong>{item.company}</strong></div><div className="application-detail full"><label>Documents</label><p>{item.documents.length ? item.documents.join(", ") : "No documents recorded."}</p></div></div><footer className="application-modal-actions"><button type="button" className="application-primary" onClick={onApprove}>Approve</button><button type="button" className="application-secondary" onClick={onReject}>Reject</button></footer></section></div>; }
function ApplicationForm({ form, setForm, editing, saving, onClose, onSubmit }) { const update = (key, value) => setForm((current) => ({ ...current, [key]: value })); return <div className="application-modal-backdrop" role="presentation"><form className="application-modal" onSubmit={onSubmit}><header className="application-modal-header"><div><h2>{editing ? "Edit application" : "New application"}</h2><p>Save this application to Firestore.</p></div><button type="button" className="application-modal-close" onClick={onClose}><X size={17} /></button></header><div className="application-detail-grid">{[["name", "Student name"], ["studentId", "Student ID"], ["course", "Course"], ["company", "Partner company"], ["email", "Email"], ["phone", "Phone"]].map(([key, label]) => <label className="application-detail" key={key}><span>{label}</span><input type={key === "email" ? "email" : "text"} value={form[key]} onChange={(event) => update(key, event.target.value)} required={key === "name" || key === "studentId"} /></label>)}</div><footer className="application-modal-actions"><button type="button" className="application-secondary" onClick={onClose}>Cancel</button><button type="submit" className="application-primary" disabled={saving}>{saving ? "Saving..." : "Save application"}</button></footer></form></div>; }

export default Application;
