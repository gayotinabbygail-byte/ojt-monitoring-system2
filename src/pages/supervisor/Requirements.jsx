import { useState } from "react";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { PageHeader, Status } from "./SupervisorComponents";
import { students } from "./SupervisorData";

function Requirements() {
	const [checked, setChecked] = useState({ endorsement: true, agreement: true, medical: false, finalReport: false });
	const requirements = [["endorsement", "Endorsement letter", "Required before deployment"], ["agreement", "Training agreement", "Signed by student and company"], ["medical", "Medical certificate", "Must be submitted before start"], ["finalReport", "Final OJT report", "Required before completion"]];
	return <div className="supervisor-page"><PageHeader title="Requirements" description="Check the documents and milestones required for OJT completion." /><div className="supervisor-two-column"><section className="supervisor-panel"><div className="supervisor-panel-heading"><div><h2>Supervisor checklist</h2><p>Use this list to track shared requirements.</p></div><ClipboardList size={20} color="#9aa8ba" /></div><div className="supervisor-checklist">{requirements.map(([key, label, detail]) => <label className="supervisor-check" key={key}><span><strong>{label}</strong><br /><span>{detail}</span></span><input type="checkbox" checked={checked[key]} onChange={() => setChecked((current) => ({ ...current, [key]: !current[key] }))} /></label>)}</div></section><section className="supervisor-panel"><div className="supervisor-panel-heading"><div><h2>Student completion</h2><p>Requirement status by trainee</p></div><CheckCircle2 size={20} color="#9aa8ba" /></div><div className="supervisor-list">{students.map((student, index) => <div className="supervisor-list-item" key={student.id}><div><strong>{student.name}</strong><span>{index + 2} of 4 requirements complete</span></div><Status value={index < 2 ? "Ready" : "Pending"} /></div>)}</div></section></div></div>;
}

export default Requirements;
