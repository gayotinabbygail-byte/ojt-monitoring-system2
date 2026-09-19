import { BarChart3 } from "lucide-react";
import { PageHeader } from "./SupervisorComponents";
import { students } from "./SupervisorData";

function OJTHours() {
	const total = students.reduce((sum, student) => sum + student.hours, 0);
	return <div className="supervisor-page"><PageHeader title="OJT Hours" description="Track progress toward each trainee's required placement hours." /><section className="supervisor-kpi-row"><div className="supervisor-kpi"><span>Total tracked hours</span><strong>{total}</strong></div><div className="supervisor-kpi"><span>Required per trainee</span><strong>400</strong></div><div className="supervisor-kpi"><span>Average progress</span><strong>{Math.round(students.reduce((sum, student) => sum + student.progress, 0) / students.length)}%</strong></div></section><section className="supervisor-panel"><div className="supervisor-panel-heading"><div><h2>Hours by trainee</h2><p>Current logged hours and completion progress</p></div><BarChart3 size={20} color="#9aa8ba" /></div><div className="supervisor-list">{students.map((student) => <div className="supervisor-list-item" key={student.id}><div><strong>{student.name}</strong><span>{student.company} · {student.hours} of 400 hours</span></div><div style={{ minWidth: "150px" }}><div style={{ height: "7px", borderRadius: "99px", background: "#e9edf3" }}><div style={{ width: `${student.progress}%`, height: "100%", borderRadius: "99px", background: "#3576d3" }} /></div><small>{student.progress}% complete</small></div></div>)}</div></section></div>;
}

export default OJTHours;
