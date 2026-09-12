import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { db } from "../services/firebase";
import { getTimestampValue, subscribeToCollection } from "../services/firestoreDataService";
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

function relativeTime(value) {
    const date = getTimestampValue(value);
    if (!date) return "Recently";
    const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
    if (seconds < 172800) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [counts, setCounts] = useState({
        students: null,
        companies: null,
        coordinators: null,
        applications: null,
    });
    const [dashboardError, setDashboardError] = useState("");
    const [liveData, setLiveData] = useState({ applications: [], students: [], attendance: [], evaluations: [], companies: [] });
    const [liveLoading, setLiveLoading] = useState(true);

    useEffect(() => {
        const subscriptions = [
            {
                ref: collection(db, "students"),
                key: "students",
            },
            {
                ref: collection(db, "partnerCompanies"),
                key: "companies",
            },
            {
                ref: query(collection(db, "users"), where("role", "==", "coordinator")),
                key: "coordinators",
            },
            {
                ref: query(collection(db, "applications"), where("status", "==", "pending")),
                key: "applications",
            },
        ];

        const unsubscribe = subscriptions.map(({ ref, key }) => onSnapshot(
            ref,
            (snapshot) => {
                setCounts((current) => ({ ...current, [key]: snapshot.size }));
            },
            (error) => {
                console.error(`Unable to load dashboard ${key} count:`, error);
                setDashboardError("Some dashboard counts could not be loaded. Check your Firestore permissions.");
                setCounts((current) => ({ ...current, [key]: "—" }));
            },
        ));

        return () => unsubscribe.forEach((stopListening) => stopListening());
    }, []);

    useEffect(() => {
        const sources = ["applications", "students", "attendance", "evaluations", "partnerCompanies"];
        const unsubscribe = sources.map((collectionName) => subscribeToCollection(collectionName, [], (records) => {
            const key = collectionName === "partnerCompanies" ? "companies" : collectionName;
            setLiveData((current) => ({ ...current, [key]: records }));
            setLiveLoading(false);
        }, (error) => {
            console.error(`Unable to load dashboard ${collectionName} data:`, error);
            setDashboardError("Some dashboard data could not be loaded. Check your Firestore permissions.");
            setLiveLoading(false);
        }));

        return () => unsubscribe.forEach((stopListening) => stopListening());
    }, []);

    const basePath = user?.role === "coordinator" ? "/coordinator" : "/admin";
    const openRoute = (path) => navigate(`${basePath}/${path}`);

    const applicationStatus = liveData.applications.reduce((result, application) => {
        const status = String(application.status || "").toLowerCase();
        result.pending += status === "pending" ? 1 : 0;
        result.review += status === "under review" || status === "review" || status === "for coordinator review" ? 1 : 0;
        result.company += status.includes("company") || status === "awaiting response" ? 1 : 0;
        result.documents += application.documentsSubmitted === false || status.includes("document") || status.includes("missing") ? 1 : 0;
        return result;
    }, { pending: 0, review: 0, company: 0, documents: 0 });
    const placementStatus = liveData.students.reduce((result, student) => {
        const status = String(student.status || "").toLowerCase();
        const assigned = Boolean(student.company || student.partnerCompany || student.companyId);
        if (status === "completed" || status === "complete") result.completed += 1;
        else if (assigned || status === "active" || status === "ongoing" || status === "deployed") result.deployed += 1;
        else result.awaiting += 1;
        return result;
    }, { deployed: 0, completed: 0, awaiting: 0 });
    const placementTotal = liveData.students.length;
    const onTrackPercentage = placementTotal ? Math.round(((placementStatus.deployed + placementStatus.completed) / placementTotal) * 100) : 0;
    const activities = [
        ...liveData.applications.map((item) => ({ title: "Application updated", detail: `${item.studentName || item.name || "Student"} · ${item.status || "Pending"}`, date: item.updatedAt || item.createdAt || item.dateSubmitted, icon: FileCheck2 })),
        ...liveData.attendance.map((item) => ({ title: "Attendance record updated", detail: `${item.studentName || item.student || "Student"} · ${item.totalHours || item.hours || 0} hours logged`, date: item.updatedAt || item.createdAt || item.date, icon: ClipboardClock })),
        ...liveData.companies.map((item) => ({ title: "Partner company added", detail: item.name || item.companyName || "Partner company", date: item.createdAt || item.updatedAt, icon: Building2 })),
        ...liveData.evaluations.map((item) => ({ title: "Evaluation completed", detail: `${item.studentName || item.student || "Student"} · ${item.status || "Updated"}`, date: item.updatedAt || item.createdAt || item.date, icon: CheckCircle2 })),
    ].sort((first, second) => (getTimestampValue(second.date)?.getTime() || 0) - (getTimestampValue(first.date)?.getTime() || 0)).slice(0, 4).map((activity) => ({ ...activity, time: relativeTime(activity.date) }));

    const stats = [
        { label: "Total Students", value: counts.students, detail: "Live from students collection", icon: Users, tone: "blue", route: "students" },
        { label: "Partner Companies", value: counts.companies, detail: "Live from partner companies", icon: Building2, tone: "teal", route: "partnercompanies" },
        { label: "OJT Coordinators", value: counts.coordinators, detail: "Users with coordinator role", icon: UserRoundCog, tone: "amber", route: "ojtcoordinators" },
        { label: "Pending Applications", value: counts.applications, detail: "Applications with pending status", icon: FileCheck2, tone: "coral", route: "application" },
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
                {stats.map(({ label, value, detail, icon: Icon, tone, route }) => (
                    <article
                        className="dashboard-stat"
                        key={label}
                        role="button"
                        tabIndex="0"
                        onClick={() => openRoute(route)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                openRoute(route);
                            }
                        }}
                        aria-label={`Open ${label}`}
                    >
                        <div className={`stat-icon stat-icon-${tone}`}><Icon size={19} /></div>
                        <div className="stat-copy">
                            <p>{label}</p>
                            <strong>{value === null ? "..." : value}</strong>
                            <span>{detail}</span>
                        </div>
                        <ArrowUpRight className="stat-arrow" size={17} />
                    </article>
                ))}
            </section>
            {dashboardError && <p className="dashboard-data-error" role="alert">{dashboardError}</p>}

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
                        <div className="progress-ring" style={{ background: `conic-gradient(#3576d3 0 ${onTrackPercentage}%, #e9edf3 ${onTrackPercentage}% 100%)` }}>
                            <div><strong>{liveLoading ? "..." : `${onTrackPercentage}%`}</strong><span>on track</span></div>
                        </div>
                        <div className="progress-legend">
                            <div><span className="legend-dot legend-blue" /><p>Currently deployed <strong>{liveLoading ? "..." : placementStatus.deployed}</strong></p></div>
                            <div><span className="legend-dot legend-teal" /><p>Completed OJT <strong>{liveLoading ? "..." : placementStatus.completed}</strong></p></div>
                            <div><span className="legend-dot legend-muted" /><p>Awaiting placement <strong>{liveLoading ? "..." : placementStatus.awaiting}</strong></p></div>
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
                        <span className="attention-count">{liveLoading ? "..." : `${applicationStatus.pending} pending`}</span>
                    </div>
                    <div className="attention-list">
                        <div className="attention-item"><div><strong>{liveLoading ? "..." : applicationStatus.review}</strong><p>For coordinator review</p></div><ArrowUpRight size={17} /></div>
                        <div className="attention-item"><div><strong>{liveLoading ? "..." : applicationStatus.company}</strong><p>Awaiting company response</p></div><ArrowUpRight size={17} /></div>
                        <div className="attention-item"><div><strong>{liveLoading ? "..." : applicationStatus.documents}</strong><p>Missing student documents</p></div><ArrowUpRight size={17} /></div>
                    </div>
                </article>
            </section>

            <section className="dashboard-panel activity-panel">
                <div className="panel-heading">
                    <div>
                        <p className="panel-kicker">What&apos;s happening</p>
                        <h2>Recent Activities</h2>
                    </div>
                    <button type="button" className="text-button" onClick={() => navigate(`${basePath}/application`)}>View all</button>
                </div>
                <div className="activity-list">
                    {activities.map(({ title, detail, time, icon: Icon }, index) => (
                        <div className="activity-item" key={`${title}-${time}-${index}`}>
                            <div className="activity-icon"><Icon size={16} /></div>
                            <div className="activity-copy"><strong>{title}</strong><span>{detail}</span></div>
                            <time>{time}</time>
                        </div>
                    ))}
                </div>
                {!liveLoading && activities.length === 0 && <p className="progress-footnote">No recent Firestore activity is available yet.</p>}
            </section>
        </div>
    );
}

export default Dashboard;
