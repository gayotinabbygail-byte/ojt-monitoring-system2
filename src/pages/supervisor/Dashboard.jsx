import { useNavigate } from "react-router-dom";
import { Activity, ArrowRight, CalendarCheck, ClipboardCheck, Clock3, FileText, Users } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { PageHeader, StatCard, Status } from "./SupervisorComponents";
import { attendance, students } from "./SupervisorData";

function Dashboard() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const completed = students.filter((student) => student.status === "Completed").length;
	const attention = students.filter((student) => student.status === "Needs attention").length;
	const attendanceIssues = attendance.filter((record) => record.status !== "Present").length;
	const totalHours = students.reduce((total, student) => total + student.hours, 0);
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
				<StatCard icon={CalendarCheck} label="Attendance Issues" value={attendanceIssues} detail="Late or absent records" tone="coral" />
				<StatCard icon={Clock3} label="Total OJT Hours" value={totalHours} detail="Recorded by trainees" tone="amber" />
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
					<div className="supervisor-panel-heading"><div><h2>Attendance attention</h2><p>Records requiring follow-up</p></div><button type="button" className="supervisor-action secondary" onClick={() => navigate("/supervisor/attendance")}>Review <ArrowRight size={14} /></button></div>
					<div className="supervisor-list"><div className="supervisor-list-item"><div><strong>{attendance.filter((record) => record.status === "Absent").length}</strong><span>Absent records</span></div><Status value="Review" /></div><div className="supervisor-list-item"><div><strong>{attendance.filter((record) => record.status === "Late").length}</strong><span>Late records</span></div><Status value="Pending" /></div></div>
				</article>
			</section>

			<section className="supervisor-two-column">
				<article className="supervisor-panel"><div className="supervisor-panel-heading"><div><h2>Recent trainee activity</h2><p>Latest placement status updates</p></div><button type="button" className="supervisor-action secondary" onClick={() => navigate("/supervisor/students")}>View students</button></div><div className="supervisor-list">{students.slice(0, 4).map((student) => <div className="supervisor-list-item" key={student.id}><div><strong>{student.name}</strong><span>{student.company} · {student.hours} hours logged</span></div><Status value={student.status} /></div>)}</div></article>
				<article className="supervisor-panel"><div className="supervisor-panel-heading"><div><h2>Quick actions</h2><p>Common supervisor tasks</p></div><FileText size={20} color="#9aa8ba" /></div><div className="supervisor-checklist"><button type="button" className="supervisor-action secondary" onClick={() => navigate("/supervisor/attendance")}>Record attendance <ArrowRight size={14} /></button><button type="button" className="supervisor-action secondary" onClick={() => navigate("/supervisor/evaluations")}>Evaluate trainee <ArrowRight size={14} /></button><button type="button" className="supervisor-action secondary" onClick={() => navigate("/supervisor/reports")}>Review reports <ArrowRight size={14} /></button><button type="button" className="supervisor-action secondary" onClick={() => navigate("/supervisor/requirements")}>Check requirements <ArrowRight size={14} /></button></div></article>
			</section>
		</div>
	);
}

export default Dashboard;
