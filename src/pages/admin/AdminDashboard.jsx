import {
    Activity,
    ArrowUpRight,
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileCheck2,
    GraduationCap,
    Users,
} from "lucide-react";
import "../../styles/admin-dashboard.css";

const stats = [
    {
        label: "Total students",
        value: "128",
        change: "+12 this month",
        icon: GraduationCap,
        tone: "blue",
    },
    {
        label: "Active placements",
        value: "94",
        change: "73% of students",
        icon: BriefcaseBusiness,
        tone: "teal",
    },
    {
        label: "Pending applications",
        value: "18",
        change: "7 need review today",
        icon: FileCheck2,
        tone: "amber",
    },
    {
        label: "Partner companies",
        value: "36",
        change: "+4 since last term",
        icon: Users,
        tone: "coral",
    },
];

const attentionItems = [
    { label: "Applications awaiting review", value: "18", action: "Review queue" },
    { label: "Students missing attendance", value: "07", action: "View attendance" },
    { label: "Evaluations due this week", value: "12", action: "Open evaluations" },
];

const activities = [
    { title: "New application submitted", detail: "Mikaela Santos · Marketing Intern", time: "12 min ago", icon: FileCheck2 },
    { title: "Attendance report completed", detail: "Information Technology · Week 24", time: "48 min ago", icon: CheckCircle2 },
    { title: "New partner company added", detail: "Northstar Digital Solutions", time: "2 hrs ago", icon: BriefcaseBusiness },
    { title: "Coordinator account updated", detail: "Arvin Reyes · OJT Coordinator", time: "Yesterday", icon: Users },
];

function AdminDashboard() {
    return (
        <main className="admin-dashboard">
            <section className="dashboard-intro">
                <div>
                    <p className="dashboard-eyebrow">Monday, September 5, 2026</p>
                    <h1>Good morning, Admin.</h1>
                    <p className="dashboard-subtitle">Here&apos;s what&apos;s happening across your OJT program today.</p>
                </div>
                <button type="button" className="dashboard-date-button">
                    <CalendarDays size={17} />
                    This semester
                </button>
            </section>

            <section className="dashboard-stats" aria-label="Program overview">
                {stats.map(({ label, value, change, icon: Icon, tone }) => (
                    <article className="dashboard-stat" key={label}>
                        <div className={`stat-icon stat-icon-${tone}`}><Icon size={20} /></div>
                        <div className="stat-copy">
                            <p>{label}</p>
                            <strong>{value}</strong>
                            <span>{change}</span>
                        </div>
                        <ArrowUpRight className="stat-arrow" size={18} />
                    </article>
                ))}
            </section>

            <section className="dashboard-grid">
                <article className="dashboard-panel progress-panel">
                    <div className="panel-heading">
                        <div>
                            <p className="panel-kicker">Placement progress</p>
                            <h2>Program snapshot</h2>
                        </div>
                        <Activity size={21} />
                    </div>
                    <div className="progress-layout">
                        <div className="progress-ring" aria-label="73 percent of students are placed">
                            <div><strong>73%</strong><span>placed</span></div>
                        </div>
                        <div className="progress-legend">
                            <div><span className="legend-dot legend-blue" /><p>Active placements <strong>94</strong></p></div>
                            <div><span className="legend-dot legend-teal" /><p>Completed <strong>25</strong></p></div>
                            <div><span className="legend-dot legend-muted" /><p>Awaiting placement <strong>09</strong></p></div>
                        </div>
                    </div>
                    <div className="progress-footnote"><Clock3 size={15} /> Placement target: 85% by October 30</div>
                </article>

                <article className="dashboard-panel attention-panel">
                    <div className="panel-heading">
                        <div>
                            <p className="panel-kicker">Needs attention</p>
                            <h2>Keep things moving</h2>
                        </div>
                        <span className="attention-count">37 total</span>
                    </div>
                    <div className="attention-list">
                        {attentionItems.map((item) => (
                            <div className="attention-item" key={item.label}>
                                <div><strong>{item.value}</strong><p>{item.label}</p></div>
                                <button type="button" aria-label={item.action} title={item.action}><ArrowUpRight size={17} /></button>
                            </div>
                        ))}
                    </div>
                </article>
            </section>

            <section className="dashboard-panel activity-panel">
                <div className="panel-heading">
                    <div><p className="panel-kicker">Live feed</p><h2>Recent activity</h2></div>
                    <button type="button" className="text-button">View all <ArrowUpRight size={15} /></button>
                </div>
                <div className="activity-list">
                    {activities.map(({ title, detail, time, icon: Icon }) => (
                        <div className="activity-item" key={`${title}-${time}`}>
                            <div className="activity-icon"><Icon size={17} /></div>
                            <div className="activity-copy"><strong>{title}</strong><span>{detail}</span></div>
                            <time>{time}</time>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}

export default AdminDashboard;
