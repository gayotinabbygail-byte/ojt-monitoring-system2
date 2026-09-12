import { useAuth } from "../context/useAuth";
import {
    Activity,
    ArrowUpRight,
    Building2,
    CalendarDays,
    CheckCircle2,
    ClipboardClock,
    Clock3,
    FileCheck2,
    UserRoundCog,
    Users,
} from "lucide-react";
import "../styles/admin-dashboard.css";

function Dashboard() {
    const { user } = useAuth();

    const stats = [
        { label: "Total Students", value: "248", detail: "+12 this month", icon: Users, tone: "blue" },
        { label: "Partner Companies", value: "42", detail: "6 new partners", icon: Building2, tone: "teal" },
        { label: "OJT Coordinators", value: "18", detail: "All departments", icon: UserRoundCog, tone: "amber" },
        { label: "Pending Applications", value: "24", detail: "Needs review", icon: FileCheck2, tone: "coral" },
    ];

    const activities = [
        { title: "New application submitted", detail: "Maria Santos · BS Information Technology", time: "12 min ago", icon: FileCheck2 },
        { title: "Attendance record updated", detail: "Juan Dela Cruz · 8 hours logged", time: "1 hr ago", icon: ClipboardClock },
        { title: "Partner company added", detail: "Isabela Tech Solutions", time: "3 hrs ago", icon: Building2 },
        { title: "Evaluation completed", detail: "Greenfield Learning Center", time: "Yesterday", icon: CheckCircle2 },
    ];

    return (
        <div className="admin-dashboard">
            <section className="dashboard-intro">
                <div>
                    <p className="dashboard-eyebrow">LCCI · OJT MONITORING SYSTEM</p>
                    <h1>Admin Dashboard</h1>
                    <p className="dashboard-subtitle">Welcome back, {user?.firstName || "Admin"}! Here is today&apos;s placement overview.</p>
                </div>
                <button type="button" className="dashboard-date-button">
                    <CalendarDays size={16} />
                    September 12, 2026
                </button>
            </section>

            <section className="dashboard-stats" aria-label="OJT summary">
                {stats.map(({ label, value, detail, icon: Icon, tone }) => (
                    <article className="dashboard-stat" key={label}>
                        <div className={`stat-icon stat-icon-${tone}`}><Icon size={19} /></div>
                        <div className="stat-copy">
                            <p>{label}</p>
                            <strong>{value}</strong>
                            <span>{detail}</span>
                        </div>
                        <ArrowUpRight className="stat-arrow" size={17} />
                    </article>
                ))}
            </section>

            <section className="dashboard-grid">
                <article className="dashboard-panel">
                    <div className="panel-heading">
                        <div>
                            <p className="panel-kicker">Placement health</p>
                            <h2>OJT Statistics</h2>
                        </div>
                        <Activity size={20} />
                    </div>
                    <div className="progress-layout">
                        <div className="progress-ring">
                            <div><strong>73%</strong><span>on track</span></div>
                        </div>
                        <div className="progress-legend">
                            <div><span className="legend-dot legend-blue" /><p>Currently deployed <strong>181</strong></p></div>
                            <div><span className="legend-dot legend-teal" /><p>Completed OJT <strong>46</strong></p></div>
                            <div><span className="legend-dot legend-muted" /><p>Awaiting placement <strong>21</strong></p></div>
                        </div>
                    </div>
                    <p className="progress-footnote"><Clock3 size={14} /> Updated from the latest coordinator reports</p>
                </article>

                <article className="dashboard-panel">
                    <div className="panel-heading">
                        <div>
                            <p className="panel-kicker">Needs attention</p>
                            <h2>Application status</h2>
                        </div>
                        <span className="attention-count">24 pending</span>
                    </div>
                    <div className="attention-list">
                        <div className="attention-item"><div><strong>14</strong><p>For coordinator review</p></div><ArrowUpRight size={17} /></div>
                        <div className="attention-item"><div><strong>7</strong><p>Awaiting company response</p></div><ArrowUpRight size={17} /></div>
                        <div className="attention-item"><div><strong>3</strong><p>Missing student documents</p></div><ArrowUpRight size={17} /></div>
                    </div>
                </article>
            </section>

            <section className="dashboard-panel activity-panel">
                <div className="panel-heading">
                    <div>
                        <p className="panel-kicker">What&apos;s happening</p>
                        <h2>Recent Activities</h2>
                    </div>
                    <button type="button" className="text-button">View all</button>
                </div>
                <div className="activity-list">
                    {activities.map(({ title, detail, time, icon: Icon }) => (
                        <div className="activity-item" key={`${title}-${time}`}>
                            <div className="activity-icon"><Icon size={16} /></div>
                            <div className="activity-copy"><strong>{title}</strong><span>{detail}</span></div>
                            <time>{time}</time>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Dashboard;
