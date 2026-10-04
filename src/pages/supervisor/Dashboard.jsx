import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Activity, ArrowRight, CalendarCheck, ClipboardCheck, Clock3, FileText, Users } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { PageHeader, StatCard, Status } from "./SupervisorComponents";
import { db } from "../../services/firebase";
import { students } from "./SupervisorData";

function getLocalDate() {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Manila",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
}

function Dashboard() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [attendance, setAttendance] = useState([]);
	const [attendanceError, setAttendanceError] = useState("");
	const [attendanceLoading, setAttendanceLoading] = useState(true);
	const today = useMemo(() => getLocalDate(), []);

	useEffect(() => onSnapshot(
		query(collection(db, "attendance"), where("date", "==", today)),
		(snapshot) => {
			const records = snapshot.docs
				.map((document) => ({ id: document.id, ...document.data() }))
				.sort((left, right) => (right.updatedAt?.toMillis?.() || 0) - (left.updatedAt?.toMillis?.() || 0));
			setAttendance(records);
			setAttendanceLoading(false);
			setAttendanceError("");
		},
		(error) => {
			console.error("Unable to load live supervisor attendance:", error);
			setAttendanceError("Live attendance records could not be loaded. Check Firestore permissions.");
			setAttendanceLoading(false);
		},
	), [today]);

	const completed = students.filter((student) => student.status === "Completed").length;
	const attention = students.filter((student) => student.status === "Needs attention").length;
	const attendanceIssues = attendance.filter((record) =>
		record.status !== "Present" || !(record.timeIn || record.morningTimeIn) || !(record.timeOut || record.afternoonTimeOut)
	).length;
	const totalHours = attendance.reduce((total, record) => total + Number(record.totalHours ?? record.hours ?? 0), 0);
	const completionRate = Math.round((completed / students.length) * 100);

	return (
		<div className="supervisor-page">
			<PageHeader
				eyebrow="LCCI · Supervisor workspace"
				title="Supervisor Dashboard"
				description={`Welcome back, ${user?.firstName || user?.email || "Supervisor"}. Here is your current OJT monitoring overview.`}
			/>

			<section className="supervisor-grid" aria-label="Supervisor summary">
				<StatCard icon={Users} label="Assigned Students" value={students.length} detail="Active trainee records" />
				<StatCard icon={CalendarCheck} label="Attendance Issues" value={attendanceLoading ? "…" : attendanceIssues} detail="Incomplete records today" tone="coral" />
				<StatCard icon={Clock3} label="Today's Recorded Hours" value={attendanceLoading ? "…" : totalHours.toFixed(2)} detail="From today's attendance scans" tone="amber" />
				<StatCard icon={ClipboardCheck} label="Needs Review" value={attention} detail="Students needing follow-up" tone="teal" />
			</section>

			<section className="supervisor-dashboard-grid">
				<article className="supervisor-panel">
					<div className="supervisor-panel-heading"><div><h2>Placement health</h2><p>Progress across your assigned trainees</p></div><Activity size={20} color="#9aa8ba" /></div>
					<div className="supervisor-progress-row">
						<div className="supervisor-ring" style={{ "--progress": `${completionRate}%` }}><div><strong>{completionRate}%</strong><span>completed</span></div></div>
						<div className="supervisor-legend"><div><span>Currently on OJT</span><strong>{students.filter((student) => student.status === "On OJT").length}</strong></div><div><span>Completed OJT</span><strong>{completed}</strong></div><div><span>Needs attention</span><strong>{attention}</strong></div></div>
					</div>
				</article>

				<article className="supervisor-panel">
					<div className="supervisor-panel-heading"><div><h2>Live attendance list</h2><p>Today's scans · {today}</p></div><button type="button" className="supervisor-action secondary" onClick={() => navigate("/supervisor/scan-student-qr")}>Scan student QR <ArrowRight size={14} /></button></div>
					{attendanceError ? <p className="supervisor-error" role="alert">{attendanceError}</p> : attendanceLoading ? <p className="supervisor-muted">Loading attendance scans...</p> : attendance.length === 0 ? <p className="supervisor-muted">No student scans recorded today.</p> : <div className="supervisor-list">{attendance.slice(0, 6).map((record) => <div className="supervisor-list-item" key={record.id}><div><strong>{record.studentName || record.student || record.studentId || "Student"}</strong><span>{record.studentId || "Student ID unavailable"} · In {record.timeIn || record.morningTimeIn || "—"} · Out {record.timeOut || record.afternoonTimeOut || "—"}</span></div><Status value={record.timeOut || record.afternoonTimeOut ? "Complete" : "Time-In"} /></div>)}</div>}
				</article>
			</section>

			<section className="supervisor-two-column">
				<article className="supervisor-panel"><div className="supervisor-panel-heading"><div><h2>Recent trainee activity</h2><p>Latest placement status updates</p></div><button type="button" className="supervisor-action secondary" onClick={() => navigate("/supervisor/students")}>View students</button></div><div className="supervisor-list">{students.slice(0, 4).map((student) => <div className="supervisor-list-item" key={student.id}><div><strong>{student.name}</strong><span>{student.company} · {student.hours} hours logged</span></div><Status value={student.status} /></div>)}</div></article>
				<article className="supervisor-panel"><div className="supervisor-panel-heading"><div><h2>Quick actions</h2><p>Common supervisor tasks</p></div><FileText size={20} color="#9aa8ba" /></div><div className="supervisor-checklist"><button type="button" className="supervisor-action secondary" onClick={() => navigate("/supervisor/scan-student-qr")}>Scan student QR <ArrowRight size={14} /></button><button type="button" className="supervisor-action secondary" onClick={() => navigate("/supervisor/evaluations")}>Evaluate trainee <ArrowRight size={14} /></button><button type="button" className="supervisor-action secondary" onClick={() => navigate("/supervisor/reports")}>Review reports <ArrowRight size={14} /></button><button type="button" className="supervisor-action secondary" onClick={() => navigate("/supervisor/requirements")}>Check requirements <ArrowRight size={14} /></button></div></article>
			</section>
		</div>
	);
}

export default Dashboard;
