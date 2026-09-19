import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { PageHeader, SearchBox, Status } from "./SupervisorComponents";
import { attendance, students } from "./SupervisorData";

function Attendance() {
	const [records, setRecords] = useState(attendance);
	const [query, setQuery] = useState("");
	const [selectedStudent, setSelectedStudent] = useState(students[0].name);
	const [message, setMessage] = useState("");
	const filtered = useMemo(() => records.filter((record) => record.student.toLowerCase().includes(query.toLowerCase())), [records, query]);
	const recordAttendance = () => { setRecords((current) => [{ date: new Date().toISOString().slice(0, 10), student: selectedStudent, timeIn: "08:00 AM", timeOut: "-", hours: 0, status: "Present" }, ...current]); setMessage(`Attendance recorded for ${selectedStudent}.`); };

	return <div className="supervisor-page"><PageHeader title="Attendance" description="Record and review daily attendance for your assigned trainees." action={<button type="button" className="supervisor-primary" onClick={recordAttendance}><Check size={16} /> Record attendance</button>} />{message && <p className="supervisor-message">{message}</p>}<section className="supervisor-panel supervisor-table-panel"><div className="supervisor-toolbar"><SearchBox value={query} onChange={setQuery} placeholder="Search attendance by student..." /><select className="supervisor-select" value={selectedStudent} onChange={(event) => setSelectedStudent(event.target.value)}>{students.map((student) => <option key={student.id}>{student.name}</option>)}</select></div><div className="supervisor-table-wrap"><table className="supervisor-table"><thead><tr><th>Date</th><th>Student</th><th>Time in</th><th>Time out</th><th>Hours</th><th>Status</th></tr></thead><tbody>{filtered.map((record, index) => <tr key={`${record.date}-${record.student}-${index}`}><td>{record.date}</td><td><strong>{record.student}</strong></td><td>{record.timeIn}</td><td>{record.timeOut}</td><td>{record.hours}</td><td><Status value={record.status} /></td></tr>)}</tbody></table></div></section><section className="supervisor-kpi-row"><div className="supervisor-kpi"><span>Present today</span><strong>{records.filter((record) => record.status === "Present").length}</strong></div><div className="supervisor-kpi"><span>Late records</span><strong>{records.filter((record) => record.status === "Late").length}</strong></div><div className="supervisor-kpi"><span>Total hours</span><strong>{records.reduce((total, record) => total + record.hours, 0)}</strong></div></section></div>;
}

export default Attendance;
