import { useMemo, useState } from "react";
import {
    ArrowUpRight,
    CalendarDays,
    Check,
    ChevronDown,
    Clock3,
    FileText,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";
import "../../styles/application.css";

const applications = [
    { id: "APP-0248", student: "Mikaela Santos", program: "BS Information Technology", company: "Northstar Digital Solutions", submitted: "Sep 05, 2026", status: "Pending", initials: "MS", color: "blue" },
    { id: "APP-0247", student: "Joshua Lim", program: "BS Business Administration", company: "Crestline Retail Group", submitted: "Sep 04, 2026", status: "Approved", initials: "JL", color: "green" },
    { id: "APP-0246", student: "Angelica Cruz", program: "BS Accountancy", company: "Pillar & Co. CPAs", submitted: "Sep 03, 2026", status: "Pending", initials: "AC", color: "purple" },
    { id: "APP-0245", student: "Rafael Garcia", program: "BS Information Technology", company: "Brightline Systems", submitted: "Sep 02, 2026", status: "For revision", initials: "RG", color: "orange" },
    { id: "APP-0244", student: "Sofia Mendoza", program: "BS Hospitality Management", company: "The Harbor Hotel", submitted: "Sep 01, 2026", status: "Approved", initials: "SM", color: "teal" },
    { id: "APP-0243", student: "Daniel Reyes", program: "BS Marketing Management", company: "Studio 17 Creative", submitted: "Aug 30, 2026", status: "Declined", initials: "DR", color: "slate" },
];

const statusOptions = ["All applications", "Pending", "Approved", "For revision", "Declined"];

function Application() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All applications");

    const filteredApplications = useMemo(() => applications.filter((application) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = [application.student, application.company, application.id].some((value) => value.toLowerCase().includes(search));
        const matchesStatus = statusFilter === "All applications" || application.status === statusFilter;
        return matchesSearch && matchesStatus;
    }), [searchTerm, statusFilter]);

    return (
        <main className="application-page">
            <section className="application-header">
                <div>
                    <p className="application-eyebrow">OJT management</p>
                    <h1>Applications</h1>
                    <p className="application-subtitle">Review student applications and keep every placement moving forward.</p>
                </div>
                <button type="button" className="application-export"><FileText size={16} /> Export report</button>
            </section>

            <section className="application-summary" aria-label="Application summary">
                <div className="application-summary-card"><span className="summary-icon summary-blue"><FileText size={18} /></span><div><strong>128</strong><span>Total applications</span></div></div>
                <div className="application-summary-card"><span className="summary-icon summary-amber"><Clock3 size={18} /></span><div><strong>18</strong><span>Pending review</span></div></div>
                <div className="application-summary-card"><span className="summary-icon summary-green"><Check size={18} /></span><div><strong>94</strong><span>Approved</span></div></div>
                <div className="application-summary-card"><span className="summary-icon summary-slate"><CalendarDays size={18} /></span><div><strong>12</strong><span>Submitted this week</span></div></div>
            </section>

            <section className="application-panel">
                <div className="application-toolbar">
                    <div className="application-search"><Search size={17} /><input aria-label="Search applications" placeholder="Search student, company, or ID" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></div>
                    <div className="application-controls">
                        <div className="application-select"><SlidersHorizontal size={16} /><select aria-label="Filter applications" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{statusOptions.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={15} /></div>
                        <button type="button" className="filter-button"><CalendarDays size={16} /> Date <ChevronDown size={15} /></button>
                    </div>
                </div>

                <div className="application-table-wrap">
                    <table className="application-table">
                        <thead><tr><th>Student</th><th>Placement company</th><th>Submitted</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
                        <tbody>
                            {filteredApplications.map((application) => (
                                <tr key={application.id}>
                                    <td><div className="student-cell"><span className={`student-avatar avatar-${application.color}`}>{application.initials}</span><div><strong>{application.student}</strong><span>{application.id} · {application.program}</span></div></div></td>
                                    <td><span className="company-cell">{application.company}</span></td>
                                    <td><span className="date-cell">{application.submitted}</span></td>
                                    <td><span className={`application-status status-${application.status.toLowerCase().replace(" ", "-")}`}>{application.status}</span></td>
                                    <td><button type="button" className="application-action" title={`Open ${application.id}`} aria-label={`Open ${application.id}`}><ArrowUpRight size={17} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredApplications.length === 0 && <div className="empty-applications"><X size={24} /><strong>No applications found</strong><span>Try a different search or status filter.</span></div>}
                </div>
                <div className="application-footer"><span>Showing {filteredApplications.length} of 128 applications</span><button type="button" className="footer-link">View all applications <ArrowUpRight size={15} /></button></div>
            </section>
        </main>
    );
}

export default Application;