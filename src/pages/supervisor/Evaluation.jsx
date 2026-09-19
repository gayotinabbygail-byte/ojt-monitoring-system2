import { useState } from "react";
import { ClipboardCheck, Save } from "lucide-react";
import { PageHeader, Status } from "./SupervisorComponents";
import { students } from "./SupervisorData";

function Evaluation() {
	const [student, setStudent] = useState(students[0].name);
	const [rating, setRating] = useState("4");
	const [notes, setNotes] = useState("");
	const [message, setMessage] = useState("");
	const saveEvaluation = (event) => { event.preventDefault(); setMessage(`Evaluation saved for ${student}.`); };
	return <div className="supervisor-page"><PageHeader title="Evaluations" description="Complete and track performance evaluations for trainees." /><div className="supervisor-two-column"><section className="supervisor-panel"><div className="supervisor-panel-heading"><div><h2>New evaluation</h2><p>Record supervisor feedback and performance rating.</p></div><ClipboardCheck size={20} color="#9aa8ba" /></div><form className="supervisor-form" onSubmit={saveEvaluation}><div className="supervisor-field"><label htmlFor="evaluation-student">Trainee</label><select id="evaluation-student" className="supervisor-input" value={student} onChange={(event) => setStudent(event.target.value)}>{students.map((item) => <option key={item.id}>{item.name}</option>)}</select></div><div className="supervisor-field"><label htmlFor="evaluation-rating">Overall rating</label><select id="evaluation-rating" className="supervisor-input" value={rating} onChange={(event) => setRating(event.target.value)}><option value="5">5 - Excellent</option><option value="4">4 - Very good</option><option value="3">3 - Satisfactory</option><option value="2">2 - Needs improvement</option><option value="1">1 - Unsatisfactory</option></select></div><div className="supervisor-field"><label htmlFor="evaluation-notes">Feedback notes</label><textarea id="evaluation-notes" className="supervisor-textarea" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add constructive feedback..." /></div>{message && <p className="supervisor-message">{message}</p>}<button type="submit" className="supervisor-primary"><Save size={16} /> Save evaluation</button></form></section><section className="supervisor-panel"><div className="supervisor-panel-heading"><div><h2>Evaluation status</h2><p>Current review progress</p></div></div><div className="supervisor-list">{students.slice(0, 4).map((item, index) => <div className="supervisor-list-item" key={item.id}><div><strong>{item.name}</strong><span>{index < 2 ? "Submitted this month" : "Awaiting evaluation"}</span></div><Status value={index < 2 ? "Completed" : "Pending"} /></div>)}</div></section></div></div>;
}

export default Evaluation;
