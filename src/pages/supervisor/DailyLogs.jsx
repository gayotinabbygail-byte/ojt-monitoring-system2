import { useState } from "react";
import { BookOpen, Save } from "lucide-react";
import { PageHeader } from "./SupervisorComponents";
import { students } from "./SupervisorData";

function DailyLogs() {
	const [student, setStudent] = useState(students[0].name);
	const [log, setLog] = useState("");
	const [message, setMessage] = useState("");
	const submitLog = (event) => { event.preventDefault(); setMessage(`Daily log saved for ${student}.`); setLog(""); };
	return <div className="supervisor-page"><PageHeader title="Daily Logs" description="Review and record trainee activities for each workday." /><div className="supervisor-two-column"><section className="supervisor-panel"><div className="supervisor-panel-heading"><div><h2>Add daily log</h2><p>Capture the trainee&apos;s completed activities.</p></div><BookOpen size={20} color="#9aa8ba" /></div><form className="supervisor-form" onSubmit={submitLog}><div className="supervisor-field"><label htmlFor="log-student">Trainee</label><select id="log-student" className="supervisor-input" value={student} onChange={(event) => setStudent(event.target.value)}>{students.map((item) => <option key={item.id}>{item.name}</option>)}</select></div><div className="supervisor-field"><label htmlFor="daily-log">Activity summary</label><textarea id="daily-log" className="supervisor-textarea" value={log} onChange={(event) => setLog(event.target.value)} placeholder="Describe tasks completed today..." required /></div>{message && <p className="supervisor-message">{message}</p>}<button type="submit" className="supervisor-primary"><Save size={16} /> Save daily log</button></form></section><section className="supervisor-panel"><div className="supervisor-panel-heading"><div><h2>Recent logs</h2><p>Latest activity entries</p></div></div><div className="supervisor-list">{students.slice(0, 4).map((item, index) => <div className="supervisor-list-item" key={item.id}><div><strong>{item.name}</strong><span>{index + 1 === 1 ? "Today" : `Sep ${18 - index}, 2026`} · {index + 2} tasks recorded</span></div><span className="supervisor-status">Logged</span></div>)}</div></section></div></div>;
}

export default DailyLogs;
