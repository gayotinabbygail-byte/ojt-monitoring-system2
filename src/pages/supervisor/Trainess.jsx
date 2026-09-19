import { useMemo, useState } from "react";
import { Eye, UserPlus } from "lucide-react";
import { PageHeader, SearchBox, Status } from "./SupervisorComponents";
import { students } from "./SupervisorData";

function Trainess() {
	const [query, setQuery] = useState("");
	const [status, setStatus] = useState("All");
	const filteredStudents = useMemo(() => students.filter((student) => {
		const matchesQuery = `${student.name} ${student.id} ${student.company}`.toLowerCase().includes(query.toLowerCase());
		return matchesQuery && (status === "All" || student.status === status);
	}), [query, status]);

	return <div className="supervisor-page"><PageHeader title="Students" description="Monitor the trainees assigned to your supervision." action={<button type="button" className="supervisor-primary"><UserPlus size={16} /> Add student</button>} /><section className="supervisor-panel supervisor-table-panel"><div className="supervisor-toolbar"><SearchBox value={query} onChange={setQuery} placeholder="Search by name, ID, or company..." /><select className="supervisor-select" value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>On OJT</option><option>Completed</option><option>Needs attention</option></select></div><div className="supervisor-table-wrap"><table className="supervisor-table"><thead><tr><th>Student</th><th>Course</th><th>Company</th><th>Progress</th><th>Status</th><th>Action</th></tr></thead><tbody>{filteredStudents.map((student) => <tr key={student.id}><td><strong>{student.name}</strong><br /><span>{student.id}</span></td><td>{student.course}</td><td>{student.company}</td><td><strong>{student.progress}%</strong><br /><span>{student.hours} hours</span></td><td><Status value={student.status} /></td><td><button type="button" className="supervisor-action secondary"><Eye size={14} /> View</button></td></tr>)}</tbody></table>{filteredStudents.length === 0 && <p className="supervisor-empty">No students match your search.</p>}</div></section></div>;
}

export default Trainess;
